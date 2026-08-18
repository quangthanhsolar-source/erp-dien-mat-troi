insert into public.products (id,category,code,name,brand,unit,cost,ctv,floor_price,retail,warranty_years,watt,attrs,updated_at)
values
(8008,'mount','KB35','Kẹp nhôm biên, cố định tấm pin 35mm, đã bao gồm phụ kiện','Việt Nam','Bộ',8000,8800,9600,10400,NULL,NULL,'{"sp":["Kẹp nhôm biên, cố định tấm pin 35mm, đã bao gồm phụ kiện"]}'::jsonb,now()),
(8009,'mount','KG30','Kẹp nhôm giữa, cố định tấm pin 30mm, đã bao gồm phụ kiện','Việt Nam','Bộ',8000,8800,9600,10400,NULL,NULL,'{"sp":["Kẹp nhôm giữa, cố định tấm pin 30mm, đã bao gồm phụ kiện"]}'::jsonb,now()),
(8010,'mount','KG35','Kẹp nhôm giữa, cố định tấm pin 35mm, đã bao gồm phụ kiện','Việt Nam','Bộ',8000,8800,9600,10400,NULL,NULL,'{"sp":["Kẹp nhôm giữa, cố định tấm pin 35mm, đã bao gồm phụ kiện"]}'::jsonb,now()),
(8011,'mount','KD','Kẹp cố định dây tấm pin inox 304','Việt Nam','Cái',4000,4400,4800,5200,NULL,NULL,'{"sp":["Kẹp cố định dây tấm pin inox 304"]}'::jsonb,now()),
(8012,'mount','M200','Mini rail nhôm 20cm','Việt Nam','Cái',18000,19800,21600,23400,NULL,NULL,'{"sp":["Mini rail nhôm 20cm"]}'::jsonb,now()),
(8013,'mount','M4200','Rail nhôm 4200mm','Việt Nam','Cây',168000,184800,201600,218400,NULL,NULL,'{"sp":["Rail nhôm 4200mm"]}'::jsonb,now()),
(8014,'mount','M2100','Rail nhôm 2100mm','Việt Nam','Cây',336000,369600,403200,436800,NULL,NULL,'{"sp":["Rail nhôm 2100mm"]}'::jsonb,now()),
(8015,'mount','NR','Ngàm nối ngoài thanh nhôm ( nối rail )','Việt Nam','Cái',20000,22000,24000,26000,NULL,NULL,'{"sp":["Ngàm nối ngoài thanh nhôm ( nối rail )"]}'::jsonb,now()),
(8016,'mount','CL','Chân đở chữ L','Việt Nam','Cái',20000,22000,24000,26000,NULL,NULL,'{"sp":["Chân đở chữ L"]}'::jsonb,now()),
(8017,'mount','MC4','Jack nối MC4 1500v','Leader','Cặp',18000,19800,21600,23400,NULL,NULL,'{"sp":["Jack nối MC4 1500v"]}'::jsonb,now()),
(8018,'mount','CU','Cùm U chống bão – CU','Việt Nam','Bộ',30000,33000,36000,39000,NULL,NULL,'{"sp":["Cùm U chống bão bao gồm :","Cùm Inox 304 và Kẹp nhôm cố định tấm pin, ốc Inox"]}'::jsonb,now()),
(8019,'mount','ki','Kẹp INOX 304, dùng để cố định tấm pin','Việt Nam','Bộ',22000,24200,26400,28600,NULL,NULL,'{"sp":["Kẹp INOX 304, dùng để cố định tấm pin"]}'::jsonb,now()),
(8020,'mount','KTD','Kẹp nhôm dây tiếp địa','Việt Nam','Bộ',15000,16500,18000,19500,NULL,NULL,'{"sp":["Kẹp nhôm dây tiếp địa"]}'::jsonb,now()),
(8021,'mount','STT','Sàn thao tác nhúng kẽm nóng','Việt Nam','Bộ',250000,275000,300000,325000,NULL,NULL,'{"sp":["Sàn thao tác nhúng kẽm nóng"]}'::jsonb,now()),
(8022,'mount','Z20','Bát Z','Việt Nam','Bộ',22000,24200,26400,28600,NULL,NULL,'{"sp":["Bát Z","10x20cm nhúng kẽm nóng"]}'::jsonb,now())
on conflict (id) do update set
 category=excluded.category, code=excluded.code, name=excluded.name, brand=excluded.brand, unit=excluded.unit,
 cost=excluded.cost, ctv=excluded.ctv, floor_price=excluded.floor_price, retail=excluded.retail,
 warranty_years=excluded.warranty_years, watt=excluded.watt, attrs=excluded.attrs, updated_at=now();