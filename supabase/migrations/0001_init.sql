-- We Can — ilk veritabanı şeması
-- DURUM: Yazıldı, gerçek bir Supabase projesinde henüz ÇALIŞTIRILMADI.
-- Kurallar:
--   * Her kullanıcı yalnızca kendi satırlarını okuyabilir (RLS).
--   * İlerleme, XP, seri, rozet, sınav sonucu ve AI kullanım tablolarına istemci YAZAMAZ;
--     bu tablolara yalnızca sunucu fonksiyonları (service_role) yazar.
--   * İçerik tablolarını giriş yapmış herkes okur; sınav cevap anahtarları ve AI senaryoları istemciye kapalıdır.

-- =========================================================== 1. Kimlik ve hesap
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  goal text not null default '',
  daily_minutes int not null default 30 check (daily_minutes between 5 and 120),
  interests text[] not null default '{}',
  timezone text not null default 'Europe/Istanbul',
  ui_language text not null default 'tr',
  onboarding_done boolean not null default false,
  placement_done boolean not null default false,
  placement_level text check (placement_level in ('A1', 'A2', 'B1', 'B2')),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  valid_until timestamptz
);

create table public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_xp int not null default 0,
  streak int not null default 0,
  longest_streak int not null default 0,
  last_active_date date
);

-- =========================================================== 2. İçerik
create table public.levels (
  code text primary key check (code in ('A1', 'A2', 'B1', 'B2')),
  name text not null,
  summary text not null default '',
  sort_order int not null
);

create table public.units (
  id text primary key,                      -- örn. 'A1.1'
  level_code text not null references public.levels (code),
  number int not null,
  title text not null,
  scenario text not null,
  grammar text not null default '',
  vocab text not null default '',
  unit_task text not null default '',
  unique (level_code, number)
);

create table public.lessons (
  code text primary key,                    -- örn. 'A1.1.3'
  unit_id text not null references public.units (id),
  number int not null check (number between 1 and 5),
  kind text not null check (kind in ('grammar', 'speaking', 'vocab', 'scenario', 'exam')),
  mode text check (mode in ('cards', 'conversation', 'exam')),
  teacher text check (teacher in ('grammar', 'speaking', 'listening', 'exam')),
  title text not null,
  goal text not null,
  outcome text not null,
  intro_tr text not null default '',
  unique (unit_id, number)
);

create table public.exercises (
  id text primary key,
  lesson_code text not null references public.lessons (code) on delete cascade,
  sort_order int not null,
  type text not null check (type in ('info', 'mcq', 'fill', 'order', 'match', 'translate', 'listen', 'write')),
  skill text not null check (skill in ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking')),
  -- Soru içeriği (cevap anahtarı HARİÇ): prompt, context, options, tiles, text, source, audioText ...
  body jsonb not null,
  status text not null default 'approved' check (status in ('draft', 'approved'))
);
create index exercises_lesson_idx on public.exercises (lesson_code, sort_order);

create table public.exercise_keys (
  exercise_id text primary key references public.exercises (id) on delete cascade,
  -- answer, accepted, altAnswers, pairs, mustInclude, explainTr ...
  key jsonb not null
);

create table public.vocabulary_items (
  id text primary key,
  lesson_code text references public.lessons (code),
  term text not null,
  meaning_tr text not null,
  pos text not null default '',
  ipa text,
  example_en text not null default '',
  example_tr text not null default '',
  note text,
  topic text
);

create table public.ai_scenarios (
  lesson_code text primary key references public.lessons (code) on delete cascade,
  title_tr text not null,
  situation_tr text not null,
  teacher_role_en text not null,
  opening_en text not null,
  goals_tr text[] not null default '{}',
  max_turns int not null default 8
);

-- =========================================================== 3. İlerleme
create table public.user_unit_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  unit_id text not null references public.units (id),
  status text not null check (status in ('passed', 'reinforce', 'failed', 'skipped')),
  exam_score int,
  updated_at timestamptz not null default now(),
  primary key (user_id, unit_id)
);

