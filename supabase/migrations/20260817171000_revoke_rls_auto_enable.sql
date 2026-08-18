-- Lock down leftover SECURITY DEFINER helper
revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.rls_auto_enable() from authenticated;
grant execute on function public.rls_auto_enable() to postgres, service_role;
