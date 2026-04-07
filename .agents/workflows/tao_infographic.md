---
description: Lệnh phân tích và thiết kế đồ hoạ dài (Infographic) thông qua kỹ thuật Dynamic HTML Formatting.
---

# Lệnh: /tao_infographic

**Mục tiêu:** Kích hoạt quá trình tạo đồ hoạ siêu dài (Infographic). Hệ thống AI tự động sinh file mã nguồn `infographic.html` thay vì thiết kế đồ họa tĩnh thông qua API, giúp bảo tồn hiển thị chữ nội dung sắc nét 100%.

## 🔀 Quy trình Thực thi

### Bước 1: Sao chép Caption gốc & Cấp phát Ticket
- 🚨 **Hệ thống truy xuất tệp lệnh `master_content.md` đang ở trạng thái Cần Xử Lý.** Nếu có mã Ticket xác định (VD: `--id ticket_1234`), sử dụng thư mục của Ticket đó tại `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]`. 
- **Sao lưu Caption nguyên bản:** AI có nhiệm vụ trực tiếp copy toàn bộ chuỗi nội dung văn bản trong file `master_content.md` và viết đè (rewrite) vào tệp `caption.txt` tại vị trí lưu trữ thuộc Bundle. Tuân thủ định dạng chuẩn, loại bỏ các cụm Header dạng kỹ thuật số (`## 1. MỞ BÀI...`). Tuyệt đối giữ nguyên không tóm tắt.

### Bước 2: AI Code Generation (Khởi tạo Cấu trúc Trực quan)
- AI phân tách bố cục bài viết để viết duy nhất một File Giao diện có định dạng `.html` tại vị trí lưu trữ với tên: `infographic.html`. (Ví dụ đường dẫn File đích: `media_output/2026-04-06/Facebook/[Ticket_ID]/infographic.html`).
- File `infographic.html` **chỉ chứa mã HTML/CSS nội bộ bên trong thẻ `<main>`** (Không cần thiết lập `<html>` hay `<head>`, vì máy ảnh đã bọc lớp Wrapper nền).
- **Luật Thiết Kế Không Gian (Spatial Reasoning & Typography):** 
   - **Tối ưu Bố cục:** Kích thước bức ảnh bị khóa vĩnh viễn ở tỷ lệ 4:5 (Rộng 1080px x Cao 1350px). Hệ thống Header/Footer đã chiếm khoảng 400px. Do đó, khu vực `<main>` chỉ có tối đa 950px chiều cao. **TUYỆT ĐỐI KHÔNG XẾP CÁC KHỐI THEO 1 CỘT DỌC**. Bắt buộc tính toán số lượng thông tin và sử dụng `CSS Grid` (Ví dụ `grid-template-columns: repeat(2, 1fr)`) hoặc thu nhỏ thông số phông chữ (`calc`) sao cho các khối nằm khít khung.
   - **Quy chuẩn Từ khóa:** Đối với các từ khóa bôi đen mấu chốt, BẮT BUỘC sử dụng thẻ `<i>` hoặc `<em>`. Hệ thống đã cài đặt sẵn Typography riêng biệt (Phông chữ nhấn, in nghiêng, màu Brand Accent và nền trong suốt) cho thẻ này. Không sử dụng background color.
   - **Tông màu nền:** Dùng thiết kế Dark Mode `var(--brand-main-bg, #0b0c10)` kết hợp với đường nhấn mã từ biến `var(--brand-accent)` thay vì dùng màu tĩnh. Tuyệt đối tuân thủ giao diện White Label.

### Bước 3: Động cơ Kết xuất Kỹ thuât số (Camera Engine)
Thực thi lệnh Console tương tác với Javascript:
```bash
node scripts/html_infographic_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/infographic.html" --ticketId "[Ticket_ID]"
```
Hệ thống Puppeteer tự động xử lý thiết kế và lưu trữ tại cùng địa chỉ với tên hiển thị là `media.png`.

## 📤 Báo cáo Sau Cùng
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [media](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên Gọi lệnh `/publish` để hệ thống kết nối đăng lên Facebook!

// turbo-all