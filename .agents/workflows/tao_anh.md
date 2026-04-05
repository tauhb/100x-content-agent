---
description: Lệnh kích hoạt Đặc nhiệm Ảnh (Image Specialist) - Khởi tạo Ảnh đơn từ Master Content và xuất Caption 100% nguyên gốc.
---

# Lệnh: /tao_anh

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Hình ảnh (Image Specialist) trên hệ thống. Dựa vào tệp nội dung Master Content, Trợ lý AI sẽ tiến hành bóc tách trích dẫn (quote) tiêu điểm để thực thi quy trình tạo ảnh, đồng thời lưu giữ nguyên bản nội dung chuẩn làm thông điệp bài viết (Caption) hoàn chỉnh mà không làm hao hụt ngữ nghĩa.

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

### Bước 2: Khởi động Đặc nhiệm Hình ảnh (Image Specialist)
- Tải hệ thống Kỹ năng nòng cốt: `skills/media/image_specialist.md`.
- Yêu cầu Trợ lý AI thực hiện trọn vẹn 2 tác vụ song song: 
  1. Xác thực và sao lưu 100% nội dung nguyên gốc (Không bổ sung/Tóm tắt) làm Caption.
  2. Tổng hợp thông số Hình ảnh (`quote`, `keyword`) làm Payload JSON.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file phải chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp ngay tại THƯ MỤC GỐC dự án, tên BẮT BUỘC CHỨA SỐ NGẪU NHIÊN (VD: `draft_caption_5192.txt` và `draft_payload_5192.json`). Ghi 100% nội dung Caption và Dữ liệu JSON vào 2 file này. (TUYỆT ĐỐI không ghi thẳng vào thư mục `image/`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/image'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÀP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_JSON_NHÁP]', t+'/media_payload.json');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công. TUYỆT ĐỐI KHÔNG dùng công cụ Đọc/Phân Tích file để mở lại thư mục đích nhằm kiểm tra. Đi tiếp luôn!

### Bước 3: Động cơ Kết xuất (Trigger Rendering Engine)
Đây là quy trình thao tác kết xuất tự động hóa, Không đòi hỏi Quản trị viên can thiệp:
- Trợ lý tự động thi hành bộ mã cơ học: `npm run image -- --id "[Ticket_ID]"`.
- Lưu ý: Dịch vụ động cơ chạy dựa trên bộ nền tảng Playwright nội trú (Trình duyệt Tự hành) nhằm sản sinh tệp tin xuất xưởng mang tên `media.png`.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện: *"Đã hoàn tất quá trình Render hình ảnh đơn lẻ! Sản phẩm được lưu trữ tự động tại Bundle định dạng `[Ticket_ID]`. Quản trị viên vui lòng tiến hành thao tác gọi lệnh `/xem_output` nhằm kiểm duyệt lại thông số chất lượng trước khi nạp lệnh đăng tải."*

// turbo-all
