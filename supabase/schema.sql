-- Project Kingdom profile and role schema.
-- Apply this SQL in the Supabase SQL Editor after reviewing it.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('admin', 'executive', 'operator', 'analyst', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_user_profile();

-- Promote an initial trusted operator manually after verifying their user ID:
-- update public.profiles set role = 'admin' where id = '<AUTH_USER_UUID>';
-- Never grant admin based on user-editable user_metadata or email supplied at signup.

-- Distributed per-user API quotas. Counters are caller-scoped and cannot be
-- reset or deleted by authenticated clients.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.quickfas_api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in (
    'ai-council', 'ai-briefing', 'ai-simulation', 'ai-voice',
    'telemetry-ingest', 'analytics-event'
  )),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket)
);

alter table public.quickfas_api_rate_limits enable row level security;
revoke all on table public.quickfas_api_rate_limits from public, anon, authenticated;
grant select, insert, update on table public.quickfas_api_rate_limits to authenticated;
revoke delete, truncate, references, trigger on table public.quickfas_api_rate_limits from authenticated;

drop policy if exists "Users can read their own API rate limits" on public.quickfas_api_rate_limits;
drop policy if exists "Users can insert their own API rate limits" on public.quickfas_api_rate_limits;
drop policy if exists "Users can update their own API rate limits" on public.quickfas_api_rate_limits;

create policy "Users can read their own API rate limits"
  on public.quickfas_api_rate_limits for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "Users can insert their own API rate limits"
  on public.quickfas_api_rate_limits for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own API rate limits"
  on public.quickfas_api_rate_limits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function private.enforce_quickfas_api_rate_limit_counter()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.window_started_at := pg_catalog.now();
    new.request_count := 1;
    new.updated_at := pg_catalog.now();
    return new;
  end if;

  if new.user_id is distinct from old.user_id or new.bucket is distinct from old.bucket then
    raise exception 'Rate-limit counter identity is immutable';
  end if;

  if old.window_started_at <= pg_catalog.now() - interval '1 minute' then
    new.window_started_at := pg_catalog.now();
    new.request_count := 1;
  else
    new.window_started_at := old.window_started_at;
    new.request_count := old.request_count + 1;
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;
revoke all on function private.enforce_quickfas_api_rate_limit_counter() from public, anon, authenticated;

drop trigger if exists enforce_quickfas_api_rate_limit_counter on public.quickfas_api_rate_limits;
create trigger enforce_quickfas_api_rate_limit_counter
before insert or update on public.quickfas_api_rate_limits
for each row execute function private.enforce_quickfas_api_rate_limit_counter();

create or replace function public.consume_quickfas_api_rate_limit(p_bucket text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_count integer;
begin
  if v_user_id is null then
    return false;
  end if;

  case p_bucket
    when 'ai-council' then v_limit := 8;
    when 'ai-briefing' then v_limit := 8;
    when 'ai-simulation' then v_limit := 5;
    when 'ai-voice' then v_limit := 15;
    when 'telemetry-ingest' then v_limit := 120;
    when 'analytics-event' then v_limit := 120;
    else return false;
  end case;

  insert into public.quickfas_api_rate_limits (user_id, bucket)
  values (v_user_id, p_bucket)
  on conflict (user_id, bucket) do update
    set request_count = public.quickfas_api_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= v_limit;
end;
$$;
revoke all on function public.consume_quickfas_api_rate_limit(text) from public, anon;
grant execute on function public.consume_quickfas_api_rate_limit(text) to authenticated;
