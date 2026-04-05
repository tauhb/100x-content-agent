---
description: Lệnh kích hoạt Đặc nhiệm Video Ngắn KHÔNG THOẠI (B-Roll Specialist) - Chuyển hóa Master Content thành một đoạn Clip ngắn 8-10 giây đính kèm nhạc nền để bẻ khoá vòng lặp thu hút sự chú ý.
---

# Lệnh: /tao_video_broll

> [!IMPORTANT]
> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

**Mục tiêu:** Trao quyền cho Quản trị viên kích hoạt định dạng Cực Phẩm B-Roll Loop Viral. Tại quy trình này, Hệ thống từ chối quyền thuyết minh giọng đọc (Voice Text) của Máy chủ ngôn ngữ. AI sẽ tổng hợp và chọn ra một Thước phim nền B-Roll chất lượng xuất sắc, treo 1 câu Hook đè thẳng lên phông chiếu và tạo hiệu ứng nhịp độ không lời thoại kéo dài 8 giây. Người xem sẽ bị nén ở lại Video để tra cứu thêm tài liệu chuyên sâu thuộc phân đoạn Caption thực tế.

## 🔀 Quy trình Thực thi Hệ thống

### Bước 1: Thu thập Dữ liệu Gốc
- Quét các Gói dữ liệu (Bundle) đang ở trạng thái Chờ (Trực tiếp từ lệnh `/vietbai` trong phiên hội thoại hiện tại, hoặc dữ liệu trong tệp `database/ideation_pipeline.json` đang hiển thị trạng thái `WAITING_FOR_COMMAND` hoặc `MASTER_READY`).
- Nhận diện và tải tệp `master_content.md` chứa nội hàm tri thức.

### Bước 2: Khởi động Lệnh Đạo diễn Video Vô Ngôn (B-Roll Loop Specialist) 
- Kích hoạt thuật toán tại mã nguồn: `skills/media/reels_broll_specialist.md` 
- Hệ thống Trợ lý sẽ tiến hành bứt tách luồng thông tin:
  1. Loại bỏ toàn bộ nỗ lực làm Kịch Bản Âm Thanh. Kéo duy nhất một câu Hook gây rúng động thả vào biến Layout JSON.
  3. Ghi đè xuất 100% tài liệu văn bản gốc ra làm Caption. Chế tài kiểm duyệt Caption Doctor bắt buộc phải được thi hành.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file phải chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp ngay tại THƯ MỤC GỐC dự án, tên BẮT BUỘC CHỨA SỐ NGẪU NHIÊN (VD: `draft_caption_9912.txt` và `draft_payload_9912.json`). Ghi 100% nội dung Caption và Dữ liệu JSON vào 2 file này. (TUYỆT ĐỐI không ghi thẳng vào thư mục `reels/`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÀP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_JSON_NHÁP]', t+'/media_payload.json');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công. TUYỆT ĐỐI KHÔNG dùng công cụ Đọc/Phân Tích file để mở lại thư mục đích nhằm kiểm tra. Đi tiếp luôn!

### Bước 3: Động cơ Kết xuất Video (Trigger Rendering Engine)
- Lưu thông số cài đặt JSON dạng Single_Scene (1 Phân đoạn) xuống biến `media_payload` trong kho lưu hành `database/ideation_pipeline.json`.
- Hệ thống bắt đầu gọi tiến trình mã tự chạy: `npm run reels`.
- *(Thiết bị Node.JS lúc này sẽ nạp JSON và xuất hiện báo cáo tương quan quy trình Trích Tải Video Nền, Quét thông số Giao diện rồi đổ ra bộ phần xuất chuẩn Media.mp4).*

## 📤 Báo cáo Sau Cùng
Đưa ra thông báo sau khi hoàn thiện: *"Lệnh chỉ huy Điều Hướng Đạo diễn 1 Cảnh B-Roll Loop đã dứt khoát hoàn tất! Một khung hình truyền thông mạnh mẽ với mức độ thu hút thị giác chuẩn Aesthetic được tạo thành, ép người dùng bị lôi tuột vào tệp Câu lệnh mô tả chi tiết tại Caption. Quản trị viên sử dụng lệnh chạy `/xem_output` để phê duyệt thành phẩm ngập tràn tương tác này!"*

// turbo-all
