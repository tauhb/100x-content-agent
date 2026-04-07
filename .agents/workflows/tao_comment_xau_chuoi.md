---
description: Lệnh kích hoạt Trợ lý Phễu Bình Luận - Tái cấu trúc 100% nội dung Master Content thành một bài đăng "Tiêu điểm nền màu" và điều phối giá trị cốt lõi xuống phần Bình luận tự động.
---

# Lệnh: /tao_comment_xau_chuoi

**Mục tiêu:** Xử lý và tái cấu trúc dữ liệu tệp Master Content, chuyển đổi thành định dạng bài đăng ưu tiên tương tác. Nội dung truyền đạt được ẩn giấu và phân mảng theo cấu trúc chuỗi xuống phần Bình luận Facebook nhằm đạt mục tiêu giữ gìn tương tác tích cực, đồng thời duy trì trạng thái Giao diện tối giản (Một luồng câu Hook nhấn mạnh) ở Màn hình Trạng thái (Status).

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG lưu file xử lý tạm thời vào thư mục `/tmp/`. Mọi tệp vận hành xử lý bắt buộc ghi đè trực tiếp vào Gói lưu trữ hệ thống Bundle: `media_output/[Ngày]/[Kênh]/[Ticket_ID]/`.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG (CONTEXT-AWARE RULE)
Nếu Quản trị viên KHÔNG cung cấp mã Ticket ID sau lệnh, Hệ thống thực hiện theo thứ tự ưu tiên:
1. **Ưu tiên 1:** Sử dụng Ticket vừa được khởi tạo trong phiên hội thoại hiện tại (VD: bài viết vừa tạo bởi `/vietbai`).
2. **Ưu tiên 2:** Truy xuất `database/ideation_pipeline.json`, lấy Ticket mới nhất có trạng thái phù hợp.
3. **Ưu tiên 3:** Nếu cả 2 nguồn trên đều trống, hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 1: Nạp Dữ Liệu Lõi
- Rà soát luồng Gói lưu trữ chờ lệnh (Bundle Data) — ưu tiên Ticket vừa tạo trong phiên hội thoại hiện tại, hoặc truy xuất tệp `database/ideation_pipeline.json` đang hiển thị trạng thái `WAITING_FOR_COMMAND` hoặc `MASTER_READY`.
- Gắn kết tệp tin `master_content.md` làm nền tảng đầu vào chuẩn bị chu trình phân định.

### Bước 2: Kích hoạt Hệ thống Trợ lý Phễu Bình Luận (Comment Chain Specialist)
- Cập nhật Module: `skills/media/comment_chain_specialist.md`.
  - **Hạng mục Thực thi 1 (Khởi tạo bản nháp chữ - Text Draft):** Trợ lý cấu thành một dòng định vị nội dung rất ngắn cấu tạo làm Trạng thái (Status Cấp 1), kết hợp cùng khả năng phân mảnh nội dung lõi của Master Content trở thành mảng 5 đến 10 Phân đoạn nội dung Bình luận phụ trợ.
  - **Hạng mục Thực thi 2 (Chuyển đổi thành Phần mềm Media Payload):** Trợ lý cấu hình quy trình chuyển hoá danh sách phân đoạn thành chuỗi biến định danh chuẩn cấu trúc JSON.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file phải chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp ngay tại THƯ MỤC GỐC dự án, tên BẮT BUỘC CHỨA SỐ NGẪU NHIÊN (VD: `draft_caption_7392.txt` và `draft_payload_7392.json`). Ghi 100% nội dung Caption và Dữ liệu JSON vào 2 file này. (TUYỆT ĐỐI không ghi thẳng vào thư mục `comment_chain/`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/comment_chain'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÀP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_JSON_NHÁP]', t+'/media_payload.json');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công. TUYỆT ĐỐI KHÔNG dùng công cụ Đọc/Phân Tích file để mở lại thư mục đích nhằm kiểm tra. Đi tiếp luôn!

### Bước 3: Động cơ Kết xuất và Báo cáo
🚨 **BẢO VỆ TIẾN TRÌNH ZERO-TOUCH:** HỆ THỐNG TUYỆT ĐỐI KHÔNG ĐƯỢC phép chạm vào file `ideation_pipeline.json` để thay đổi trạng thái hay nhồi nhét Payload. Mọi thao tác lưu trữ đã được uỷ quyền cho Node.js ở Bước 2. Viết xong là BÁO CÁO KẾT QUẢ LUÔN, TUYỆT ĐỐI KHÔNG dùng công cụ lẩn quẩn chỉnh sửa bồi thêm vào bất cứ file nào nữa để tránh bị Ứng dụng IDE kẹt lệnh (Trạng thái hỏi Review Changes)!

Đưa ra thông báo nhắc nhở ngắn gọn trên màn hình chat với cấu trúc:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối/đến/file/caption_comments)
- Link media: [(Các) file hình ảnh](đường/dẫn/tuyệt/đối)

Nhắc nhở dùng `/publish` nếu ôn.
// turbo-all
