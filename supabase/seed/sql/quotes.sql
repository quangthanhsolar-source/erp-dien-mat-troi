insert into public.quotes (code,customer_name,phone,address,total,status,staff_name,quote_date,data,updated_at) values
('BG-00006','Tô Hữu Đức','0328431227','TP. Hồ Chí Minh',97416000,'draft','Admin Quang Thanh','2026-06-12T09:10','{}'::jsonb,now()),
('BG-00005','Tô Hữu Đức','0328431227','TP. Hồ Chí Minh',97416000,'draft','Admin Quang Thanh','2026-06-11T16:22','{}'::jsonb,now()),
('BG-00004','Tô Hữu Đức','0328431227','TP. Hồ Chí Minh',97416000,'draft','Admin Quang Thanh','2026-06-11T15:02','{}'::jsonb,now()),
('BG-00003','Yên Bái 1','0888885665','Yên Bái',547518155.4,'accept','Admin Quang Thanh','2026-06-10T15:40','{}'::jsonb,now()),
('BG-00002','Nguyễn Văn A','0905547707','Đà Nẵng',249156000,'accept','Admin Quang Thanh','2026-06-10T13:05','{}'::jsonb,now()),
('BG-00001','Nguyễn Sơn Ca 1','0888885665','Yên Bái',120884400,'draft','Admin Quang Thanh','2026-06-10T11:20','{}'::jsonb,now())
on conflict (code) do update set customer_name=excluded.customer_name, phone=excluded.phone, address=excluded.address, total=excluded.total, status=excluded.status, staff_name=excluded.staff_name, quote_date=excluded.quote_date, data=excluded.data, updated_at=now();