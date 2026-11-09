# App Store (iPhone) — Quang Thanh Solar ERP

App shell: Capacitor iOS · bundle id `com.quangthanhsolar.erp`  
Tên trên màn hình chính: `Quang Thanh Solar ERP` (trùng Android)  
Nội dung: WebView mở `https://app.quangthanhsolar.com`  
Privacy: `https://app.quangthanhsolar.com/privacy.html`  
Phiên bản native đã khai: `1.0.0` (build `1`), cùng mức với Android `versionName` 1.0.0 / `versionCode` 1.

Tài liệu này dành cho máy Windows. Repo đã chuẩn bị project iOS. Việc đăng ký Apple, trả phí và build IPA chỉ làm được khi bạn tự đăng nhập Apple ID (có 2FA) và có máy Mac hoặc dịch vụ Mac trên mây.

## Đã chuẩn bị trong repo

- Thư mục `ios/`: project Xcode do Capacitor 7 tạo (`npx cap add ios`), cùng bộ `@capacitor/ios` 7.6.9 với Android.
- Bundle id `com.quangthanhsolar.erp`. App chỉ iPhone, khóa dọc, giống app Android.
- `capacitor.config.json` trỏ `server.url` tới `https://app.quangthanhsolar.com`. Nền native `#111214`.
- Icon 1024×1024 lấy từ `docs/play-listing/play-icon-512.png` (phóng lên, bỏ kênh trong suốt). Splash nền tối cùng màu Android.
- `Info.plist` có câu hỏi vị trí cho Check-in / Check-out, và `ITSAppUsesNonExemptEncryption` = false (miễn trừ mã hóa HTTPS chuẩn).
- Firebase Hosting đã có `ios/**` trong `firebase.json` (cùng kiểu với `android/**`). Đẩy repo không đăng project iOS lên website.
- File chữ ký Apple (`.p8`, `.p12`, `.cer`, `.mobileprovision`) nằm trong `.gitignore`. Không commit khóa.

Chưa có file IPA. Chưa đăng ký Apple Developer. Chưa điền D-U-N-S.

ERP trên web không đổi. Sửa báo giá, hợp đồng, chấm công, bán hàng trên website thì điện thoại thấy ngay, không cần build lại. Chỉ cần IPA mới khi đổi phần native: icon, quyền, hoặc số build.

## Vì sao Windows không tạo được IPA

Apple chỉ ký và đóng gói App Store bằng Xcode trên macOS. Windows không có Xcode. Máy Linux dùng để soạn repo này cũng không có Xcode, nên không thể giả bộ đã build. File AAB Android không nộp được cho Apple.

`npm install` trên Windows vẫn cần, để lấy dependency. Các lệnh sau sẽ không ra IPA trên Windows:

```powershell
npm run mobile:sync:ios
npm run mobile:open:ios
```

## Hai cách mở tài khoản — bạn phải tự chọn và tự trả phí

