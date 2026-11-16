// YEREL MOD
// Supabase hesabı bağlanana kadar kullanılan veri katmanı. Hesaplar ve ilerleme yalnızca
// bu bilgisayarda (uygulamanın yerel deposunda) tutulur. Kurallar packages/core içindeki
// aynı fonksiyonlarla hesaplanır; bulut modunda bu fonksiyonlar sunucuda çalışacaktır.
// Şifreler PBKDF2 ile özetlenerek saklanır; ancak bilgisayara erişimi olan biri verileri
// değiştirebilir. Bu yüzden bu mod, bulut sürümü gelene kadar kişisel kullanım içindir.
import {
  aiAllowance, answerReview, applyPlacement, consumeAi, completeAudio, completeLesson, completePractice, dayKey, deleteNote, ensureDaily,
  migrateState, mistakeExerciseIds, newUserState, saveNote, scorePlacement,
} from '@core/engine.ts';
import type { Appearance, Exercise, Note, Responses, UserState } from '@core/types.ts';
import { DASHBOARD_WIDGETS, STUDY_TIMES } from '@core/types.ts';
import { THEMES, isHexColor } from '../theme.ts';
import { placementQuestions } from '@content/placement.ts';
import { curriculum, getExercise, getLessonContent, getVocabItem, todaysWords } from '../content.ts';
import { markDailyWord } from '@core/daily.ts';
import { recordGame } from '@core/games.ts';
import { BackendError } from './types.ts';
import type { AiReply, Backend, ChatMessage, ProfilePatch, ServiceStatus, Session } from './types.ts';
import { cloudAiChat, cloudAiConfig, cloudAiWriting } from './cloudAi.ts';

declare const __WECAN_CONFIG__: Record<string, string>;

interface Account {
  userId: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
}

