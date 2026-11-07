create table if not exists public.quickfas_api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in ('ai-council', 'ai-briefing', 'ai-simulation', 'ai-voice')),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket)
);

alter table public.quickfas_api_rate_limits enable row level security;
revoke all on table public.quickfas_api_rate_limits from public, anon, authenticated;

create or replace function public.consume_quickfas_api_rate_limit(p_bucket text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_limit integer;
  v_count integer;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    return false;
  end if;

  case p_bucket
    when 'ai-council' then v_limit := 8;
    when 'ai-briefing' then v_limit := 8;
    when 'ai-simulation' then v_limit := 5;
    when 'ai-voice' then v_limit := 15;
    else return false;
  end case;

  insert into public.quickfas_api_rate_limits
    (user_id, bucket, window_started_at, request_count, updated_at)
  values
    (v_user_id, p_bucket, v_now, 1, v_now)
  on conflict (user_id, bucket) do update
    set window_started_at = case
          when public.quickfas_api_rate_limits.window_started_at <= v_now - interval '1 minute'
            then v_now
          else public.quickfas_api_rate_limits.window_started_at
        end,
        request_count = case
          when public.quickfas_api_rate_limits.window_started_at <= v_now - interval '1 minute'
            then 1
          else public.quickfas_api_rate_limits.request_count + 1
        end,
        updated_at = v_now
  returning request_count into v_count;

  return v_count <= v_limit;
end;
$$;

revoke all on function public.consume_quickfas_api_rate_limit(text) from public, anon;
grant execute on function public.consume_quickfas_api_rate_limit(text) to authenticated;
