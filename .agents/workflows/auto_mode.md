---
description: Lệnh bật chế độ Tự hành (Autopilot) - Chuyên cơ Rảnh tay Zero-Touch. Tự động cuốn chiếu toàn bộ quá trình từ Ý tưởng -> Viết bài -> Render Media -> Đăng bài.
---

# Lệnh: /auto_mode

**Mục tiêu:** Kích hoạt Chế độ Tự Hành Toàn Phần (Autopilot / Zero-Touch). Đây là lệnh uy quyền nhất của hệ thống 100X Content Agent. Khi nhận lệnh này, AI sẽ đóng vai trò như một Tổng Giám Đốc, tự động rà quét tất cả các hạng mục còn tồn đọng trong kho dữ liệu và thực thi chuỗi nối tiếp từ A-Z cho đến khi nội dung được Post lên Facebook.

> ⚠️ **LUẬT CHUẨN ĐỊNH DẠNG HỆ THỐNG:**
> Hệ thống sẽ trực tiếp truy xuất `database/ideation_pipeline.json` để vạch lộ trình. Quá trình chạy ngầm cực kỳ đồ sộ, yêu cầu Quản trị viên không tắt IDE.

---

## 🔀 Định Tuyến Thực Thi Liên Hoàn (Zero-Touch Loop)

### Bước 1: Quét Radar Mạng Lưới Ticket
- Đọc `database/ideation_pipeline.json`.
- Thống kê chẻ nhỏ các Ticket theo 3 trạng thái tồn đọng:
  1. `idea_ready` (Mới có ý tưởng, chưa có chữ).
  2. `WAITING_FOR_COMMAND` / `master_ready` (Đã có chữ, đang chờ kết xuất ảnh/video).
  3. `media_ready` (Đã có mâm cỗ ảnh/video đầy đủ, chờ bấm nút POST).
- Báo cáo nhanh trước khi xuất phát: *"Ping! Hệ thống đã khóa mục tiêu [X] Ý tưởng chưa viết, [Y] Bài chưa làm Media, và [Z] Thành phẩm chờ đăng. Kích hoạt Động cơ Warp Drive!"*

### Bước 2: Chuỗi Lặp Viết Lách (Bộ não Brain)
- Vòng lặp quét các Ticket `idea_ready`. 
- AI tự động triệu hồi năng lực y hệt lệnh `/vietbai` để tư duy và sinh ra Master Content ngầm cho từng Ticket, sau đó đổi trạng thái lên `master_ready`.

### Bước 3: Chuỗi Lặp Kết Xuất Đặc Nhiệm (Bộ phận Media)
- Quay sang quét các Ticket `master_ready`.
- Căn cứ vào trường `format` (reels, single_image, carousel, b_roll), AI tự động trổ tài năng lực y hệt lệnh `/tao_anh`, `/tao_slide`, `/tao_video`.
- Tự động lưu Media vào `media_output` và nâng cấp trạng thái Ticket lên `media_ready`.

### Bước 4: Khai Hoả Phóng Trạm (Mạng lưới Publish)
- Tổng lực quét các Ticket `media_ready`.
- AI chọc thẳng vào luồng xử lý của `/publish`. Tự động khởi động Playwright, lấy File Media, nhấc Caption.txt và nhả bài đăng lên mạng xã hội.
- Gắn tích xanh `published` cho Ticket và lưu báo cáo.

---

## 📤 Báo cáo Tổng Kết Chặng
- Hiển thị Bảng Thống Kê Điểm Chạm:
  - Cột 1: ID Dự Án.
  - Cột 2: Hành động vừa xử lý (Đã viết / Đã render / Đã xuất bản).
  - Cột 3: Trạng thái (Thành công / Lỗi).
- Bắn pháo hoa: *"Chế độ Rảnh Tay đã khép lại Vòng Lặp Hoàn Mỹ! Toàn bộ mỏ vàng tài nguyên của ngài đã được đẩy lên Mạng xã hội thành công. Ngài có thể nhâm nhi ly Cafe cữ chiều được rồi!"*

// turbo-all
