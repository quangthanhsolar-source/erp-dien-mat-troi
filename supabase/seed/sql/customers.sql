insert into public.customers (id,name,phone,address,note,attrs,updated_at) values
(701,'Nguyễn Sơn Ca 1','0888885665','Yên Bái','','{}'::jsonb,now()),
(702,'Nguyễn Văn A','0905547707','Đà Nẵng','Khách giới thiệu','{}'::jsonb,now()),
(703,'Tô Hữu Đức','0328431227','TP. Hồ Chí Minh','','{}'::jsonb,now())
on conflict (id) do update set name=excluded.name, phone=excluded.phone, address=excluded.address, note=excluded.note, attrs=excluded.attrs, updated_at=now();