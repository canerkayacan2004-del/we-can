// Bulut AI istemcisi: AI öğretmen isteklerini Supabase sunucu fonksiyonuna gönderir.
// Uygulamada YALNIZCA herkese açık değerler bulunur (proje adresi ve "anon" anahtarı).
// Gemini API anahtarı uygulamada hiç bulunmaz; yalnızca Supabase'in gizli değişkenlerinde durur.
//
// Kimlik: Her yerel hesap için Supabase'de anonim bir oturum açılır. Günlük AI hakkı bu
// oturuma göre sunucuda sayılır.
import type { AiReply, ChatMessage } from './types.ts';

declare const __WECAN_CONFIG__: Record<string, string>;

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms
}

const KEY_PREFIX = 'wecan.cloudai.';

export function cloudAiConfig(): { url: string; anonKey: string } | null {
  const url = (__WECAN_CONFIG__.WECAN_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const anonKey = __WECAN_CONFIG__.WECAN_SUPABASE_ANON_KEY ?? '';
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url) || !anonKey) return null;
  return { url, anonKey };
}

function readSession(localUserId: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + localUserId);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(localUserId: string, s: StoredSession | null): void {
  try {
    if (s) localStorage.setItem(KEY_PREFIX + localUserId, JSON.stringify(s));
    else localStorage.removeItem(KEY_PREFIX + localUserId);
  } catch {
    /* depolama kullanılamıyorsa oturum yalnızca bu açılış için geçerli olur */
  }
}

async function authRequest(path: string, body: unknown): Promise<StoredSession> {
  const cfg = cloudAiConfig()!;
  const res = await fetch(`${cfg.url}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: cfg.anonKey, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    const msg = String(data.msg ?? data.error_description ?? data.message ?? res.status);
    if (/anonymous/i.test(msg)) throw new Error('ANON_DISABLED');
    throw new Error(msg);
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };
}

async function ensureSession(localUserId: string): Promise<StoredSession> {
  const current = readSession(localUserId);
  if (current && current.expiresAt - Date.now() > 60_000) return current;
  if (current?.refreshToken) {
    try {
      const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: current.refreshToken });
      writeSession(localUserId, refreshed);
      return refreshed;
    } catch {
      /* yenilenemezse yeni anonim oturum açılır */
    }
  }
  const created = await authRequest('signup', { data: {} });
  writeSession(localUserId, created);
  return created;
}

async function callFunction(localUserId: string, payload: Record<string, unknown>, retried = false): Promise<AiReply> {
  const cfg = cloudAiConfig();
  if (!cfg) return { ok: false, reason: 'not_connected', messageTr: 'AI öğretmen bağlı değil.' };
  let session: StoredSession;
  try {
    session = await ensureSession(localUserId);
  } catch (err) {
    if ((err as Error).message === 'ANON_DISABLED') {
      return { ok: false, reason: 'error', messageTr: 'Supabase\'de anonim girişler kapalı. Panelde Authentication → Sign In / Providers → "Allow anonymous sign-ins" seçeneğini açın.' };
    }
    return { ok: false, reason: 'error', messageTr: 'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.' };
  }
  let res: Response;
  try {
    res = await fetch(`${cfg.url}/functions/v1/ai-teacher`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}`, apikey: cfg.anonKey, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, reason: 'error', messageTr: 'Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.' };
  }
  if (res.status === 401 && !retried) {
    writeSession(localUserId, null);
    return callFunction(localUserId, payload, true);
  }
  if (res.status === 404) {
    return { ok: false, reason: 'not_connected', messageTr: 'Sunucuda "ai-teacher" fonksiyonu bulunamadı. Supabase\'de fonksiyonun bu adla yayınlandığını kontrol edin.' };
  }
  const data = (await res.json().catch(() => null)) as AiReply | null;
  if (data && typeof data === 'object' && 'ok' in data) return data;
  return { ok: false, reason: 'error', messageTr: `Sunucudan beklenmeyen yanıt (${res.status}).` };
}

export function cloudAiChat(localUserId: string, lessonCode: string, messages: ChatMessage[]): Promise<AiReply> {
  return callFunction(localUserId, { kind: 'conversation', lessonCode, messages });
}

export function cloudAiWriting(localUserId: string, lessonCode: string, taskId: string, text: string): Promise<AiReply> {
  return callFunction(localUserId, { kind: 'writing', lessonCode, taskId, text });
}

export class CloudError extends Error {
  constructor(message: string, readonly code: 'not_connected' | 'not_installed' | 'offline' | 'server' | 'rejected') {
    super(message);
  }
}

/** Supabase veritabanı fonksiyonu (RPC) çağırır. Oturum yoksa anonim oturum açar. */
export async function cloudRpc<T>(localUserId: string, fn: string, args: Record<string, unknown>, retried = false): Promise<T> {
  const cfg = cloudAiConfig();
  if (!cfg) throw new CloudError('Sunucu bağlantısı yapılandırılmadı.', 'not_connected');
  let session: StoredSession;
  try {
    session = await ensureSession(localUserId);
  } catch (err) {
    if ((err as Error).message === 'ANON_DISABLED') throw new CloudError('Sunucuda anonim giriş kapalı.', 'server');
    throw new CloudError('Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.', 'offline');
  }
  let res: Response;
  try {
    res = await fetch(`${cfg.url}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}`, apikey: cfg.anonKey, 'content-type': 'application/json' },
      body: JSON.stringify(args),
    });
  } catch {
    throw new CloudError('Sunucuya bağlanılamadı. İnternet bağlantını kontrol et.', 'offline');
  }
  if (res.status === 401 && !retried) {
    writeSession(localUserId, null);
    return cloudRpc<T>(localUserId, fn, args, true);
  }
  const text = await res.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'message' in data ? String((data as { message: unknown }).message) : '';
    const code = typeof data === 'object' && data && 'code' in data ? String((data as { code: unknown }).code) : '';
    if (res.status === 404 || code === 'PGRST202' || code === '42883') {
      throw new CloudError('Bu özellik sunucuda henüz kurulmadı (Supabase SQL adımı bekleniyor).', 'not_installed');
    }
    if (code === 'P0001' && msg) throw new CloudError(msg, 'rejected');
    throw new CloudError(`Sunucu hatası (${res.status}).`, 'server');
  }
  return data as T;
}
