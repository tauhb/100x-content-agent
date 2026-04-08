# 📦 HƯỚNG DẪN THIẾT LẬP GOOGLE SHEETS CMS (DÀNH CHO KHÁCH HÀNG)

Chào mừng bạn đến với hệ thống Quản trị Nội dung tự động 100X. Tài liệu này hướng dẫn bạn cách kết nối "Bộ não AI" tại máy tính với "Bảng điều khiển" Google Sheets của riêng bạn.

---

## 🚀 Bước 1: Khởi tạo Google Sheet
1.  Truy cập vào [Google Sheets](https://sheets.new) và tạo một trang tính mới.
2.  Đặt tên cho file (Ví dụ: `100X Content Agency Dashboard`).

## 🛠️ Bước 2: Cài đặt Apps Script
1.  Trên thanh Menu, chọn **Extensions** (Tiện ích mở rộng) -> **Apps Script**.
2.  Xóa toàn bộ mã mặc định trong tệp `Code.gs`.
3.  Mở tệp `scripts/google_apps_script.gs` trong thư mục dự án trên máy tính, copy toàn bộ nội dung và dán vào cửa sổ Apps Script.
4.  Bấm nút **Save** (Biểu tượng đĩa mềm) và đặt tên dự án là `100X_Agent_Backend`.

## 🛰️ Bước 3: Triển khai Web App (Lấy Link Kết Nối)
1.  Bấm nút **Deploy** (Triển khai) -> **New deployment** (Triển khai mới).
2.  Chọn loại triển khai (Select type): **Web app**.
3.  Cấu hình:
    *   **Description:** `100X V1`
    *   **Execute as:** `Me` (Chính bạn)
    *   **Who has access:** **Anyone** (Bất kỳ ai - Đây là bước quan trọng để Robot có thể gửi dữ liệu lên).
4.  Bấm **Deploy**. Nếu Google hỏi quyền truy cập, hãy bấm **Review Permissions**, chọn tài khoản của bạn, bấm **Advanced** -> **Go to 100X_Agent_Backend (unsafe)** và bấm **Allow**.
5.  **QUAN TRỌNG:** Copy đoạn mã **Web App URL** hiện ra (có dạng `https://script.google.com/macros/s/.../exec`).

## 🔑 Bước 4: Cấu hình vào Hệ Thống
1.  Mở tệp `.env` trong thư mục gốc của dự án trên máy tính.
2.  Tìm dòng `GOOGLE_SHEET_APP_URL=""` và dán URL bạn vừa copy vào giữa dấu ngoặc kép.
    *   Ví dụ: `GOOGLE_SHEET_APP_URL="https://script.google.com/macros/s/ABC123XYZ/exec"`
3.  Lưu tệp `.env`.

## 🏁 Bước 5: Kích hoạt Giao Diện
1.  Quay lại trang Google Sheet của bạn và F5 (Tải lại trang).
2.  Bạn sẽ thấy một Menu mới tên là **🚀 100X AGENT** xuất hiện cạnh menu Help.
3.  Bấm vào **🚀 100X AGENT** -> **🛠️ Khởi tạo Hệ thống (Setup)**.
4.  Hệ thống sẽ tự động tạo đủ 2 Tab: `💡 IDEA HUB` và `🚀 CONTENT PIPELINE` với màu sắc và các nút bấm chuyên nghiệp.

---

**Chúc mừng!** Hệ thống đã sẵn sàng. Giờ đây bạn có thể ngồi cà phê và quản trị toàn bộ đế chế nội dung của mình chỉ bằng một chiếc điện thoại!
