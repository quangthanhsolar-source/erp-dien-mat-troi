insert into public.suppliers (id,name,phone,email,address,note,attrs,updated_at) values
(601,'Công ty TNHH Điện Mặt Trời Xanh','02873001234','sales@dienmattroixanh.vn','Quận 12, TP. Hồ Chí Minh','Biến tần, pin lưu trữ','{}'::jsonb,now()),
(602,'Công ty CP Năng Lượng AKIO Việt Nam','02866778899','kd@akio.vn','Bình Dương','Tấm pin NLMT','{}'::jsonb,now()),
(603,'Nhà phân phối ZETATECH miền Nam','0908112233','zetatech.mn@gmail.com','Quận Tân Bình, TP. HCM','Pin lưu trữ Lithium','{}'::jsonb,now())
on conflict (id) do update set name=excluded.name, phone=excluded.phone, email=excluded.email, address=excluded.address, note=excluded.note, attrs=excluded.attrs, updated_at=now();