# Worked example: INVT inverters

Table order 1–17 became `assets/products/invt/NN-CODE.jpg`. Same chassis shares one official photo.

| STT | Code | Model | File | Shared with |
|---|---|---|---|---|
| 1 | IN15 | XG15KTR1-S | `01-IN15.jpg` | IN103 |
| 2 | XD60 | XD60KTR | `02-XD60.jpg` | XD50 |
| 3 | IN5 | XG5KTL | `03-IN5.jpg` | IN3 |
| 4 | IN80 | XG80KTR | `04-IN80.jpg` | |
| 5 | XD50 | XD50KTR | `05-XD50.jpg` | XD60 |
| 6 | XD6 | XD6 KTL | `06-XD6.jpg` | |
| 7 | XD10 | XD-10KTL | `07-XD10.jpg` | |
| 8 | IN30 | XG30KTR | `08-IN30.jpg` | IN40 |
| 9 | IN3 | XG3KTL | `09-IN3.jpg` | IN5 |
| 10 | IN40 | XG40KTR | `10-IN40.jpg` | IN30 |
| 11 | in50 | XG50KTR | `11-in50.jpg` | IN60 |
| 12 | IN101 | XG10KTL | `12-IN101.jpg` | |
| 13 | IN103 | XG10KTR | `13-IN103.jpg` | IN15 |
| 14 | IN20 | XG20KTR | `14-IN20.jpg` | |
| 15 | IN60 | XG60KTR | `15-IN60.jpg` | in50 |
| 16 | IN110 | XG110KTR | `16-IN110.jpg` | |
| 17 | IN125 | XG125KTR | `17-IN125.jpg` | |

Manifest equivalent:

```json
{
  "size": 1000,
  "margin": 16,
  "items": [
    { "in": "assets/product-src/invt/xg3-15ktr-s.jpg", "out": ["assets/products/invt/01-IN15.jpg", "assets/products/invt/13-IN103.jpg"] },
    { "in": "assets/product-src/invt/xd30-60ktr.jpg", "out": ["assets/products/invt/02-XD60.jpg", "assets/products/invt/05-XD50.jpg"] },
    { "in": "assets/product-src/invt/xg1-5ktl-s.jpg", "out": ["assets/products/invt/03-IN5.jpg", "assets/products/invt/09-IN3.jpg"] },
    { "in": "assets/product-src/invt/xg75-80ktr-pro.jpg", "out": ["assets/products/invt/04-IN80.jpg"] },
    { "in": "assets/product-src/invt/xd3-6ktl.jpg", "out": ["assets/products/invt/06-XD6.jpg"] },
    { "in": "assets/product-src/invt/xd7-10ktl.jpg", "out": ["assets/products/invt/07-XD10.jpg"] },
    { "in": "assets/product-src/invt/xg30-40ktr.jpg", "out": ["assets/products/invt/08-IN30.jpg", "assets/products/invt/10-IN40.jpg"] },
    { "in": "assets/product-src/invt/xg50-70ktr.jpg", "out": ["assets/products/invt/11-in50.jpg", "assets/products/invt/15-IN60.jpg"] },
    { "in": "assets/product-src/invt/xg3-10ktl.jpg", "out": ["assets/products/invt/12-IN101.jpg"] },
    { "in": "assets/product-src/invt/xg17-25ktr.jpg", "out": ["assets/products/invt/14-IN20.jpg"] },
    { "in": "assets/product-src/invt/xg100-136ktr.jpg", "out": ["assets/products/invt/16-IN110.jpg"] },
    { "in": "assets/product-src/invt/xg100-150ktr-pro.jpg", "out": ["assets/products/invt/17-IN125.jpg"] }
  ]
}
```

Hero photos came from the official INVT product gallery (`invt.com` `/uploads/img1/...jpg`, typically 680×470). Do not scrape random marketplace shots.
