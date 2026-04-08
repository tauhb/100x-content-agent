---
description: Lệnh kích hoạt Đặc nhiệm Ảnh (Image Specialist) - Khởi tạo Ảnh đơn từ Master Content và xuất Caption 100% nguyên gốc.
---

# Lệnh: /tao_anh

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Hình ảnh (Image Specialist) trên hệ thống. Dựa vào tệp nội dung Master Content, Trợ lý AI sẽ tiến hành bóc tách trích dẫn (quote) tiêu điểm để thực thi quy trình tạo ảnh, đồng thời lưu giữ nguyên bản nội dung chuẩn làm thông điệp bài viết (Caption) hoàn chỉnh mà không làm hao hụt ngữ nghĩa.

> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG lưu file xử lý tạm thời vào thư mục `/tmp/`. Toàn bộ dữ liệu thành phẩm phải được điều hướng và ghi đè trực tiếp trong thư mục dự án tương ứng: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG (CONTEXT-AWARE RULE)
Nếu Quản trị viên KHÔNG cung cấp mã Ticket ID sau lệnh, Hệ thống thực hiện theo thứ tự ưu tiên:
1. **Ưu tiên 1:** Sử dụng Ticket vừa được khởi tạo trong phiên hội thoại hiện tại (VD: bài viết vừa tạo bởi `/vietbai`).
2. **Ưu tiên 2:** Truy xuất `database/ideation_pipeline.json`, lấy Ticket mới nhất có trạng thái phù hợp.
3. **Ưu tiên 3:** Nếu cả 2 nguồn trên đều trống, hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 1: Sáng Tạo Nội Dung Cốt Lõi (Lõi Tri Thức)
- Kiểm tra xem Ticket ID đã có file `master_content.md` hay chưa.
- **NẾU CHƯA CÓ:** Tự động kích hoạt Não bộ Viết bài (`skills/brain/vietbai.md`). Trợ lý tự suy luận, phân tích Idea và viết ra một bài nội dung nguyên bản (Master Content) dài và chất lượng, lưu thẳng vào `master_content.md`. (Bỏ qua bước bắt Quản trị viên gõ `/vietbai`).
- **NẾU ĐÃ CÓ:** Bỏ qua bước này và tận dụng tệp `master_content.md` hiện tại.

### Bước 1.5: Khám Xét Kho Ảnh (Asset Discovery) - TOKEN-FREE
Để chọn Layout tối ưu (2/3 hay Center-Card), Trợ lý **BẮT BUỘC** thực hiện lệnh liệt kê file sau (Không tốn Token Vision):
```bash
ls media-input/celebrity_image && ls media-input/personal_image
```
- Nếu thấy tên file khớp với chủ đề bài (VD: `warren_buffett.jpg` cho bài về Buffett) -> **Ghi chú lại để dùng Layout Portrait-Fade (65/35) ở Bước 2.**
- Nếu không thấy -> Mặc định dùng Layout Typography (`Center-Card` hoặc `Split-Screen`).

### Bước 2: Khởi động Tối Cao Lệnh Tạo Ảnh (Image Specialist)
- Tải hệ thống Kỹ năng nòng cốt: `skills/media/image_specialist.md`.
- Yêu cầu Trợ lý AI thực hiện trọn vẹn Lệnh thông qua Tích hợp Nội Nhận Thức (Single-Core AI): 
  1. Ghi 100% nội dung gốc thẳng vào `caption.txt`.
  2. Tự động bóc tách, Rút Gọn chữ (Tối đa 50-80 từ) cho thiết kế, tự suy nghĩ Icon/Bố cục Mimetics phù hợp.
  3. Viết Mã nguồn giao diện Động Bespoke HTML (`image.html`) ngay lập tức mà không cần tạo file nháp thiết kế.

- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/image" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/image/image.html" "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/image/caption.txt"
  ```
- **Thực thi:** AI xả Code trực tiếp vào 2 file đích vừa được khởi tạo rỗng. Không dùng file nháp.

### Bước 3: Động cơ Kết xuất HTML (Trigger Rendering Engine)
Đây là quy trình thao tác kết xuất tự động hóa, Không đòi hỏi Quản trị viên can thiệp:
- Trợ lý tự động thi hành Cỗ máy SPA Nodejs: 
  ```bash
  node scripts/html_image_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/image/image.html" --ticketId "[Ticket_ID]"
  ```
- Lưu ý: Dịch vụ động cơ chạy dựa trên cơ chế SPA DOM Swapping để bắn Asset Pipeline trực tiếp vào HTML và chụp ảnh.

### Bước 4: Đồng bộ Thành phẩm lên Cloud
// turbo
- Thực thi: `node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Image', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"`.
- Mục tiêu: Để Quản trị viên có thể xem và duyệt đăng ngay trên Google Sheets.
## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [media.png](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên tiến hành Gọi lệnh `/duyet_dang` hoặc `/publish` để đẩy lên kênh nếu đã ưng ý.

// turbo-all