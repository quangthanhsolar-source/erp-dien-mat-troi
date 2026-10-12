---
name: product-catalog-images
description: >-
  Finds official manufacturer product photos, trims near-white background,
  fills a sharp 1000x1000 square close to the frame edges, and wires them to
  ERP catalog SKUs. Use when the user asks to find product images, square
  catalog photos, phóng to sát mép, replace product thumbnails, ảnh vuông,
  or apply photos for INVT, Solis, Huawei, TCL, SMA, pin, tấm pin, biến tần,
  or any other brand list.
---

# Product catalog images

Official manufacturer photos only. Never AI-generate product shots.

## Workflow

Copy and track:

```
Task Progress:
- [ ] 1. SKU list in table order
- [ ] 2. Official source photos
- [ ] 3. Series map (shared chassis)
- [ ] 4. Square-fill export
- [ ] 5. Wire catalog map + cache bust
- [ ] 6. Verify thumbs
```

### 1. SKU list

Keep the user's table order. For each row record: STT, `code`, model name, destination file.

Brand slug = lowercase ASCII (`invt`, `solis`, `huawei`). Destination:

`assets/products/{brand}/{NN}-{CODE}.jpg`

`NN` is 2-digit STT. Keep the catalog `code` spelling (`in50` stays `in50`).

### 2. Official photos

Download the manufacturer's product-gallery hero (not marketplace, not brochure collages, not AI).

Save originals under `assets/product-src/{brand}/` with a series filename (`xg30-40ktr.jpg`). Do not commit HTML scrapes.

If two SKUs share the same chassis on the official site, use **one** source file for both. Confirm visually before sharing.

### 3. Manifest

Write a JSON map (repo root or temp). One source may list many outputs:

```json
{
  "size": 1000,
  "margin": 16,
  "items": [
    {
      "in": "assets/product-src/solis/s6-eh1p.jpg",
      "out": ["assets/products/solis/01-SL6.jpg", "assets/products/solis/02-SL5.jpg"]
    }
  ]
}
```

### 4. Square-fill

Execute this skill's script (do not rewrite it). From the repo root:

```powershell
powershell -NoProfile -File .cursor/skills/product-catalog-images/scripts/square-fill.ps1 -Manifest mapping.json
```

Single file:

```powershell
powershell -NoProfile -File .cursor/skills/product-catalog-images/scripts/square-fill.ps1 -In src.jpg -Out dest.jpg
```

The script: trims near-white (threshold 246), contain-fits into 1000×1000 with ~16px margin, HighQualityBicubic, JPEG q=94, white canvas. **Never stretch.** Landscape units keep extra top/bottom; portrait units keep extra left/right. Tight axis should sit ~16–24px from the edge.

If Python is missing, keep using this PowerShell script (`System.Drawing`).

### 5. Wire into the ERP

This app stores catalog files on disk and maps SKUs in `index.html`:

1. Add each code to `CATALOG_PRODUCT_IMGS`:
   `'CODE':'assets/products/{brand}/{NN}-{CODE}.jpg?v=1'`
2. If the code has mixed case in DB (e.g. `in50`), add both keys pointing at the same file.
3. Set seed `DB.*.img` for those codes to the same path (placeholder SVG / empty / old `assets/products/` path).
4. `applyCatalogProductImgs()` already walks `panels`, `inverters`, `batteries`, `cabinets`, `lights`, `pumps`, `accessories`, `mounts`, `cables` — do not add a brand-specific apply function.
5. After replacing a file in place, bump `?v=N` (Firebase caches `**/*.jpg` as immutable 1 year).
6. Keep `.dev-tbl .dev-thumb` at 52×52 with `object-fit:contain`. Do not route these paths through `compressProdImg` (it already skips `assets/`).
7. `applyCatalogProductImgs` clears `data:` overrides in `qts_pimg_overrides_v1` for mapped codes so localStorage cannot hide the new files.

Other apps: same image pipeline; adapt the catalog map to that project's image field.

### 6. Verify

- Files exist, 1000×1000 JPEG, product close to the square (not floating in whitespace, not cropped off).
- Catalog table thumbs use `productImg(o)` / seed `img`.
- Hard-refresh (Ctrl+F5) after deploy or `?v=` bump.

## Do not

- Invent product photos with an image model
- Stretch to fill the square
- Embed large `data:` URLs for these catalog files
- Leave marketplace watermarks or lifestyle scenes as the hero

## Worked example

INVT inverter batch (order, shared chassis, manifest): [examples.md](examples.md)
