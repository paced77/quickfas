-- Reproducibly install the public-schema RLS event trigger and restrict direct invocation.
-- SECURITY DEFINER is intentional: the event-trigger owner enables RLS on newly-created
-- public tables. The function pins search_path to pg_catalog and uses identifier quoting.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
  tbl name;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL
      AND cmd.schema_name = 'public'
      AND cmd.schema_name NOT IN ('pg_catalog', 'information_schema')
      AND cmd.schema_name NOT LIKE 'pg_toast%'
      AND cmd.schema_name NOT LIKE 'pg_temp%'
    THEN
      BEGIN
        SELECT c.relname INTO STRICT tbl
        FROM pg_catalog.pg_class c
        WHERE c.oid = cmd.objid;
        EXECUTE format('ALTER TABLE IF EXISTS %I.%I ENABLE ROW LEVEL SECURITY', cmd.schema_name, tbl);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
    ELSE
      RAISE LOG 'rls_auto_enable: skip % (not in enforced schema)', cmd.object_identity;
    END IF;
  END LOOP;
END;
$function$;

ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_event_trigger e
    WHERE e.evtname = 'ensure_rls'
      AND e.evtfoid <> 'public.rls_auto_enable()'::regprocedure
  ) THEN
    RAISE EXCEPTION 'ensure_rls event trigger already exists with an unexpected function';
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_event_trigger e
    WHERE e.evtname = 'ensure_rls'
  ) THEN
    EXECUTE $ddl$
      CREATE EVENT TRIGGER ensure_rls
      ON ddl_command_end
      WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      EXECUTE FUNCTION public.rls_auto_enable()
    $ddl$;
  END IF;
END;
$migration$;

REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