const KEY_ACCOUNTS = 'wecan.local.accounts';
const KEY_SESSION = 'wecan.local.session';
const stateKey = (userId: string) => `wecan.local.state.${userId}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  if (crypto.subtle) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100_000 },
      key,
      256,
    );
    return 'pbkdf2:' + Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  // crypto.subtle yoksa (çok nadir) basit bir özet kullanılır; yerel test modu için yeterlidir.
  let h = 5381;
  const input = salt + '|' + password;
  for (let round = 0; round < 2000; round++) {
    for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i) + round) | 0;
  }
  return 'simple:' + (h >>> 0).toString(16);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LocalBackend implements Backend {
  status(): ServiceStatus {
    const hasCloudConfig = Boolean(__WECAN_CONFIG__.WECAN_SUPABASE_URL && __WECAN_CONFIG__.WECAN_SUPABASE_ANON_KEY);
    const hasTts = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return {
      mode: 'local',
      cloud: {
        connected: false,
        titleTr: 'Bulut hesabı (Supabase)',
        detailTr: hasCloudConfig
          ? 'Supabase ayarları bulundu, ancak bulut bağlantısı bu sürümde henüz etkin değil. Şimdilik yerel mod kullanılıyor.'
          : 'Bağlı değil. Hesaplar ve ilerleme yalnızca bu bilgisayarda saklanıyor (yerel mod). Başka bir bilgisayara taşımak için Ayarlar → Verilerim → Dışa aktar.',
      },
      ai: cloudAiConfig()
        ? {
            connected: true,
            titleTr: 'AI öğretmen (Gemini, sunucu üzerinden)',
            detailTr: 'Bağlı. İstekler Supabase sunucu fonksiyonu üzerinden gider; API anahtarı uygulamada bulunmaz. Ücretsiz planda günde 20 konuşma ve 20 yazı değerlendirmesi.',
          }
        : {
            connected: false,
            titleTr: 'AI öğretmen',
            detailTr: 'Bağlı değil. API anahtarı güvenlik nedeniyle yalnızca sunucuda durur; sunucu (Supabase) bağlanmadan canlı AI çalışmaz. Konuşma derslerinde hazır diyalog pratiği kullanılır.',
          },
      tts: {
        connected: hasTts,
        titleTr: 'Seslendirme',
        detailTr: hasTts
          ? 'Bilgisayarın kendi sesleriyle çalışıyor. Bu gerçek bir insan kaydı değildir.'
          : 'Bu bilgisayarda seslendirme bulunamadı; dinleme alıştırmalarında metin gösterilebilir.',
      },
      stt: {
        connected: false,
        titleTr: 'Sesli konuşma ve telaffuz ölçümü',
        detailTr: 'Yok. Konuşma pratiği yazılı yapılır; telaffuz ve akıcılık ölçülmez.',
      },
    };
  }

  private accounts(): Account[] {
    return read<Account[]>(KEY_ACCOUNTS, []);
  }
  private currentUserId(): string {
    const id = read<string | null>(KEY_SESSION, null);
    if (!id || !this.accounts().some((a) => a.userId === id)) throw new BackendError('Oturum bulunamadı. Lütfen yeniden giriş yap.');
    return id;
  }
  private load(userId: string): UserState {
    const raw = read<UserState | null>(stateKey(userId), null);
    if (!raw) throw new BackendError('Kullanıcı verisi bulunamadı.');
    return raw.version === 2 ? raw : migrateState(raw);
  }
  private run<T>(fn: () => T): T {
    try {
      return fn();
    } catch (err) {
      if (err instanceof BackendError) throw err;
      throw new BackendError(err instanceof Error ? err.message : 'İşlem tamamlanamadı.');
    }
  }
  private save(userId: string, state: UserState): UserState {
    write(stateKey(userId), state);
    return state;
  }

  async getSession(): Promise<Session | null> {
    const id = read<string | null>(KEY_SESSION, null);
    const account = this.accounts().find((a) => a.userId === id);
    return account ? { userId: account.userId, email: account.email } : null;
  }

  async signUp(emailRaw: string, password: string, displayNameRaw: string): Promise<Session> {
    const email = emailRaw.trim().toLowerCase();
    const displayName = displayNameRaw.trim();
    if (!displayName) throw new BackendError('Lütfen adını yaz.');
    if (!EMAIL_RE.test(email)) throw new BackendError('Geçerli bir e-posta adresi yaz.');
    if (password.length < 6) throw new BackendError('Şifre en az 6 karakter olmalı.');
    const accounts = this.accounts();
    if (accounts.some((a) => a.email === email)) throw new BackendError('Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.');
    const salt = randomId();
    const account: Account = { userId: randomId(), email, salt, hash: await hashPassword(password, salt), createdAt: new Date().toISOString() };
    write(KEY_ACCOUNTS, [...accounts, account]);
    this.save(account.userId, newUserState(displayName, new Date()));
    write(KEY_SESSION, account.userId);
    return { userId: account.userId, email };
  }

  async signIn(emailRaw: string, password: string): Promise<Session> {
    const email = emailRaw.trim().toLowerCase();
    const account = this.accounts().find((a) => a.email === email);
    if (!account || account.hash !== (await hashPassword(password, account.salt))) {
      throw new BackendError('E-posta veya şifre hatalı.');
    }
    write(KEY_SESSION, account.userId);
    return { userId: account.userId, email };
  }

  async signOut(): Promise<void> {
    localStorage.removeItem(KEY_SESSION);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const userId = this.currentUserId();
    const accounts = this.accounts();
    const account = accounts.find((a) => a.userId === userId)!;
    if (account.hash !== (await hashPassword(oldPassword, account.salt))) throw new BackendError('Mevcut şifre hatalı.');
    if (newPassword.length < 6) throw new BackendError('Yeni şifre en az 6 karakter olmalı.');
    account.salt = randomId();
    account.hash = await hashPassword(newPassword, account.salt);
    write(KEY_ACCOUNTS, accounts);
  }

  async deleteAccount(password: string): Promise<void> {
    const userId = this.currentUserId();
    const account = this.accounts().find((a) => a.userId === userId)!;
    if (account.hash !== (await hashPassword(password, account.salt))) throw new BackendError('Şifre hatalı. Hesap silinmedi.');
    write(KEY_ACCOUNTS, this.accounts().filter((a) => a.userId !== userId));
    localStorage.removeItem(stateKey(userId));
    localStorage.removeItem(KEY_SESSION);
  }

  async getState(): Promise<UserState> {
    const userId = this.currentUserId();
    const state = this.load(userId);
    const fresh = ensureDaily(state, dayKey(new Date()));
    return fresh === state ? state : this.save(userId, fresh);
  }

  async saveProfile(patch: ProfilePatch): Promise<UserState> {
    const userId = this.currentUserId();
    const state = this.load(userId);
    const profile = { ...state.profile };
    if (patch.displayName !== undefined) {
      const name = patch.displayName.trim();
      if (!name) throw new BackendError('Ad boş olamaz.');
      profile.displayName = name.slice(0, 40);
    }
    if (patch.goal !== undefined) profile.goal = patch.goal.slice(0, 200);
    if (patch.dailyMinutes !== undefined) profile.dailyMinutes = Math.min(120, Math.max(5, Math.round(patch.dailyMinutes)));
    const cleanList = (list: unknown[]) => [...new Set(list.filter((x): x is string => typeof x === 'string').map((x) => x.trim().slice(0, 40)).filter(Boolean))].slice(0, 24);
    if (patch.interests !== undefined) profile.interests = cleanList(patch.interests);
    if (patch.hobbies !== undefined) profile.hobbies = cleanList(patch.hobbies);
    if (patch.studyDays !== undefined) {
      const days = [...new Set(patch.studyDays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
      if (!days.length) throw new BackendError('En az bir çalışma günü seçmelisin.');
      profile.studyDays = days;
    }
    if (patch.avatar !== undefined) {
      if (patch.avatar === null || patch.avatar === '') profile.avatar = null;
      else if (typeof patch.avatar === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(patch.avatar) && patch.avatar.length <= 120_000) profile.avatar = patch.avatar;
      else throw new BackendError('Fotoğraf kaydedilemedi: geçersiz veya çok büyük görsel.');
    }
    if (patch.studyTime !== undefined) {
      if (!STUDY_TIMES.includes(patch.studyTime)) throw new BackendError('Geçersiz çalışma zamanı.');
      profile.studyTime = patch.studyTime;
    }
    if (patch.onboardingDone !== undefined) profile.onboardingDone = patch.onboardingDone;
    return this.save(userId, { ...state, profile });
  }

  async saveAppearance(appearance: Appearance): Promise<UserState> {
    const userId = this.currentUserId();
    const state = this.load(userId);
    const clean: Appearance = {
      theme: THEMES.some((t) => t.id === appearance.theme) ? appearance.theme : 'neon',
      accent: isHexColor(appearance.accent) ? appearance.accent : null,
      scale: Math.min(1.2, Math.max(0.9, Number(appearance.scale) || 1)),
      motion: !!appearance.motion,
      sound: !!appearance.sound,
      dashboard: (appearance.dashboard ?? []).filter((w) => (DASHBOARD_WIDGETS as readonly string[]).includes(w)),
    };
    return this.save(userId, { ...state, profile: { ...state.profile, appearance: clean } });
  }

  async submitPlacement(answers: Record<string, number> | null) {
    const userId = this.currentUserId();
    const result = answers ? scorePlacement(placementQuestions, answers) : null;
    const state = this.save(userId, applyPlacement(this.load(userId), curriculum, result, new Date()));
    return { state, result };
  }

  async resetPlacement(): Promise<UserState> {
    const userId = this.currentUserId();
    const state = this.load(userId);
    return this.save(userId, { ...state, profile: { ...state.profile, placementDone: false } });
  }

  async completeLesson(code: string, responses: Responses, seconds: number) {
    const userId = this.currentUserId();
    const content = getLessonContent(code);
    if (!content) throw new BackendError('Bu dersin içeriği henüz hazır değil.');
    const out = this.run(() => completeLesson(this.load(userId), curriculum, content, responses, new Date(), seconds));
    this.save(userId, out.state);
    return out;
  }

  async answerReview(itemId: string, result: Parameters<Backend['answerReview']>[1], seconds: number): Promise<UserState> {
    const userId = this.currentUserId();
    return this.save(userId, this.run(() => answerReview(this.load(userId), itemId, result, new Date(), seconds)));
  }

  async practiceSet(): Promise<Exercise[]> {
    const state = this.load(this.currentUserId());
    return mistakeExerciseIds(state).map((id) => getExercise(id)).filter((e): e is Exercise => !!e);
  }

  async completePractice(exerciseIds: string[], responses: Responses, seconds: number) {
    const userId = this.currentUserId();
    const exercises = exerciseIds.map((id) => getExercise(id)).filter((e): e is Exercise => !!e);
    const out = this.run(() => completePractice(this.load(userId), exercises, responses, new Date(), seconds));
    this.save(userId, out.state);
    return out;
  }

  async markDailyWord(wordId: string, learn: boolean) {
    const userId = this.currentUserId();
    const now = new Date();
    const today = dayKey(now);
    const state = this.load(userId);
    const ids = todaysWords(state, today).map((w) => w.id);
    const word = getVocabItem(wordId);
    if (!word) throw new BackendError('Kelime bulunamadı.');
    const out = this.run(() => markDailyWord(state, word, learn, ids, now, today));
    this.save(userId, out.state);
    return out;
  }

  async recordGame(game: 'wordle' | 'scramble', result: { won: boolean; tries?: number; daily?: boolean; streak?: number }) {
    if (game !== 'wordle' && game !== 'scramble') throw new BackendError('Geçersiz oyun.');
    const userId = this.currentUserId();
    const now = new Date();
    const out = this.run(() => recordGame(this.load(userId), game, { won: !!result.won, tries: Number(result.tries) || undefined, daily: !!result.daily, streak: Number(result.streak) || 0 }, now, dayKey(now)));
    this.save(userId, out.state);
    return out;
  }

  async completeAudio(session: { correct: number; total: number; seconds: number }) {
    const userId = this.currentUserId();
    const out = this.run(() => completeAudio(this.load(userId), session, new Date()));
    this.save(userId, out.state);
    return { state: out.state, xp: out.xp };
  }

  async saveNote(note: Partial<Note> & { title: string; body: string }): Promise<UserState> {
    const userId = this.currentUserId();
    return this.save(userId, this.run(() => saveNote(this.load(userId), note, new Date(), randomId())));
  }

  async deleteNote(id: string): Promise<UserState> {
    const userId = this.currentUserId();
    return this.save(userId, deleteNote(this.load(userId), id));
  }

  async exportData(): Promise<string> {
    const session = await this.getSession();
    const state = this.load(this.currentUserId());
    return JSON.stringify({ app: 'We Can', exportedAt: new Date().toISOString(), email: session?.email, state }, null, 2);
  }

  async setVocabNote(vocabId: string, note: string): Promise<UserState> {
    const userId = this.currentUserId();
    const state = this.load(userId);
    if (!state.vocab[vocabId]) throw new BackendError('Bu kelime defterinde yok.');
    const vocab = { ...state.vocab, [vocabId]: { ...state.vocab[vocabId], note: note.trim().slice(0, 300) || undefined } };
    return this.save(userId, { ...state, vocab });
  }

  async aiChat(request: { lessonCode: string; messages: ChatMessage[] }): Promise<AiReply> {
    if (!cloudAiConfig()) return { ok: false, reason: 'not_connected', messageTr: this.status().ai.detailTr };
    const userId = this.currentUserId();
    const reply = await cloudAiChat(userId, request.lessonCode, request.messages);
    // Sunucu hakkı kendisi sayar; burada yalnızca ekrandaki sayaç güncellenir.
    if (reply.ok && request.messages.filter((m) => m.role === 'user').length === 1) this.mirrorAi(userId, 'conversation');
    if (!reply.ok && reply.reason === 'quota') this.mirrorAi(userId, 'conversation', true);
    return reply;
  }
  async aiWriting(request: { lessonCode: string; taskId: string; text: string }): Promise<AiReply> {
    if (!cloudAiConfig()) return { ok: false, reason: 'not_connected', messageTr: this.status().ai.detailTr };
    const userId = this.currentUserId();
    const reply = await cloudAiWriting(userId, request.lessonCode, request.taskId, request.text);
    if (reply.ok) this.mirrorAi(userId, 'writing');
    if (!reply.ok && reply.reason === 'quota') this.mirrorAi(userId, 'writing', true);
    return reply;
  }

  private mirrorAi(userId: string, kind: 'conversation' | 'writing', exhausted = false): void {
    let state = this.load(userId);
    try {
      if (exhausted) {
        while (aiAllowance(state, kind, dayKey(new Date())).allowed) state = consumeAi(state, kind, new Date());
      } else {
        state = consumeAi(state, kind, new Date());
      }
    } catch {
      return;
    }
    this.save(userId, state);
  }

  dev = {
    makeReviewsDueToday: async (): Promise<UserState> => {
      const userId = this.currentUserId();
      const state = this.load(userId);
      const today = dayKey(new Date());
      const reviews = state.reviews.map((r) => (r.status === 'active' ? { ...r, due: today } : r));
      return this.save(userId, { ...state, reviews });
    },
  };
}
