-- Reproducibly restrict direct execution of the public-schema RLS event-trigger function.
-- The function is SECURITY DEFINER, owned by postgres, and pins search_path to pg_catalog.
-- Its event trigger remains enabled; only trusted database roles retain EXECUTE.
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM authenticated;

GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO service_role;
