-- Đồng bộ Auth từ app_users: tạo/cập nhật user Auth theo mật khẩu ERP
-- để đăng nhập luôn có session Supabase (không còn "Chỉ local").

CREATE OR REPLACE FUNCTION public.erp_sync_auth_login(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_app public.app_users%ROWTYPE;
  v_uid uuid;
  v_instance uuid := '00000000-0000-0000-0000-000000000000';
  v_email text;
BEGIN
  IF p_email IS NULL OR p_password IS NULL OR length(trim(p_email)) = 0 OR length(p_password) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing');
  END IF;

  v_email := lower(trim(p_email));

  SELECT * INTO v_app
  FROM public.app_users
  WHERE lower(email) = v_email
    AND pass = p_password
    AND active IS NOT FALSE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower(v_app.email) LIMIT 1;

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      is_sso_user, is_anonymous
    ) VALUES (
      v_instance, v_uid, 'authenticated', 'authenticated', lower(v_app.email),
      crypt(p_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', coalesce(v_app.name,''), 'email_verified', true),
      now(), now(),
      '', '', '', '',
      false, false
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_uid,
      jsonb_build_object(
        'sub', v_uid::text,
        'email', lower(v_app.email),
        'email_verified', true,
        'full_name', coalesce(v_app.name,'')
      ),
      'email', v_uid::text,
      now(), now(), now()
    );
  ELSE
    UPDATE auth.users SET
      encrypted_password = crypt(p_password, gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now(),
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', coalesce(v_app.name,''), 'email_verified', true),
      raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
        || '{"provider":"email","providers":["email"]}'::jsonb
    WHERE id = v_uid;

    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_uid AND provider = 'email') THEN
      INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_uid,
        jsonb_build_object(
          'sub', v_uid::text,
          'email', lower(v_app.email),
          'email_verified', true,
          'full_name', coalesce(v_app.name,'')
        ),
        'email', v_uid::text,
        now(), now(), now()
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('ok', true, 'user_id', v_uid);
END;
$$;

REVOKE ALL ON FUNCTION public.erp_sync_auth_login(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.erp_sync_auth_login(text, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.erp_app_users_sync_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NEW.email IS NULL OR nullif(trim(NEW.pass), '') IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.active IS FALSE THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.pass IS NOT DISTINCT FROM OLD.pass
     AND lower(NEW.email) IS NOT DISTINCT FROM lower(OLD.email)
     AND NEW.active IS NOT DISTINCT FROM OLD.active THEN
    RETURN NEW;
  END IF;
  PERFORM public.erp_sync_auth_login(NEW.email, NEW.pass);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_erp_app_users_sync_auth ON public.app_users;
CREATE TRIGGER trg_erp_app_users_sync_auth
AFTER INSERT OR UPDATE OF email, pass, active, name
ON public.app_users
FOR EACH ROW
EXECUTE FUNCTION public.erp_app_users_sync_auth();