create table public.user_lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_code text not null references public.lessons (code),
  status text not null check (status in ('completed', 'failed')),
  best_score int not null default 0,
  attempts int not null default 0,
  completed_at timestamptz,
  primary key (user_id, lesson_code)
);

create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_code text not null references public.lessons (code),
  score int not null,
  correct int not null,
  total int not null,
  xp_awarded int not null default 0,
  -- Ölçülen ve ölçülmeyen beceriler açıkça kaydedilir (ör. {"speaking":"text-based","pronunciation":"not-measured"}).
  measurement jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index lesson_attempts_user_idx on public.lesson_attempts (user_id, created_at desc);

create table public.exercise_responses (
  attempt_id uuid not null references public.lesson_attempts (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  user_id uuid not null references auth.users (id) on delete cascade,
  response jsonb,
  is_correct boolean not null,
  primary key (attempt_id, exercise_id)
);

-- =========================================================== 4. Kelime ve tekrar
create table public.user_vocabulary (
  user_id uuid not null references auth.users (id) on delete cascade,
  vocabulary_id text not null references public.vocabulary_items (id),
  note text,
  added_at timestamptz not null default now(),
  primary key (user_id, vocabulary_id)
);

create table public.review_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,                         -- 'v:<kelime>' veya 'm:<alıştırma>'
  kind text not null check (kind in ('vocab', 'mistake')),
  front text not null,
  back text not null,
  extra text,
  step int not null default 0 check (step between 0 and 4),   -- 1, 3, 7, 14, 30 gün
  due date not null,
  status text not null default 'active' check (status in ('active', 'learned')),
  last_result text check (last_result in ('know', 'hard', 'dont')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index review_items_due_idx on public.review_items (user_id, status, due);

-- =========================================================== 5. Oyunlaştırma
create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount int not null check (amount > 0),
  reason text not null,
  ref text not null default '',
  created_at timestamptz not null default now()
);
create index xp_events_user_idx on public.xp_events (user_id, created_at desc);

create table public.user_badges (
  user_id uuid not null references auth.users (id) on delete cascade,
  badge_code text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_code)
);

create table public.user_quests (
  user_id uuid not null references auth.users (id) on delete cascade,
  quest_date date not null,
  quest_code text not null,
  progress int not null default 0,
  target int not null,
  done boolean not null default false,
  primary key (user_id, quest_date, quest_code)
);

-- =========================================================== 6. Yapay zekâ ve kota
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_code text references public.lessons (code),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  corrections_tr text[]
);

create table public.ai_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.ai_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table public.writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_code text references public.lessons (code),
  text text not null,
  feedback_tr text,
  created_at timestamptz not null default now()
);

-- Günlük kullanım sayacı (kota kontrolü bununla yapılır).
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  kind text not null check (kind in ('conversation', 'writing')),
  count int not null default 0,
  primary key (user_id, usage_date, kind)
);

-- Her AI çağrısının harcadığı miktar (maliyet takibi).
create table public.ai_usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);
create index ai_usage_events_user_idx on public.ai_usage_events (user_id, created_at desc);

-- Kotayı atomik olarak tüketir: hak varsa sayacı artırır ve true döner, yoksa false döner.
create or replace function public.consume_ai_quota(p_user uuid, p_date date, p_kind text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  insert into public.ai_usage (user_id, usage_date, kind, count)
  values (p_user, p_date, p_kind, 1)
  on conflict (user_id, usage_date, kind)
  do update set count = public.ai_usage.count + 1
  where public.ai_usage.count < p_limit
  returning count into v_count;
  return v_count is not null and v_count <= p_limit;
end;
$$;
revoke all on function public.consume_ai_quota(uuid, date, text, int) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, date, text, int) to service_role;

