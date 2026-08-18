-- Split ERP snapshot into normalized tables
-- Categories match app arrays: panels/inverters/... -> category column

create table if not exists public.products (
  id bigint primary key,
  category text not null check (category in (
    'panel','inverter','battery','cabinet','light','pump',
    'accessory','mount','cable','service'
  )),
  code text,
  name text not null default '',
  brand text,
  unit text,
  cost numeric,
  ctv numeric,
  floor_price numeric,
  retail numeric,
  warranty_years numeric,
  watt numeric,
  attrs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_code_idx on public.products (code);

create table if not exists public.customers (
  id bigint primary key,
  name text not null default '',
  phone text,
  address text,
  note text,
  attrs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists customers_phone_idx on public.customers (phone);

create table if not exists public.suppliers (
  id bigint primary key,
  name text not null default '',
  phone text,
  email text,
  address text,
  note text,
  attrs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  code text primary key,
  customer_name text,
  phone text,
  address text,
  total numeric not null default 0,
  status text not null default 'draft',
  staff_name text,
  quote_date text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists quotes_status_idx on public.quotes (status);
create index if not exists quotes_date_idx on public.quotes (quote_date);

create table if not exists public.stock_items (
  id bigint primary key,
  category text not null,
  name text,
  qty numeric not null default 0,
  min_qty numeric not null default 0,
  unit text,
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_transactions (
  id bigint primary key,
  code text,
  kind text not null check (kind in ('in','out')),
  category text,
  product_id bigint,
  name text,
  qty numeric not null default 0,
  price numeric not null default 0,
  party text,
  party_phone text,
  ref text,
  note text,
  active boolean not null default true,
  trans_date text,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists stock_transactions_kind_idx on public.stock_transactions (kind);

-- App-local user directory (offline login fallback). Auth users stay in profiles.
create table if not exists public.app_users (
  id bigint primary key,
  name text,
  email text,
  phone text,
  role text not null default 'sales' check (role in ('admin','manager','sales')),
  active boolean not null default true,
  pass text,
  updated_at timestamptz not null default now()
);
create unique index if not exists app_users_email_uidx on public.app_users (lower(email));

create table if not exists public.erp_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_seq (
  id text primary key default 'main',
  q integer not null default 0,
  t integer not null default 0,
  u integer not null default 0,
  p integer not null default 0,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.quotes enable row level security;
alter table public.stock_items enable row level security;
alter table public.stock_transactions enable row level security;
alter table public.app_users enable row level security;
alter table public.erp_settings enable row level security;
alter table public.erp_seq enable row level security;

-- Shared company data: any authenticated staff can read/write
do $$
declare
  t text;
begin
  foreach t in array array[
    'products','customers','suppliers','quotes','stock_items',
    'stock_transactions','app_users','erp_settings','erp_seq'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t||'_select_authenticated', t);
    execute format('drop policy if exists %I on public.%I', t||'_insert_authenticated', t);
    execute format('drop policy if exists %I on public.%I', t||'_update_authenticated', t);
    execute format('drop policy if exists %I on public.%I', t||'_delete_authenticated', t);

    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      t||'_select_authenticated', t
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (true)',
      t||'_insert_authenticated', t
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (true) with check (true)',
      t||'_update_authenticated', t
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (true)',
      t||'_delete_authenticated', t
    );
  end loop;
end $$;

-- Seed singletons
insert into public.erp_settings (id, data) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;
insert into public.erp_seq (id, q, t, u, p) values ('main', 0, 0, 0, 0)
  on conflict (id) do nothing;

-- Lock down security definer trigger function
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
grant execute on function public.handle_new_user() to postgres, service_role;
