-- Cho phép vai trò telesales trên profiles + app_users
-- và gán telesales cho danh sách telesale chỉ định.

do $$
declare
  c_name text;
begin
  -- profiles.role check
  select con.conname into c_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'profiles'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%role%';
  if c_name is not null then
    execute format('alter table public.profiles drop constraint %I', c_name);
  end if;
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('admin','manager','sales','telesales'));

  -- app_users.role check
  c_name := null;
  select con.conname into c_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'app_users'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) ilike '%role%';
  if c_name is not null then
    execute format('alter table public.app_users drop constraint %I', c_name);
  end if;
  alter table public.app_users
    add constraint app_users_role_check
    check (role in ('admin','manager','sales','telesales'));
end $$;

update public.app_users
set role = 'telesales', updated_at = now()
where role is distinct from 'telesales'
  and (
    lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) in (
      lower('Phạm Thị Yến Nhi'),
      lower('Lê Thị Tuyết Nhi'),
      lower('Nguyễn Thị Thùy Linh'),
      lower('Dương Thị Mỹ Huyền'),
      lower('Đào Thị Thuý An'),
      lower('Đào Thị Thúy An'),
      lower('Nguyễn Thị Ngọc Mai'),
      lower('Phan Ánh Kiều')
    )
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Yến Nhi') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Tuyết Nhi') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Thùy Linh') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Mỹ Huyền') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Thuý An') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Thúy An') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Ngọc Mai') || '%'
    or lower(regexp_replace(coalesce(name,''), '\s+', ' ', 'g')) like '%' || lower('Ánh Kiều') || '%'
  );

update public.profiles
set role = 'telesales'
where role is distinct from 'telesales'
  and (
    lower(regexp_replace(coalesce(full_name,''), '\s+', ' ', 'g')) in (
      lower('Phạm Thị Yến Nhi'),
      lower('Lê Thị Tuyết Nhi'),
      lower('Nguyễn Thị Thùy Linh'),
      lower('Dương Thị Mỹ Huyền'),
      lower('Đào Thị Thuý An'),
      lower('Đào Thị Thúy An'),
      lower('Nguyễn Thị Ngọc Mai'),
      lower('Phan Ánh Kiều')
    )
  );