Cả hai cách đều vào [đăng ký Apple Developer](https://developer.apple.com/programs/enroll/) và trả **99 USD/năm**. Không ai đăng ký hộ được: Apple bắt đăng nhập Apple ID và xác minh 2FA. Không bắt đầu hồ sơ tổ chức khi chưa có số D-U-N-S.

### Cá nhân

- Không cần D-U-N-S.
- Người bán trên App Store là **tên pháp lý của một người**, không phải tên công ty.
- Phù hợp nếu cần lên store trong lúc chờ số D-U-N-S.
- Phí 99 USD/năm, do chính chủ Apple ID trả.

### Tổ chức

- Pháp nhân: **CÔNG TY CỔ PHẦN ĐIỆN MẶT TRỜI QUANG THANH**, MST **0318769358**.
- Apple bắt buộc số **D-U-N-S**. Công ty chưa có số này. Yêu cầu miễn phí đã gửi **CRIF Vietnam** và đang chờ. Không điền số giả, không đoán.
- Khi có số thật, tên trên store là tên công ty.
- Phí vẫn 99 USD/năm.
- Không dùng pháp nhân Vương quốc Anh.

## Việc chỉ bạn làm được

1. Chọn email Apple ID sẽ đứng tên tài khoản Developer (một email bạn mở được 2FA).
2. Vào https://developer.apple.com/programs/enroll/ và chọn Cá nhân hoặc Tổ chức.
3. Trả 99 USD/năm bằng thẻ do Apple chấp nhận.
4. Làm bước xác minh danh tính mà Apple gửi. Không ghi số giấy tờ hay ngày sinh vào repo, vào chat, hay vào file hướng dẫn.
5. Đợi Apple báo tài khoản đã active. Tổ chức thường lâu hơn vì Apple đối chiếu D-U-N-S.
6. Tạo App ID, rồi tạo app trên App Store Connect (mục dưới).

### Tạo App ID

1. Mở https://developer.apple.com/account/resources/identifiers/list
2. Thêm identifier loại **App**, kiểu **Explicit**.
3. Description: `Quang Thanh Solar ERP`
4. Bundle ID: `com.quangthanhsolar.erp`
5. Không bật capability thêm (không Push, không Associated Domains).

### Tạo app trên App Store Connect

1. Mở https://appstoreconnect.apple.com → **Apps** → **New App**.
2. Nền tảng: **iOS**.
3. Tên: `Quang Thanh Solar ERP`
4. Ngôn ngữ chính: **Vietnamese** (Tiếng Việt).
5. Bundle ID: `com.quangthanhsolar.erp`
6. SKU (chỉ nội bộ, không hiện trên store): `qtsolar-erp`
7. Giá: **Free** (0 đồng).
8. Danh mục chính: **Business**.
9. Privacy Policy URL: `https://app.quangthanhsolar.com/privacy.html`
10. Support URL: `https://quangthanhsolar.com`  
    Email hỗ trợ: `info@quangthanhsolar.com`

Gợi ý mô tả (có thể sửa):

**Phụ đề:** ERP nội bộ Quang Thanh Solar  

**Mô tả:**  
Quang Thanh Solar ERP giúp nhân viên kinh doanh và vận hành theo dõi báo giá NLMT, đơn hàng, khách hàng, danh mục thiết bị và chấm công trên iPhone. Ứng dụng dành cho tài khoản do Quang Thanh Solar cấp; không phải trình duyệt web công cộng.

**App Privacy** (cùng hướng với Data safety trên Play):

| Mục | Trả lời |
|-----|---------|
| Tên, email | Có, để đăng nhập |
| Đơn hàng, báo giá | Có, dữ liệu nghiệp vụ nội bộ |
| Vị trí chính xác | Có, chỉ khi nhân viên Check-in hoặc Check-out |
| Ảnh | Có, người dùng tự chọn khi chấm công |
| Quảng cáo / theo dõi | Không |
| Mã hóa khi truyền | Có, HTTPS |

Nếu Apple hỏi app có phải trình duyệt tự do hay không: không. App chỉ mở ERP của công ty qua HTTPS.

App dạng WebView đôi khi bị từ chối theo guideline 4.2 (app chỉ là một website). Nếu bị vậy, vẫn trong App Store Connect có thể chuyển sang **Unlisted** (có link, không hiện khi tìm kiếm). Hợp với ERP nội bộ. Không cần sửa code ERP.

## Sau khi tài khoản đã trả phí — cách build

Chưa gắn dịch vụ CI trả phí trong repo. Chọn một trong hai đường.

### Máy Mac có Xcode

1. Cài Xcode từ Mac App Store.
2. Cài CocoaPods: `brew install cocoapods`
3. Trong thư mục repo:

```bash
npm install
npx cap sync ios
open ios/App/App.xcworkspace
```

`npx cap sync ios` copy web nhỏ và chạy `pod install`. Mở file **`.xcworkspace`**, không mở `.xcodeproj` riêng. Lần `pod install` đầu tiên tạo thư mục `Pods/` (không commit).

4. Xcode → target **App** → **Signing & Capabilities**:
   - Team: team vừa đăng ký
   - Automatically manage signing: bật
   - Bundle Identifier: `com.quangthanhsolar.erp`
5. Chọn **Any iOS Device (arm64)** → **Product → Archive**.
6. Organizer → **Distribute App** → **App Store Connect** → Upload.
7. Trên App Store Connect, chọn bản build vừa lên, thêm ảnh chụp, gửi duyệt.

Mỗi lần nộp bản native mới, tăng build (`CURRENT_PROJECT_VERSION` trong `ios/App/App.xcodeproj/project.pbxproj`). Đang để `1`.

### Không có Mac — CI macOS

Chỉ làm sau khi tài khoản Apple đã active.

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**.
2. Tạo key vai trò Admin. Tải `AuthKey_XXXXXXXX.p8` **một lần**. Giữ Issuer ID và Key ID cùng file đó trong password manager.
3. Không commit file `.p8`. Không dán nội dung key vào git.
4. Dùng GitHub Actions runner `macos-latest`, hoặc Codemagic. Bạn tự mở tài khoản dịch vụ đó và tự trả phí phút Mac nếu có.
5. Job CI chạy `npm ci`, `npx cap sync ios`, archive bằng Xcode, rồi upload bằng API key.

Repo này không chứa workflow đó và không chứa key.

## Ảnh chụp màn hình

Apple không nhận ảnh Android hay ảnh trình duyệt. File `docs/play-listing/phone-01-login.jpg` là ảnh cho Google Play, **chưa hợp lệ** cho App Store.

App iPhone khóa dọc. Chụp trên iPhone thật hoặc iOS Simulator (chỉ có trên Mac), sau khi app đã chạy.

Cỡ Apple yêu cầu cho **iPhone 6.7 inch** (14 Pro Max, 15 Plus, 15 Pro Max):

- Dọc: **1290 × 2796** px

Connect có thể hỏi thêm **iPhone 6.9 inch** (16 Pro Max và máy cùng cỡ):

- Dọc: **1320 × 2868** px

Nộp từ 3 đến 10 ảnh dọc: đăng nhập, màn hình chính, một màn báo giá hoặc đơn hàng. Nếu chỉ có một bộ, ưu tiên đúng cỡ mà Connect đang đánh dấu bắt buộc. Không kéo giãn ảnh Android cho đủ số pixel.

## Export compliance (mã hóa)

App là WebView tới `https://app.quangthanhsolar.com`. Chỉ dùng HTTPS/TLS của hệ điều hành. Không có mã hóa tự viết.

`ios/App/App/Info.plist` đã đặt `ITSAppUsesNonExemptEncryption` = false. Khi Connect hoặc lúc upload hỏi export compliance, chọn miễn trừ mã hóa tiêu chuẩn (app chỉ dùng HTTPS). Không cần hồ sơ CCATS.

## Ba việc cần bạn trả lời trước khi đi tiếp

1. Email Apple ID sẽ dùng để đăng ký Developer.
2. Đăng ký **Cá nhân** (không cần D-U-N-S, tên người bán là tên người) hay **Tổ chức** (chờ số D-U-N-S từ CRIF Vietnam, tên công ty trên store).
3. Bạn có máy Mac nào dùng được không (máy công ty hoặc máy thuê). Nếu không, sẽ đi đường CI macOS sau khi tài khoản Apple đã trả phí.
