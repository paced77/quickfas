alter table public.quickfas_api_rate_limits
  drop constraint if exists quickfas_api_rate_limits_bucket_check;
alter table public.quickfas_api_rate_limits
  add constraint quickfas_api_rate_limits_bucket_check
  check (bucket in ('ai-council', 'ai-briefing', 'ai-simulation', 'ai-voice', 'telemetry-ingest'));

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
