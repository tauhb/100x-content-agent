---
description: Lệnh bật chế độ Tự hành (Autopilot) - Chuyên cơ Rảnh tay. Ba chế độ — (1) Dọn kho tồn đọng, (2) Omnichannel từ ý tưởng cho trước, (3) Schedule Autopilot theo khung giờ kênh cụ thể (vd: /auto_mode Facebook).
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
- **Chế độ 3 (Schedule Autopilot):** Nhận được lệnh `/auto_mode` KÈM THEO tên Kênh (Ví dụ: `/auto_mode Facebook` hoặc `/auto_mode Kênh Profile Hoàng Bá Tầu`). Hệ thống tự lên lịch sản xuất nội dung theo khung giờ đăng bài của kênh đó.

---

---

## 📅 CHẾ ĐỘ 3: SCHEDULE AUTOPILOT (Lên Lịch Theo Kênh)

*Kích hoạt khi user truyền vào tên kênh (không phải ý tưởng cụ thể).*

### Bước 1: Đọc Lịch Đăng Bài Của Kênh
- Đọc `database/my_accounts.json`, tìm account có `"active": true`.
- Trong `accounts[active].channels`, tìm kênh khớp với tên user truyền vào (so khớp mềm, không phân biệt hoa thường).
- Trích xuất `posting_schedule`: danh sách các khung giờ, `content_type`, và `vibe` tương ứng.
- Nếu không tìm thấy kênh → thông báo và liệt kê các kênh hiện có để user chọn lại.

### Bước 2: Kiểm Tra Kho Ý Tưởng Trên Google Sheets
- Chạy: `node scripts/google_sync_engine.js --down`
- Đọc `database/ideation_pipeline.json` để kiểm tra số lượng ticket đang ở trạng thái `pending` / `idea_ready`.
- Số lượng slot cần lấp = số khung giờ trong `posting_schedule` (thường 3-4 slot/ngày).

### Bước 3: Đề Xuất Ý Tưởng Cho Từng Khung Giờ
- Nếu **đủ ý tưởng** từ kho → gán ý tưởng phù hợp nhất cho từng slot theo `vibe`.
- Nếu **thiếu ý tưởng** → AI tự sinh ý tưởng mới cho các slot còn trống. Quy tắc sinh ý tưởng:
  - `vibe: motivational` (sáng) → câu chuyện truyền cảm hứng, bài học cuộc sống
  - `vibe: tips` (trưa) → mẹo thực chiến, công cụ, thủ thuật
  - `vibe: educational` (chiều) → phân tích sâu, framework, so sánh
  - `vibe: storytelling` (tối) → câu chuyện cá nhân, case study, bài học thất bại

Sau đó trình bày bảng đề xuất để user xem xét:

```
📅 Lịch sản xuất hôm nay — [Tên Kênh] — [Ngày tháng]
┌──────────┬─────────────────────────────────────┬──────────────┬──────────────┐
│ Giờ đăng │ Ý tưởng                             │ Loại media   │ Nguồn        │
├──────────┼─────────────────────────────────────┼──────────────┼──────────────┤
│ 8h30     │ 5 thói quen buổi sáng của tỷ phú... │ Carousel     │ Kho Sheets   │
│ 11h30    │ ChatGPT vs Gemini — cái nào tốt hơn │ Image        │ AI đề xuất   │
│ 15h30    │ Framework X giúp tăng doanh thu...  │ Video B-Roll │ AI đề xuất   │
│ 19h30    │ Câu chuyện thất bại đầu đời của anh │ Infographic  │ AI đề xuất   │
└──────────┴─────────────────────────────────────┴──────────────┴──────────────┘
Gõ [Duyệt] để bắt đầu sản xuất, hoặc chỉnh sửa ý tưởng bất kỳ slot nào trước khi xác nhận.
```

### Bước 4: Ghi Ý Tưởng Mới Lên Google Sheets (nếu có AI đề xuất)
- Chỉ chạy bước này nếu có ít nhất 1 ý tưởng do AI sinh ra (không phải từ kho).
- Đẩy các ý tưởng mới lên IDEA HUB với status `✅ DUYỆT - LÀM NGAY`:
  `node scripts/google_sync_engine.js --up`

### Bước 5: Chạy Pipeline Sản Xuất Từng Slot (Tuần Tự)
Với mỗi slot trong bảng (thực thi theo thứ tự giờ đăng):

1. Gọi `/vietbai [ý tưởng]` → tạo Master Content
2. Gọi lệnh media tương ứng theo `content_type`:
   - `carousel` → `/tao_carousel`
   - `image` → `/tao_anh`
   - `video_broll` → `/tao_video_broll`
   - `infographic` → `/tao_infographic`
   - `video` → `/tao_video`
3. Sau khi có thành phẩm, đẩy lên CONTENT PIPELINE với đầy đủ thông tin:
   - **Kênh:** tên kênh đang chạy
   - **Hẹn giờ:** khung giờ của slot đó (vd: `8h30`)
   - Gọi hàm `pushResultToPipeline(ticketId, format, caption, mediaPath, ideaId, channel, postTime)`

### Bước 6: Báo Cáo Tổng Kết
Sau khi hoàn thành tất cả slot, xuất bảng tổng kết:

```
✅ Hoàn thành lịch sản xuất — [Tên Kênh] — [Ngày]
┌──────────┬──────────────┬──────────────────────────────────────────┐
│ Giờ đăng │ Loại media   │ File thành phẩm                          │
├──────────┼──────────────┼──────────────────────────────────────────┤
│ 8h30     │ Carousel     │ media_output/2025-01-15/carousel_xxx.png │
│ 11h30    │ Image        │ media_output/2025-01-15/image_xxx.png    │
│ 15h30    │ Video B-Roll │ media_output/2025-01-15/video_xxx.mp4    │
│ 19h30    │ Infographic  │ media_output/2025-01-15/info_xxx.png     │
└──────────┴──────────────┴──────────────────────────────────────────┘
Tất cả đã được ghi vào Google Sheets tab CONTENT PIPELINE. Dùng /publish để đăng từng bài.
```

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