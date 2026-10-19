# Google Play — Quang Thanh Solar ERP

App shell: Capacitor Android · `com.quangthanhsolar.erp`  
Nội dung: WebView load `https://app.quangthanhsolar.com`  
Privacy: `https://app.quangthanhsolar.com/privacy.html`

## 0) Bạn cần có sẵn

1. [Google Play Console](https://play.google.com/console) — phí đăng ký ~$25 (một lần).
2. [Android Studio](https://developer.android.com/studio) trên Windows (JDK + Android SDK).
3. Logo/chụp màn hình thật (login, đơn hàng, báo giá) — tối thiểu 2 ảnh điện thoại.

## 1) Tạo keystore (một lần, giữ thật kỹ)

Trong thư mục repo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\create-android-keystore.ps1
```

Sẽ tạo:

- `mobile-release.keystore` (không commit)
- `android/keystore.properties` (không commit)

**Mất keystore = không cập nhật được app trên Play.** Sao lưu USB/password manager.

## 2) Sync & build AAB

```powershell
npm install
npm run mobile:sync
npm run mobile:bundle
```

File nộp Play:

`android/app/build/outputs/bundle/release/app-release.aab`

Mở Android Studio (tuỳ chọn):

```powershell
npm run mobile:open
```

## 3) Tạo app trên Play Console

1. **Create app** → tên: `Quang Thanh Solar ERP`
2. Ngôn ngữ mặc định: Tiếng Việt
3. Loại: Ứng dụng · Miễn phí
4. Khai báo đây là app nội bộ / productivity cho doanh nghiệp

### Store listing (gợi ý)

**Tên ngắn:** QT Solar ERP  

**Mô tả ngắn:**  
Ứng dụng quản lý báo giá, đơn hàng, CRM và thiết bị nội bộ Quang Thanh Solar.

**Mô tả đầy đủ:**  
Quang Thanh Solar ERP giúp nhân viên kinh doanh và vận hành theo dõi báo giá NLMT, đơn hàng, khách hàng CRM, danh mục thiết bị và KPI trên thiết bị Android. Ứng dụng dành cho tài khoản được cấp quyền bởi Quang Thanh Solar; không phải trình duyệt web công cộng.

**Privacy policy:** `https://app.quangthanhsolar.com/privacy.html`

**Danh mục:** Business / Productivity  

**Email liên hệ:** info@quangthanhsolar.com  

### Ảnh

- Icon 512×512 (PNG) — có thể export từ Android Studio Image Asset
- Feature graphic 1024×500
- Điện thoại: ≥ 2 screenshot (login + đơn hàng / báo giá)

## 4) Data safety (khai báo)

| Mục | Gợi ý trả lời |
|-----|----------------|
| Thu thập dữ liệu? | Có |
| Dữ liệu cá nhân | Tên, email (tài khoản) |
| Dữ liệu tài chính/kinh doanh | Đơn hàng, báo giá (nội bộ) |
| Mục đích | Chức năng app, quản trị tài khoản |
| Chia sẻ với bên thứ ba quảng cáo? | Không |
| Mã hóa khi truyền | Có (HTTPS) |
| Người dùng có thể yêu cầu xóa? | Qua quản trị viên nội bộ |

Quyền app: Internet (bắt buộc). Không xin vị trí / danh bạ / microphone trừ khi sau này thêm tính năng.

## 5) Release

1. **Testing** → Internal testing: upload AAB, thêm email tester, kiểm tra đăng nhập.
2. Khi ổn → **Production** (hoặc Closed testing trước).
3. Hoàn tất questionnaire / content rating / target audience (16+ hoặc 18+ tuỳ form).
4. Gửi duyệt.

## 6) Cập nhật sau này

- Sửa ERP trên web (Firebase) → user app thấy ngay, **không** cần build lại.
- Chỉ build AAB mới khi đổi native (icon, quyền, versionCode).
- Mỗi lần nộp native: tăng `versionCode` trong `android/app/build.gradle`.

## 7) App Store (iOS) — phase sau

Cần Mac + Apple Developer (~$99/năm). Cùng Capacitor: `npx cap add ios` khi sẵn sàng.
