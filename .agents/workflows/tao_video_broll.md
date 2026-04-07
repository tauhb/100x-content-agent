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

### Bước 2: Khởi động Đạo diễn Video Nhấp Nháy (HTML B-Roll Loop Specialist) 
- Kích hoạt thuật toán tại mã nguồn: `skills/media/reels_broll_specialist.md` 
- Hệ thống Trợ lý sẽ bứt tách luồng thông tin:
  1. Loại bỏ toàn bộ nỗ lực làm Kịch Bản Âm Thanh. Kéo 1 câu Hook gây rúng động, thả vào một cái `div` HTML. Trình bày Font chữ cực to (`.giant-hook`).
  2. Xuất mã HTML thuần với nền `transparent`.
  3. Ghi đè 100% tài liệu văn bản gốc ra Caption.

- 🚨 **LUẬT CHỐNG CRASH IDE (BẮT BUỘC):** Để tránh lỗi "File not found", thao tác lưu file chia 2 nhịp:
  - **Nhịp 1:** TẠO MỚI 2 file nháp cực độc ngay TRONG THƯ MỤC ROOT dự án, sử dụng ĐUÔI SỐ CHỐNG TRÙNG LẶP (VD: `draft_caption_6628.txt` và `draft_broll_6628.html`).
  - **Nhịp 2:** Mở Terminal chạy lệnh Node dời 2 file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[TÊN_FILE_CAPTION_NHÁP]', t+'/caption.txt'); fs.renameSync('[TÊN_FILE_HTML_NHÁP]', t+'/broll.html');"
    ```
    *(Thay đổi cấu trúc ngoặc vuông cho đúng thực tế)*
  - **Nhịp 3 (ZERO-TOUCH):** Lệnh Terminal báo xong là Thành Công.

### Bước 3: Động cơ Kết xuất Video B-Roll (FFMPEG Engine)
- Hệ thống bắt đầu gọi tiến trình mã tự chạy: 
  ```bash
  node scripts/html_broll_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/broll.html" --ticketId "[Ticket_ID]"
  ```
- *(Thiết bị Node.JS lúc này sẽ nạp HTML làm khung lưới Trong Suốt, quét Video nền MP4, ốp Nhạc MP3 và FFMPEG xuất bản 8 giây mp4).*

## 📤 Báo cáo Sau Cùng
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [media.mp4](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên Gọi lệnh `/publish` để hệ thống kết nối đăng lên Facebook!// turbo-all