-- =========================================================== Yeni kullanıcı kurulumu
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'display_name', 40), ''));
  insert into public.subscriptions (user_id) values (new.id);
  insert into public.user_stats (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================== Satır düzeyinde güvenlik (RLS)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_stats enable row level security;
alter table public.levels enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_keys enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.ai_scenarios enable row level security;
alter table public.user_unit_progress enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.lesson_attempts enable row level security;
alter table public.exercise_responses enable row level security;
alter table public.user_vocabulary enable row level security;
alter table public.review_items enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_badges enable row level security;
alter table public.user_quests enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_usage_events enable row level security;

-- Profil: kullanıcı kendi satırını okur; yalnızca tercih sütunlarını değiştirebilir.
-- Seviye ve tespit sonucu gibi sütunlar sunucu tarafından yazılır.
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (display_name, goal, daily_minutes, interests, timezone, ui_language, onboarding_done) on public.profiles to authenticated;

-- Yalnızca okunabilen kullanıcı tabloları (yazma: sadece service_role).
create policy subscriptions_select_own on public.subscriptions for select to authenticated using (user_id = auth.uid());
create policy user_stats_select_own on public.user_stats for select to authenticated using (user_id = auth.uid());
create policy unit_progress_select_own on public.user_unit_progress for select to authenticated using (user_id = auth.uid());
create policy lesson_progress_select_own on public.user_lesson_progress for select to authenticated using (user_id = auth.uid());
create policy lesson_attempts_select_own on public.lesson_attempts for select to authenticated using (user_id = auth.uid());
create policy exercise_responses_select_own on public.exercise_responses for select to authenticated using (user_id = auth.uid());
create policy review_items_select_own on public.review_items for select to authenticated using (user_id = auth.uid());
create policy xp_events_select_own on public.xp_events for select to authenticated using (user_id = auth.uid());
create policy user_badges_select_own on public.user_badges for select to authenticated using (user_id = auth.uid());
create policy user_quests_select_own on public.user_quests for select to authenticated using (user_id = auth.uid());
create policy ai_conversations_select_own on public.ai_conversations for select to authenticated using (user_id = auth.uid());
create policy ai_messages_select_own on public.ai_messages for select to authenticated using (user_id = auth.uid());
create policy writing_submissions_select_own on public.writing_submissions for select to authenticated using (user_id = auth.uid());
create policy ai_usage_select_own on public.ai_usage for select to authenticated using (user_id = auth.uid());
-- ai_usage_events için politika yok: yalnızca service_role erişir.

-- Kelime defteri: kullanıcı kendi notunu güncelleyebilir; ekleme sunucudan yapılır.
create policy user_vocabulary_select_own on public.user_vocabulary for select to authenticated using (user_id = auth.uid());
create policy user_vocabulary_update_own on public.user_vocabulary for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke insert, update, delete on public.user_vocabulary from authenticated, anon;
grant update (note) on public.user_vocabulary to authenticated;

-- İçerik: giriş yapmış herkes okur.
create policy levels_read on public.levels for select to authenticated using (true);
create policy units_read on public.units for select to authenticated using (true);
create policy lessons_read on public.lessons for select to authenticated using (true);
create policy exercises_read on public.exercises for select to authenticated using (status = 'approved');
create policy vocabulary_read on public.vocabulary_items for select to authenticated using (true);
-- Cevap anahtarları: yalnızca sınav OLMAYAN derslerinki okunabilir (anında geri bildirim için).
create policy exercise_keys_read_non_exam on public.exercise_keys for select to authenticated using (
  exists (
    select 1
    from public.exercises e
    join public.lessons l on l.code = e.lesson_code
    where e.id = exercise_keys.exercise_id and l.kind <> 'exam'
  )
);
-- ai_scenarios için politika yok: istemci okuyamaz, yalnızca sunucu fonksiyonu okur.

-- Yazma izinlerini açıkça kapat (savunma amaçlı; politika olmadığı için zaten reddedilir).
revoke insert, update, delete on
  public.subscriptions, public.user_stats, public.user_unit_progress, public.user_lesson_progress,
  public.lesson_attempts, public.exercise_responses, public.review_items, public.xp_events,
  public.user_badges, public.user_quests, public.ai_conversations, public.ai_messages,
  public.writing_submissions, public.ai_usage, public.ai_usage_events,
  public.levels, public.units, public.lessons, public.exercises, public.exercise_keys,
  public.vocabulary_items, public.ai_scenarios
from authenticated, anon;
