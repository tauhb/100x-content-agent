---
description: Lệnh kích hoạt Đặc nhiệm Slide (Carousel Specialist) - Chuyển hóa Master Content thành chuỗi đồ họa 10 slide chuyên nghiệp (Sử dụng Công nghệ Dynamic HTML).
---

# Lệnh: /tao_carousel

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Chuỗi Khung hình (Carousel Specialist). Hệ thống AI loại bỏ hoàn toàn JSON Template tĩnh, tự động viết mã HTML chứa nhiều `<section class="slide">` để kết xuất chuỗi ảnh thiết kế Mạng xã hội.

## 🔀 Quy trình Thực thi

### Bước 1: Thu thập Dữ liệu Gốc
- Quét các Gói dữ liệu (Bundle) đang ở trạng thái Chờ tại `ideation_pipeline.json` hoặc sử dụng `--id` do user cung cấp. Địa chỉ lưu trữ tại `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.
- **Sao lưu Caption nguyên bản:** AI copy 100% phần thông tin MỞ ĐẦU (Tam đoạn Hook khoảng 3 câu đầu) trong tệp `master_content.md` và ghi vào `carousel/caption.txt`.

### Bước 2: AI Code Generation (Bespoke HTML)
- Cập nhật Kỹ năng chuyên biệt: `skills/media/carousel_specialist.md`.
- Trợ lý AI phân tích phần Thân Bài. AI sử dụng các công cụ cấu trúc (CSS Toolkit) để tạo trực tiếp 1 file tên `carousel.html` nằm gọn trong thư mục `carousel/`.
- File này sẽ bao trùm thẻ `<main>` và bên trong định dạng tối đa 10 khối `<section class="slide">...</section>`. Đặc nhiệm tự do sắp đặt Typography, Grid layout, Flexbox để biến hóa mỗi slide thành một bức ảnh đẹp đẽ (Size bị ép ở chuẩn 1080x1350).

### Bước 3: Động cơ Kết xuất Đa Nhiệm (Camera Engine Loop)
Thực thi kết xuất thông lượng qua cơ chế Puppeteer Loop:
```bash
node scripts/html_carousel_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/carousel.html" --ticketId "[Ticket_ID]"
```
## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [Thư mục Carousel](đường/dẫn/tới/thư/mục/chứa/ảnh)

Đề xuất Quản trị viên Gọi lệnh `/duyet_dang` hoặc `/publish` để hệ thống đẩy bài.
// turbo-all
