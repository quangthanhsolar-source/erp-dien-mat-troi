-- Profiles (gắn với Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'sales' check (role in ('admin','manager','sales')),
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

-- Snapshot toàn bộ DB ERP (thay localStorage)
create table if not exists public.erp_snapshot (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

alter table public.erp_snapshot enable row level security;

create policy "erp_snapshot_select_authenticated"
  on public.erp_snapshot for select to authenticated
  using (true);

create policy "erp_snapshot_insert_authenticated"
  on public.erp_snapshot for insert to authenticated
  with check (true);

create policy "erp_snapshot_update_authenticated"
  on public.erp_snapshot for update to authenticated
  using (true)
  with check (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data->>'role', 'admin')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.erp_snapshot (id, data)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
