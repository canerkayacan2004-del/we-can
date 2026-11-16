// İstemcinin "sunucu" ile konuştuğu tek arayüz.
// Yerel mod (LocalBackend) ve ileride bulut modu (Supabase) aynı arayüzü uygular;
// ekranlar hangisinin çalıştığını bilmek zorunda değildir.
import type { PlacementResult } from '@core/engine.ts';
import type { Appearance, Exercise, LessonResult, Note, PracticeResult, Profile, Responses, ReviewResult, UserState } from '@core/types.ts';

export interface Session {
  userId: string;
  email: string;
}

export interface ServiceLine {
  connected: boolean;
  titleTr: string;
  detailTr: string;
}

export interface ServiceStatus {
  mode: 'local' | 'cloud';
  cloud: ServiceLine;
  ai: ServiceLine;
  tts: ServiceLine;
  stt: ServiceLine;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export type AiReply =
  | { ok: true; text: string; correctionsTr?: string[]; finished?: boolean }
  | { ok: false; reason: 'not_connected' | 'quota' | 'error'; messageTr: string };

export type ProfilePatch = Partial<Pick<Profile, 'displayName' | 'goal' | 'dailyMinutes' | 'interests' | 'hobbies' | 'studyDays' | 'studyTime' | 'avatar' | 'onboardingDone'>>;

export interface Backend {
  status(): ServiceStatus;
  getSession(): Promise<Session | null>;
  signUp(email: string, password: string, displayName: string): Promise<Session>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  deleteAccount(password: string): Promise<void>;

  getState(): Promise<UserState>;
  saveProfile(patch: ProfilePatch): Promise<UserState>;
  saveAppearance(appearance: Appearance): Promise<UserState>;
  /** answers null ise seviye tespit atlanır ve A1'den başlanır. */
  submitPlacement(answers: Record<string, number> | null): Promise<{ state: UserState; result: PlacementResult | null }>;
  resetPlacement(): Promise<UserState>;
  completeLesson(code: string, responses: Responses, seconds: number): Promise<{ state: UserState; result: LessonResult }>;
  answerReview(itemId: string, result: ReviewResult, seconds: number): Promise<UserState>;
  setVocabNote(vocabId: string, note: string): Promise<UserState>;

  practiceSet(): Promise<Exercise[]>;
  completePractice(exerciseIds: string[], responses: Responses, seconds: number): Promise<{ state: UserState; result: PracticeResult }>;
  completeAudio(session: { correct: number; total: number; seconds: number }): Promise<{ state: UserState; xp: number }>;
  /** Günlük kelime kartını tamamlar: learn=true ise deftere ve tekrara eklenir. */
  markDailyWord(wordId: string, learn: boolean): Promise<{ state: UserState; xp: number }>;
  /** Kelime oyunu sonucunu kaydeder (istatistik + günlük sınırlı XP). */
  recordGame(game: 'wordle' | 'scramble', result: { won: boolean; tries?: number; daily?: boolean; streak?: number }): Promise<{ state: UserState; xp: number }>;
  saveNote(note: Partial<Note> & { title: string; body: string }): Promise<UserState>;
  deleteNote(id: string): Promise<UserState>;

  /** Hesap verisini dışa aktarır (yedek). */
  exportData(): Promise<string>;

  aiChat(request: { lessonCode: string; messages: ChatMessage[] }): Promise<AiReply>;
  aiWriting(request: { lessonCode: string; taskId: string; text: string }): Promise<AiReply>;

  /** Yalnızca yerel modda bulunan yardımcılar. */
  dev?: {
    makeReviewsDueToday(): Promise<UserState>;
  };
}

export class BackendError extends Error {}
