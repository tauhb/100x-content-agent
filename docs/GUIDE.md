# 🏁 100X Content Agent: Tổng Hướng Dẫn Vận Hành & Thiết Lập

Chào mừng bạn đến với hệ thống **100X Content Agent**. Đây là tài liệu duy nhất bạn cần để làm chủ "Dây chuyền sản xuất nội dung" tự động của mình.

---

## 📘 PHẦN 1: HƯỚNG DẪN VẬN HÀNH (DÀNH CHO OPERATOR)

Bạn không cần biết code. Hãy tương tác với **Antigravity AI** bằng các câu lệnh (Slash Commands) sau để điều khiển hệ thống.

### 1. Khởi động Dự án mới (`/setup`)
Khi bắt đầu một thương hiệu mới, hãy dùng lệnh này. AI sẽ hỏi bạn thông tin cơ bản để xây dựng "Brand DNA" (Giọng văn, tệp khách hàng, giá trị cốt lõi).

### 2. Nghiên cứu Ý tưởng (`/research_ideas`)
Lệnh này kích hoạt "Đặc nhiệm Nghiên cứu". AI sẽ tự động cào dữ liệu từ các đối thủ, tìm ra các bài viết Viral và trích xuất "Mỏ vàng Insight" cùng các bộ Hook (Mở bài) hiệu quả nhất.

### 3. Sáng tạo nội dung Gốc (`/vietbai`)
Dựa trên Insight đã nghiên cứu, Agent Copywriter sẽ viết ra các nội dung "Master Content" chuẩn công thức 100X (PAS, Hook tam đoạn). Đây là nền tảng để biến hóa thành Video, Carousel hay Infographic.

### 4. Sản xuất Đa phương tiện
-   **`/tao_video_broll`**: Biến chữ thành Video ngắn chuyên nghiệp (có lồng tiếng AI, nhạc nền, phụ ký).
-   **`/tao_carousel`**: Thiết kế chuỗi 10 slide ảnh đẹp mắt.
-   **`/tao_anh`**: Tạo một ảnh đơn kèm thiết kế thương hiệu.
-   **`/tao_infographic`**: Thiết kế số liệu/kiến thức dạng dài.

### 5. Đồng bộ & Hành động từ xa (`/sheets_action`)
Đồng bộ ý tưởng và bài viết lên Google Sheets. Sau khi bạn duyệt trên Sheet, lệnh này sẽ kéo kết quả về để AI bắt đầu sản xuất hàng loạt.

### 6. Đăng bài đa kênh (`/publish`)
Quản trị việc đăng tải toàn bộ thành phẩm lên Facebook, TikTok, Instagram... (Yêu cầu đã cấu hình tại Bước thiết lập CMS).

---

## 🚀 PHẦN 2: THIẾT LẬP GOOGLE SHEETS CMS (DÀNH CHO CHỦ HỆ THỐNG)

Tài liệu này hướng dẫn bạn cách kết nối "Bộ não AI" tại máy tính với "Bảng điều khiển" Google Sheets để quản trị từ xa.

### Bước 1: Khởi tạo Google Sheet
1.  Truy cập vào [Google Sheets](https://sheets.new) và tạo một trang tính mới.
2.  Đặt tên cho file (Ví dụ: `100X Content Agency Dashboard`).

### Bước 2: Cài đặt Apps Script
1.  Mở Menu **Extensions** (Tiện ích mở rộng) -> **Apps Script**.
2.  Mở tệp `scripts/google_apps_script.gs` trong thư mục dự án trên máy tính, copy toàn bộ nội dung và dán vào cửa sổ Apps Script (thay thế mã cũ).
3.  Lưu dự án với tên `100X_Agent_Backend`.

### Bước 3: Triển khai Web App (Lấy Link Kết Nối)
1.  Bấm **Deploy** (Triển khai) -> **New deployment**.
2.  Chọn loại: **Web app**.
3.  Cấu hình: **Execute as: Me** và **Who has access: Anyone**.
4.  Copy đoạn mã **Web App URL** hiện ra (có dạng `https://script.google.com/macros/s/.../exec`).

### Bước 4: Cấu hình vào tệp `.env`
1.  Mở tệp `.env` ở thư mục gốc trên máy tính.
2.  Dán URL vừa copy vào dòng `GOOGLE_SHEET_APP_URL="..."`.

### Bước 5: Kích hoạt Giao diện
1.  Quay lại Google Sheet, tải lại trang (F5).
2.  Chọn Menu mới xuất hiện: **🚀 100X AGENT** -> **Khởi tạo Hệ thống (Setup)**.
3.  Hệ thống sẽ tự động tạo đủ các Tab quản trị (`IDEA HUB`, `CONTENT PIPELINE`).

---

**Chúc mừng!** Hệ thống đã hoàn tất thiết lập. Hãy bắt đầu tạo ra những nội dung đột phá! 🚀
