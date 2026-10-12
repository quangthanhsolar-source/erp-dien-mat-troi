-- Bật realtime cho erp_seq để các thiết bị nhận tín hiệu khi có lưu mới
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'erp_seq'
  ) then
    alter publication supabase_realtime add table public.erp_seq;
  end if;
end $$;
