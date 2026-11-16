-- We Can - Arkadaşlar (arkadaş kodu, karşılıklı arkadaşlık, seviye/XP görünümü).
-- Supabase paneli > SQL Editor > New query > bu dosyanın tamamını yapıştır > Run. Tekrar çalıştırmak zararsızdır.
-- Uygulama tablolara doğrudan erişemez; yalnızca aşağıdaki fonksiyonları (RPC) çağırabilir.

create table if not exists public.social_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  friend_code text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 40),
  level text not null default 'A1' check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  total_xp integer not null default 0 check (total_xp between 0 and 100000000),
  week_xp integer not null default 0 check (week_xp between 0 and 1000000),
  streak integer not null default 0 check (streak between 0 and 100000),
  avatar text check (avatar is null or (char_length(avatar) <= 60000 and avatar like 'data:image/%')),
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

alter table public.social_profiles enable row level security;
alter table public.friendships enable row level security;
revoke all on public.social_profiles from anon, authenticated;
revoke all on public.friendships from anon, authenticated;

-- Okunması kolay kod: karışan harfler (0/O, 1/I/L) yok. Örnek: WC-7K3MPQ
create or replace function public.social_new_code()
returns text language plpgsql set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := 'WC-';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.social_profiles where friend_code = code);
  end loop;
  return code;
end;
$$;

-- Kendi görünür profilini günceller (yoksa oluşturur) ve arkadaş kodunu döndürür.
create or replace function public.social_sync(p_name text, p_level text, p_total_xp integer, p_week_xp integer, p_streak integer, p_avatar text)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  code text;
begin
  if me is null then raise exception 'Oturum gerekli'; end if;
  insert into public.social_profiles (user_id, friend_code, display_name, level, total_xp, week_xp, streak, avatar, updated_at)
  values (me, public.social_new_code(), left(coalesce(nullif(trim(p_name), ''), 'We Can'), 40), p_level,
          greatest(coalesce(p_total_xp, 0), 0), greatest(coalesce(p_week_xp, 0), 0), greatest(coalesce(p_streak, 0), 0), p_avatar, now())
  on conflict (user_id) do update set
    display_name = excluded.display_name, level = excluded.level, total_xp = excluded.total_xp,
    week_xp = excluded.week_xp, streak = excluded.streak, avatar = excluded.avatar, updated_at = now()
  returning friend_code into code;
  return code;
end;
$$;

-- Kodla arkadaş ekler (karşılıklı). Eklenen arkadaşın adını döndürür.
create or replace function public.social_add_friend(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  other uuid;
  other_name text;
begin
  if me is null then raise exception 'Oturum gerekli'; end if;
  if not exists (select 1 from public.social_profiles where user_id = me) then raise exception 'Önce kendi profilin oluşturulmalı'; end if;
  select user_id, display_name into other, other_name from public.social_profiles where friend_code = upper(trim(p_code));
  if other is null then raise exception 'Bu arkadaş kodu bulunamadı'; end if;
  if other = me then raise exception 'Bu senin kendi kodun'; end if;
  if (select count(*) from public.friendships where user_id = me) >= 200 then raise exception 'En fazla 200 arkadaş eklenebilir'; end if;
  insert into public.friendships (user_id, friend_id) values (me, other), (other, me) on conflict do nothing;
  return other_name;
end;
$$;

-- Arkadaş listesini döndürür.
create or replace function public.social_friends()
returns table (user_id uuid, display_name text, level text, total_xp integer, week_xp integer, streak integer, avatar text, updated_at timestamptz)
language sql security definer set search_path = public stable as $$
  select p.user_id, p.display_name, p.level, p.total_xp, p.week_xp, p.streak, p.avatar, p.updated_at
  from public.friendships f join public.social_profiles p on p.user_id = f.friend_id
  where f.user_id = auth.uid()
  order by p.week_xp desc, p.total_xp desc;
$$;

-- Arkadaşlıktan çıkarır (iki taraftan da).
create or replace function public.social_remove_friend(p_friend uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.friendships
  where (user_id = auth.uid() and friend_id = p_friend) or (user_id = p_friend and friend_id = auth.uid());
$$;

revoke all on function public.social_new_code() from public, anon, authenticated;
revoke all on function public.social_sync(text, text, integer, integer, integer, text) from public, anon;
revoke all on function public.social_add_friend(text) from public, anon;
revoke all on function public.social_friends() from public, anon;
revoke all on function public.social_remove_friend(uuid) from public, anon;
grant execute on function public.social_sync(text, text, integer, integer, integer, text) to authenticated;
grant execute on function public.social_add_friend(text) to authenticated;
grant execute on function public.social_friends() to authenticated;
grant execute on function public.social_remove_friend(uuid) to authenticated;
