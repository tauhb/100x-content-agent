---
description: Lệnh kích hoạt Đặc nhiệm Slide (Carousel Specialist) - Chuyển hóa Master Content thành chuỗi đồ họa 10 slide chuyên nghiệp.
---

# Lệnh: /tao_slide

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Chuỗi Khung hình (Carousel Specialist). Trợ lý AI nhận dữ liệu từ Master Content, khởi tạo tư duy phân chia 1 bài viết dài thành chuỗi thiết kế tối đa hóa hiển thị mạng lưới (10-slide format). Phân tách Hook để làm nội dung bài viết gốc (Caption).

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG lưu file xử lý tạm thời vào thư mục `/tmp/`. Toàn bộ dữ liệu thành phẩm phải được điều hướng và ghi đè trực tiếp trong thư mục dự án tương ứng: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG (CONTEXT-AWARE RULE)
Nếu Quản trị viên KHÔNG cung cấp mã Ticket ID sau lệnh, Hệ thống thực hiện theo thứ tự ưu tiên:
1. **Ưu tiên 1:** Sử dụng Ticket vừa được khởi tạo trong phiên hội thoại hiện tại (VD: bài viết vừa tạo bởi `/vietbai`).
2. **Ưu tiên 2:** Truy xuất `database/ideation_pipeline.json`, lấy Ticket mới nhất có trạng thái phù hợp.
3. **Ưu tiên 3:** Nếu cả 2 nguồn trên đều trống, hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 1: Thu thập Dữ liệu Gốc
- Quét các Gói dữ liệu (Bundle) đang ở trạng thái Chờ (Trực tiếp từ lệnh `/vietbai` trong phiên hội thoại hiện tại, hoặc dữ liệu trong tệp `database/ideation_pipeline.json` đang hiển thị trạng thái `WAITING_FOR_COMMAND` hoặc `MASTER_READY`).
- Nhận diện và tải tệp `master_content.md` để khởi động thuật toán Trợ lý AI.

### Bước 2: Khởi động Đặc nhiệm Slide (Carousel Specialist)
- Cập nhật Kỹ năng chuyên biệt: `skills/media/carousel_specialist.md`.
- Trợ lý AI được chỉ thị hoàn thiện các tác vụ:
  1. Trích xuất phần Mở bài thôi miên và sao lưu làm nội dung truyền thông Caption.
  2. Lược dịch cấu trúc Thân bài kết tinh thành biểu mẫu JSON Payload chuỗi Slide.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file phải chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp ngay tại THƯ MỤC GỐC dự án, tên BẮT BUỘC CHỨA SỐ NGẪU NHIÊN (VD: `draft_caption_6692.txt` và `draft_payload_6692.json`). Ghi 100% nội dung Caption và Dữ liệu JSON vào 2 file này. (TUYỆT ĐỐI không ghi thẳng vào thư mục `carousel/`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÀP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_JSON_NHÁP]', t+'/media_payload.json');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công. TUYỆT ĐỐI KHÔNG dùng công cụ Đọc/Phân Tích file để mở lại thư mục đích nhằm kiểm tra. Đi tiếp luôn!

### Bước 3: Động cơ Kết xuất Slide (Trigger Rendering Engine)
Thực thi kết xuất thông lượng theo cơ chế Auto-Render chạy trên môi trường Node.js:
- Trợ lý tự động thi hành bộ mã cơ học: `npm run carousel -- --id "[Ticket_ID]"`.
- Lưu ý: Dịch vụ tiến hành chụp lại tất cả hệ thống phân hình thành chuỗi tài liệu `slide_01.png`, `slide_02.png` lưu trong ngăn chứa thư mục `gallery`.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện: *"Toàn bộ cấu trúc chuỗi Trình chiếu Carousel đã được hoàn thiện! Dữ liệu xuất hiện ổn định tại ngăn lưu trữ mảng `[Ticket_ID]`. Quản trị viên vui lòng tiến hành thao tác gọi lệnh `/xem_output` nhằm tiến hành rà soát ảnh động và chất lượng câu từ trước kỳ đăng tải phát hành."*

// turbo-all
