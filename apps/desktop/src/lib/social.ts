// Arkadaşlar: arkadaş kodu, karşılıklı arkadaşlık ve arkadaşların seviye/XP görünümü (Supabase RPC).
import { currentLevel, dayKey, dayStats, effectiveStreak, lastDays } from '@core/engine.ts';
import type { UserState } from '@core/types.ts';
import { cloudRpc } from './backend/cloudAi.ts';
import { curriculum } from './content.ts';

export interface FriendRow {
  user_id: string;
  display_name: string;
  level: string;
  total_xp: number;
  week_xp: number;
  streak: number;
  avatar: string | null;
  updated_at: string;
}

const CODE_KEY = 'wecan.friendcode.';

export function cachedFriendCode(localUserId: string): string | null {
  try { return localStorage.getItem(CODE_KEY + localUserId); } catch { return null; }
}

export function weekXp(state: UserState): number {
  return lastDays(dayKey(new Date()), 7).reduce((n, d) => n + dayStats(state, d).xp, 0);
}

/** Kendi görünür profilini sunucuya gönderir; arkadaş kodunu döndürür. */
export async function syncSocialProfile(localUserId: string, state: UserState): Promise<string> {
  const code = await cloudRpc<string>(localUserId, 'social_sync', {
    p_name: state.profile.displayName,
    p_level: currentLevel(state, curriculum),
    p_total_xp: state.stats.totalXp,
    p_week_xp: weekXp(state),
    p_streak: effectiveStreak(state, dayKey(new Date())),
    p_avatar: state.profile.avatar ?? null,
  });
  try { localStorage.setItem(CODE_KEY + localUserId, code); } catch { /* yoksay */ }
  return code;
}

export function normalizeFriendCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const body = s.startsWith('WC') ? s.slice(2) : s;
  return /^[A-Z0-9]{6}$/.test(body) ? `WC-${body}` : null;
}

export function addFriend(localUserId: string, code: string): Promise<string> {
  return cloudRpc<string>(localUserId, 'social_add_friend', { p_code: code });
}

export function listFriends(localUserId: string): Promise<FriendRow[]> {
  return cloudRpc<FriendRow[]>(localUserId, 'social_friends', {});
}

export function removeFriend(localUserId: string, friendId: string): Promise<void> {
  return cloudRpc<void>(localUserId, 'social_remove_friend', { p_friend: friendId });
}

/** Arkadaş kodu alınmışsa, XP değiştikçe görünür profili arka planda günceller (en fazla 3 dakikada bir). */
export function backgroundSocialSync(localUserId: string, state: UserState): void {
  if (!cachedFriendCode(localUserId)) return;
  const key = 'wecan.socialsync.' + localUserId;
  try {
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < 180_000) return;
    localStorage.setItem(key, String(Date.now()));
  } catch { return; }
  syncSocialProfile(localUserId, state).catch(() => { /* çevrim dışıysa sonra denenir */ });
}

// ---------- Sohbet ----------
export interface ChatMessage { id: number; mine: boolean; body: string; created_at: string }

export function sendMessage(localUserId: string, friendId: string, body: string): Promise<number> {
  return cloudRpc<number>(localUserId, 'social_send_message', { p_to: friendId, p_body: body.slice(0, 500) });
}
export function loadMessages(localUserId: string, friendId: string, after = 0): Promise<ChatMessage[]> {
  return cloudRpc<ChatMessage[]>(localUserId, 'social_messages', { p_friend: friendId, p_after: after });
}
export async function unreadCounts(localUserId: string): Promise<Record<string, number>> {
  const rows = await cloudRpc<{ friend_id: string; unread: number }[]>(localUserId, 'social_unread', {});
  return Object.fromEntries(rows.map((r) => [r.friend_id, r.unread]));
}

// ---------- Düello ----------
export interface DuelRow {
  id: string; i_challenged: boolean; friend_id: string; friend_name: string; seed: number; level: string;
  my_score: number | null; my_ms: number | null; their_score: number | null; their_ms: number | null; created_at: string;
}
export function createDuel(localUserId: string, friendId: string, seed: number, level: string, score: number, ms: number): Promise<string> {
  return cloudRpc<string>(localUserId, 'social_duel_create', { p_friend: friendId, p_seed: seed, p_level: level, p_score: score, p_ms: ms });
}
export function answerDuel(localUserId: string, id: string, score: number, ms: number): Promise<void> {
  return cloudRpc<void>(localUserId, 'social_duel_answer', { p_id: id, p_score: score, p_ms: ms });
}
export function listDuels(localUserId: string): Promise<DuelRow[]> {
  return cloudRpc<DuelRow[]>(localUserId, 'social_duels', {});
}
