---
description: Lệnh kích hoạt Đặc nhiệm Video Ngắn KHÔNG THOẠI (B-Roll Specialist) - Chuyển hóa Master Content thành một đoạn Clip ngắn 8-10 giây đính kèm nhạc nền để bẻ khoá vòng lặp thu hút sự chú ý.
---

# Lệnh: /tao_video_broll

> [!IMPORTANT]
> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

**Mục tiêu:** Trao quyền cho Quản trị viên kích hoạt định dạng Cực Phẩm B-Roll Loop Viral. Tại quy trình này, Hệ thống từ chối quyền thuyết minh giọng đọc (Voice Text) của Máy chủ ngôn ngữ. AI sẽ tổng hợp và chọn ra một Thước phim nền B-Roll chất lượng xuất sắc, treo 1 câu Hook đè thẳng lên phông chiếu và tạo hiệu ứng nhịp độ không lời thoại kéo dài 8 giây. Người xem sẽ bị nén ở lại Video để tra cứu thêm tài liệu chuyên sâu thuộc phân đoạn Caption thực tế.

## 🔀 Quy trình Thực thi Hệ thống

### Bước 0: Nạp Thông Số Thương Hiệu (Brand Config Load) - BẮT BUỘC
Trước khi viết bất kỳ dòng HTML nào, AI **PHẢI** đọc file sau:
```bash
cat database/brand_config.json
```
Trích xuất và lưu vào bộ nhớ tạm:
- `FOUNDER_NAME` = `founder`
- `BRAND_HANDLE` = `brand_identity.handle`
- `ACCENT_COLOR` = `brand_identity.colors.accent`
- `VISUAL_VIBE` = `brand_identity.visual_vibe`

> ⚠️ **NGHIÊM CẤM:** Tuyệt đối KHÔNG tự bịa tên thương hiệu, handle, hay màu sắc. Mọi giá trị phải lấy từ file trên.

### Bước 1: Sáng Tạo Nội Dung Cốt Lõi (Lõi Tri Thức)
- Kiểm tra xem Ticket ID đã có file `master_content.md` hay chưa.
- **NẾU CHƯA CÓ:** Tự động kích hoạt Não bộ Viết bài (`skills/brain/vietbai.md`). Trợ lý tự suy luận Idea và nặn ra 1 bài viết dài lưu vào `master_content.md`.
- **NẾU ĐÃ CÓ:** Bỏ qua bước này và tận dụng nội dung gốc.

### Bước 2: Phát động Đạo diễn Video Nhấp Nháy (HTML B-Roll Specialist)
- Kích hoạt thuật toán tại mã nguồn: `skills/media/reels_broll_specialist.md` 
- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/broll.html" "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/caption.txt"
  ```
- Yêu cầu Trợ lý AI Tự vận hành tích hợp thông qua CoT (Single-Core):
  1. **Bước Vibe Check (MỚI):** Đọc nội dung bài viết, xác định nó thuộc nhóm cảm xúc nào (POV, Châm ngôn, Mẹo, Triết lý, hay Bí mật). Tra bảng Ma Trận Đạo Diễn trong `reels_broll_specialist.md` để chốt Layout BẮT BUỘC.
  2. Ghi 100% nội dung gốc vào `caption.txt`.
  3. Trích xuất duy nhất 1 câu Hook đắt giá nhất.
  4. Trực tiếp viết mã HTML chèn đúng khối Lego đã chọn vào file `broll.html`.

### Bước 3: Động cơ Kết xuất Video B-Roll (FFMPEG Engine)
- Hệ thống bắt đầu gọi tiến trình mã tự chạy: 
  ```bash
  node scripts/html_broll_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/broll.html" --ticketId "[Ticket_ID]"
  ```
- *(Thiết bị Node.JS lúc này sẽ nạp HTML làm khung lưới Trong Suốt, quét Video nền MP4, ốp Nhạc MP3 và FFMPEG xuất bản 8 giây mp4).*

### Bước 4: Đồng bộ Thành phẩm lên Cloud
// turbo
- Thực thi: `node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Video B-Roll', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"`.
- Mục tiêu: Để Quản trị viên có thể xem Clip sản xuất và duyệt đăng ngay trên Google Sheets.

## 📤 Báo cáo Sau Cùng
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [media.mp4](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên Gọi lệnh `/publish` để hệ thống kết nối đăng lên Facebook!

// turbo-all