---
description: Lệnh kích hoạt Đặc nhiệm Đạo diễn Video DÀI CÓ THOẠI (Reels Specialist) - Phân tách Master Content thành Kịch bản âm thanh Voiceover 30s-60s và Caption báo cáo độ sâu của nội dung.
---

# Lệnh: /tao_video

**Mục tiêu:** (LƯU Ý: ĐÂY LÀ LỆNH TẠO VIDEO PHÂN TÍCH ĐA CẢNH - MULTI-SCENE CÓ GIỌNG ĐỌC AI. Để làm video B-roll 1 cảnh 8 giây không lời, hãy dùng lệnh `/tao_video_broll`). Kích hoạt chức năng hoạt động của Trợ lý Kịch bản Đa phương tiện chuyên sâu. Hệ thống tiến hành tổng hợp nội hàm dữ kiện từ tệp gốc Master Content, sau đó lượng hóa chúng trở thành Kịch bản phim đa cảnh, tối ưu thời lượng cho trải nghiệm đoạn phim ngắn (15-60 giây).

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
- Nhận diện và tải tệp `master_content.md` để cung cấp định danh và nội dung cho Engine xử lí ngôn ngữ.

### Bước 2: Khởi động Đặc nhiệm Đạo diễn (Reels Specialist)
- Tải hệ thống mã giả chuyên biệt: `skills/media/reels_specialist.md`.
- Yêu cầu Trợ lý AI thực hành các thủ tục xử lý số liệu:
  1. Thi hành tóm tắt văn xuôi để làm Caption kịch bản.
  2. Bố cục quy trình thành phần cảnh quay và lời thoại đọc (Voiceover Text) gắn liền với từ khóa chuyển cảnh động (B-Roll Keywords) làm Payload JSON.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file phải chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp ngay tại THƯ MỤC GỐC dự án, tên BẮT BUỘC CHỨA SỐ NGẪU NHIÊN (VD: `draft_caption_1192.txt` và `draft_payload_1192.json`). Ghi 100% nội dung Caption và Dữ liệu JSON vào 2 file này. (TUYỆT ĐỐI không ghi thẳng vào thư mục `reels/`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÀP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_JSON_NHÁP]', t+'/media_payload.json');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công. TUYỆT ĐỐI KHÔNG dùng công cụ Đọc/Phân Tích file để mở lại thư mục đích nhằm kiểm tra. Đi tiếp luôn!

### Bước 3: Động cơ Kết xuất Dữ liệu Truyền thông (Trigger Rendering Engine)
Thực thi tính năng kết xuất phương tiện liên hoàn mà KHÔNG yêu cầu hỗ trợ tương tác từ Quản trị viên:
- Trợ lý cấp nguồn trực tiếp kích hoạt hệ điều hành: `node scripts/reels_engine.js "[Ticket_ID]"`.
- Lưu ý: Dịch vụ tiến hành phân chia tổng quan Kịch bản thành luồng mã code đồ họa chuyển động Remotion, nhằm trích xuất tệp hoàn thiện mang tính chất giải trí đa phương tiện `media.mp4`.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện: *"Mọi thủ tục dàn dựng và kết xuất ấn phẩm giải trí đa phương tiện đã đạt trạng thái sẵn sàng! Khung phim được tích hợp sẵn sàng tại cấu trúc thư mục Bundle `[Ticket_ID]`. Quản trị viên tiến hành khai thác lệnh `/xem_output` nhằm đánh giá phân bổ hình ảnh và khung phim trước khi truyền thanh trực tuyến."*

// turbo-all
