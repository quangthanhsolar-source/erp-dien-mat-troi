-- Ép Auth dùng đúng mật khẩu hiện tại trên app_users (vô hiệu mật khẩu Auth cũ)
DO $$
DECLARE
  r RECORD;
  n int := 0;
BEGIN
  FOR r IN
    SELECT email, pass
    FROM public.app_users
    WHERE active IS NOT FALSE
      AND email IS NOT NULL
      AND nullif(trim(pass), '') IS NOT NULL
  LOOP
    PERFORM public.erp_sync_auth_login(r.email, r.pass);
    n := n + 1;
  END LOOP;
  RAISE NOTICE 'resync auth passwords: % users', n;
END $$;
