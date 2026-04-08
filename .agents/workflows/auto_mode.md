---
description: Lệnh bật chế độ Tự hành (Autopilot) - Chuyên cơ Rảnh tay. Xử lý hàng loạt ý tưởng theo luồng Omnichannel (Đa định dạng Media) hoặc dọn dẹp kho tự động.
---

# Lệnh: /auto_mode

**Mục tiêu:** Kích hoạt Chế độ Tự Hành (Autopilot / Zero-Touch). Đây là lệnh định tuyến đa năng (Dual-Mode) mạnh nhất của hệ thống 100X Content Agent.

> ⚠️ **LUẬT CHUẨN ĐỊNH DẠNG HỆ THỐNG:**
> Hành trình chạy ngầm cực kỳ đồ sộ, thiết kế chuẩn xác để Quản trị viên chỉ cần gõ duy nhất một lệnh và bỏ tay ra khỏi bàn phím! Cấm tự ý xin phép, cấm hỏi lại.

---

## 🔀 Định Tuyến Chế Độ (Router)

AI tự động phân tích cú pháp câu lệnh của người dùng để rẽ nhánh:

- **Chế độ 1 (Dọn Kho Tổng Lực):** Nhận được lệnh `/auto_mode` đơn thuần. Giữ luồng giải quyết toàn bộ `ideation_pipeline.json` đang tồn đọng.
- **Chế độ 2 (Omnichannel Generator):** Nhận được lệnh `/auto_mode` KÈM THEO một hoặc nhiều Ý Tưởng (Ví dụ: `/auto_mode Ý tưởng 1, Ý tưởng 2`).

---

## 🔥 CHẾ ĐỘ 2: OMNICHANNEL GENERATOR (Khai Hoả Đa Định Dạng)

Hệ thống sẽ thực thi TUẦN TỰ cho TỪNG ý tưởng một theo danh sách người dùng truyền vào (Làm triệt để ý tưởng A, xong mới sang ý tưởng B). Với mỗi ý tưởng:

### Bước 1: 🎯 Khai Hỏa Hệ Sinh Thái Media (Single-Click Generation)
Hệ thống KHÔNG CẦN gọi lệnh `/vietbai` trước. Đối với TỪNG ý tưởng, AI lập tức đọc tham số Định Dạng Media mong muốn và gọi thẳng lệnh tương ứng:

1. **(Bắt buộc)** Gọi tự động lệnh `/tao_anh`: Để trích xuất Insight/Quote tạo ra một Ảnh Đơn đinh dập Watermark mỏ neo mạnh nhất.
2. **(Bắt buộc)** Gọi tự động lệnh `/tao_video_broll`: Xuất khẩu đoạn Clip Broll dài 8s gắn chữ 1080x1920 có nhạc giật gân, cuốn hút.
3. **(Tùy chọn - Thông Minh)** Nếu nội dung thuộc dạng Danh sách, 3 Lời khuyên, Hướng dẫn từng bước -> Gọi tự động lệnh `/tao_carousel`.
4. **(Tùy chọn - Thông Minh)** Nếu nội dung có số liệu, ma trận phức tạp -> Gọi tự động lệnh `/tao_infographic`.

*(Lưu ý: Ngay trong các lệnh này, AI đã Tự Động thực thi kỹ năng Viết Bài vào `master_content.md` trước khi tiến hành vẽ ảnh).*

### Bước 2: 🔄 Đóng Gói & Chuyển Trạm (Next Idea)
- Thông báo cho User biết Hệ Sinh Thái Media của Ý tưởng 1 đã hoàn tất (Cung cấp list đường dẫn vào kho Output).
- Chuyển sang thực thi Cụm Ý tưởng thứ 2, cho đến khi cạn kiệt danh sách!

---

## 🧹 CHẾ ĐỘ 1: DỌN KHO TỔNG LỰC (Legacy Auto-mode)

*Chỉ kích hoạt nếu KHÔNG có ý tưởng nào truyền vào lệnh.*

### Bước 1: Quét Radar Mạng Lưới Ticket
- Đọc `database/ideation_pipeline.json`. Khóa mục tiêu các Ticket `idea_ready`, `WAITING_FOR_COMMAND` / `master_ready`, và `media_ready`.

### Bước 2: Chuỗi Lặp Đa Phương Tiện (Single-Click Generation)
- Quét vé `WAITING_FOR_COMMAND` -> Gọi thẳng `tao_anh`, `tao_carousel`, `tao_video_broll` tương ứng theo Format yêu cầu. 
- (Kỹ năng Lõi Tri thức sẽ tự động kích hoạt bên trong lệnh).
- Sau khi có thành phẩm hiển thị, Nâng lên `media_ready`.

### Bước 3: Khai Hoả Phóng Trạm
- Quét vé `media_ready` -> và thông báo cho người dùng các đường link nội dung và media cần thiết để họ có thể xem.

---

## 📤 Báo cáo Tổng Kết
- Cập nhật số liệu.
- Gợi ý dùng lệnh /publish để đăng bài

// turbo-all