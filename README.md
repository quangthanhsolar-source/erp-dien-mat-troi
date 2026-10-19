# Quang Thanh Solar ERP

Hệ thống quản lý báo giá / đơn hàng điện mặt trời (Quang Thanh Solar).

- **Web app:** `index.html` (Firebase Hosting → `app.quangthanhsolar.com`)
- **Mobile:** Capacitor Android (`www/` + `android/`)
- **Backend:** Supabase (`supabase/`)

Repo GitHub: https://github.com/quangthanhsolar-source/erp-dien-mat-troi

## Deploy production (`app.quangthanhsolar.com`)

Luồng A — **sửa → push `main` → site tự cập nhật** (không realtime khi gõ; cập nhật sau khi CI chạy xong, thường 1–3 phút):

```text
Chỉnh sửa trong Cursor → commit → push origin main
        → GitHub Actions (Deploy Firebase Hosting)
        → Firebase Hosting → https://app.quangthanhsolar.com
```

Yêu cầu trên GitHub repo:
1. Secret **`FIREBASE_TOKEN`** (Settings → Secrets and variables → Actions)
2. Quyền push nhánh `main`

Tạo token Firebase (một lần, trên máy đã cài Firebase CLI):

```bash
npx firebase login:ci
```

Dán giá trị vào secret `FIREBASE_TOKEN`. Có thể chạy lại workflow thủ công: Actions → Deploy Firebase Hosting → Run workflow.

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
