---
description: Lệnh kích hoạt Đặc nhiệm Slide (Carousel Specialist) - Chuyển hóa Master Content thành chuỗi đồ họa 10 slide chuyên nghiệp (Sử dụng Công nghệ Dynamic HTML).
---

# Lệnh: /tao_carousel

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Chuỗi Khung hình (Carousel Specialist). Hệ thống AI loại bỏ hoàn toàn JSON Template tĩnh, tự động viết mã HTML chứa nhiều `<section class="slide">` để kết xuất chuỗi ảnh thiết kế Mạng xã hội.

> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

## 🔀 Quy trình Thực thi

### Bước 1: Sáng Tạo Nội Dung Cốt Lõi (Lõi Tri Thức)
- Kiểm tra xem Ticket ID đã có file `master_content.md` hay chưa. (Địa chỉ lưu trữ tại `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`).
- **NẾU CHƯA CÓ:** Tự động gọi Não bộ Viết bài (`skills/brain/vietbai.md`). Trợ lý tự suy luận Idea và nặn ra 1 bài viết dài lưu vào `master_content.md`.
- **NẾU ĐÃ CÓ:** Tận dụng nội dung gốc.

### Bước 1.5: Khám Xét Kho Ảnh (Asset Discovery) - TOKEN-FREE
Để thiết kế Slide Bìa (Slide 1) tối ưu nhất, Trợ lý **BẮT BUỘC** thực hiện lệnh liệt kê file:
```bash
ls media-input/celebrity_image && ls media-input/personal_image
```
- Nếu thấy tên file khớp với chủ đề bài -> **Ghi chú lại để dùng Layout Portrait-Fade (65/35) cho SLIDE 1.**
- Nếu không thấy -> Dùng Layout Typography (`Centered-Flex`) cho Slide 1.

### Bước 2: Phát Động Tối Cao Lệnh Tạo Carousel (Carousel Specialist)
- Cập nhật Kỹ năng chuyên biệt: `skills/media/carousel_specialist.md`.
- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/carousel.html" "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/caption.txt"
  ```
- Trợ lý AI Tự vận hành tích hợp mọi Giác Quan Thiết Kế:
  1. Ghi 100% nội dung gốc vào `caption.txt`.
  2. Tự chia tách Nội Dung, vắt kiệt Chữ (Chỉ 30-50 từ/slide), đồng thời nảy ra ý đồ chèn Box Layout / Iconography chuẩn xác. 
  3. Trực tiếp biến Suy nghĩ Thiết kế thành Mã nguồn tạo file `carousel.html` xả thẳng vào tệp vừa tạo rỗng.

### Bước 3: Động cơ Kết xuất Đa Nhiệm (Camera Engine Loop)
Thực thi kết xuất thông lượng qua cơ chế Puppeteer Loop:
```bash
node scripts/html_carousel_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/carousel.html" --ticketId "[Ticket_ID]"
```

### Bước 4: Đồng bộ Thành phẩm lên Cloud
// turbo
- Thực thi: `node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Carousel', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"`.
- Mục tiêu: Để Quản trị viên có thể xem chuỗi Slide và duyệt đăng ngay trên Google Sheets.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [Thư mục Carousel](đường/dẫn/tới/thư/mục/chứa/ảnh)

Đề xuất Quản trị viên Gọi lệnh `/duyet_dang` hoặc `/publish` để hệ thống đẩy bài.
// turbo-all