create table if not exists public.crm_leads (
  id bigint primary key,
  name text not null default '',
  phone text,
  address text,
  demand text,
  owner text,
  lead_date text,
  source text,
  status text,
  updated_at timestamptz not null default now(),
  constraint crm_leads_source_chk check (source is null or source in ('Facebook','Tiktok','Zalo','Website','DAT','CTV','Tự Kiếm')),
  constraint crm_leads_status_chk check (status is null or status in ('Đã liên hệ','Đã báo giá','Đã khảo sát'))
);

alter table public.crm_leads enable row level security;

drop policy if exists crm_leads_select_authenticated on public.crm_leads;
drop policy if exists crm_leads_insert_authenticated on public.crm_leads;
drop policy if exists crm_leads_update_authenticated on public.crm_leads;
drop policy if exists crm_leads_delete_authenticated on public.crm_leads;

create policy crm_leads_select_authenticated on public.crm_leads for select to authenticated using (true);
create policy crm_leads_insert_authenticated on public.crm_leads for insert to authenticated with check (true);
create policy crm_leads_update_authenticated on public.crm_leads for update to authenticated using (true) with check (true);
create policy crm_leads_delete_authenticated on public.crm_leads for delete to authenticated using (true);

grant select, insert, update, delete on table public.crm_leads to authenticated;
