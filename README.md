# Quang Thanh Solar ERP

Hệ thống quản lý báo giá / đơn hàng điện mặt trời (Quang Thanh Solar).

- **Web app:** `index.html` (Firebase Hosting → `app.quangthanhsolar.com`)
- **Mobile:** Capacitor Android (`www/` + `android/`)
- **Backend:** Supabase (`supabase/`)

Repo GitHub: https://github.com/quangthanhsolar-source/erp-dien-mat-troi

## Deploy production (`app.quangthanhsolar.com`)

### Tự động (khuyến nghị khi chỉnh trên Cursor)

```bash
npm run sync:auto
```

Luồng:

```text
Sửa + Save file trong Cursor
  → auto-sync (debounce ~8s)
  → commit + push main + firebase deploy
  → Ctrl+F5 https://app.quangthanhsolar.com  → thấy bản mới
```

Hard refresh trình duyệt **không** tự push; việc push/deploy chạy khi bạn **Save** file. Sau khi sync xong, Ctrl+F5 trên production để tải bản mới.

### Thủ công

```text
commit → push origin main → GitHub Actions → Firebase Hosting
```

Cần secret GitHub **`FIREBASE_TOKEN`** và quyền push `main`.

## Chạy local (web)

```bash
# từ thư mục gốc repo
python3 -m http.server 43145 --bind 127.0.0.1
```

Mở: http://127.0.0.1:43145/

Hoặc dùng bất kỳ static server nào phục vụ thư mục gốc (Firebase `public: "."`).

## Mobile (Android)

```bash
npm install
npm run mobile:sync
npm run mobile:open
```

Chi tiết Play Store: xem `docs/PLAY_STORE.md`.

## Cấu trúc chính

| Đường dẫn | Vai trò |
|-----------|---------|
| `index.html` | ERP web chính |
| `assets/` | Logo, ảnh sản phẩm, media |
| `supabase/` | Migrations & seed |
| `android/` | Capacitor Android shell |
| `www/` | Entry Capacitor (redirect production) |
| `scripts/` | Helper giá thiết bị, CRM, MCP |
| `privacy.html` | Privacy policy (Play Store) |
