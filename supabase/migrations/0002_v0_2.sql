-- We Can 0.2 — kişiselleştirme, çalışma günlüğü, beceri istatistikleri, not defteri
-- DURUM: Yazıldı, gerçek bir Supabase projesinde henüz ÇALIŞTIRILMADI.

-- Görünüm tercihleri (tema, vurgu rengi, ölçek, pano bölümleri). Kullanıcı kendisi değiştirebilir.
alter table public.profiles add column if not exists appearance jsonb not null default
  '{"theme":"emerald","accent":null,"scale":1,"motion":true,"sound":true,"dashboard":["skills","weekly","continue","words","ai","rewards","planner"]}';
grant update (appearance) on public.profiles to authenticated;

-- Günlük çalışma özeti (süre, XP, ders, tekrar, telafi, dinleme). Yalnızca sunucu yazar.
create table public.user_study_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  seconds int not null default 0,
  xp int not null default 0,
  lessons int not null default 0,
  reviews int not null default 0,
  practice int not null default 0,
  audio int not null default 0,
  primary key (user_id, day)
);

-- Beceri bazında doğruluk sayaçları. Yalnızca sunucu yazar.
create table public.user_skill_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  skill text not null check (skill in ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking')),
  correct int not null default 0,
  total int not null default 0,
  primary key (user_id, skill)
);

-- Kişisel not defteri. Kullanıcı kendi notlarını ekler, düzenler ve siler.
create table public.user_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 80),
  body text not null default '' check (char_length(body) <= 4000),
  tag text not null default '' check (char_length(tag) <= 24),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index user_notes_user_idx on public.user_notes (user_id, updated_at desc);

alter table public.user_study_days enable row level security;
alter table public.user_skill_stats enable row level security;
alter table public.user_notes enable row level security;

create policy study_days_select_own on public.user_study_days for select to authenticated using (user_id = auth.uid());
create policy skill_stats_select_own on public.user_skill_stats for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.user_study_days, public.user_skill_stats from authenticated, anon;

create policy notes_select_own on public.user_notes for select to authenticated using (user_id = auth.uid());
create policy notes_insert_own on public.user_notes for insert to authenticated with check (user_id = auth.uid());
create policy notes_update_own on public.user_notes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notes_delete_own on public.user_notes for delete to authenticated using (user_id = auth.uid());
