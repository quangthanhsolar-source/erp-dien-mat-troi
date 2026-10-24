-- Ghi chú + hình ảnh khảo sát cho Khách hàng CRM
alter table public.crm_leads
  add column if not exists note text;

alter table public.crm_leads
  add column if not exists survey_imgs jsonb not null default '[]'::jsonb;

comment on column public.crm_leads.note is 'Ghi chú nội bộ về khách / khảo sát';
comment on column public.crm_leads.survey_imgs is 'Mảng URL/data ảnh khảo sát nhà khách (JPEG nén)';
