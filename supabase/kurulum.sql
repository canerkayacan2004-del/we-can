-- We Can - AI ogretmen icin Supabase kurulumu (tek seferlik).
-- Supabase paneli > SQL Editor > New query > bu dosyanin tamamini yapistir > Run.
-- Tekrar calistirmak zararsizdir.

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  kind text not null check (kind in ('conversation', 'writing')),
  count int not null default 0,
  primary key (user_id, usage_date, kind)
);

-- Uygulama bu tabloya dogrudan erisemez; yalnizca sunucu fonksiyonu (service_role) erisir.
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

-- Gunluk hakki atomik olarak dusurur; sinir dolduysa false doner.
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

-- AI cagrisi basarisiz olursa dusulen hakki geri verir.
create or replace function public.refund_ai_quota(p_user uuid, p_date date, p_kind text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_usage set count = greatest(count - 1, 0)
  where user_id = p_user and usage_date = p_date and kind = p_kind;
$$;

revoke all on function public.consume_ai_quota(uuid, date, text, int) from public, anon, authenticated;
revoke all on function public.refund_ai_quota(uuid, date, text) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, date, text, int) to service_role;
grant execute on function public.refund_ai_quota(uuid, date, text) to service_role;
