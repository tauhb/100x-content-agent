---
description: Lệnh phân tích và thiết kế đồ hoạ dài (Infographic) thông qua kỹ thuật Dynamic HTML Formatting.
---

# Lệnh: /tao_infographic

**Mục tiêu:** Kích hoạt quá trình tạo đồ hoạ siêu dài (Infographic). Hệ thống AI tự động sinh file mã nguồn `infographic.html` thay vì thiết kế đồ họa tĩnh thông qua API, giúp bảo tồn hiển thị chữ nội dung sắc nét 100%.

> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

## 🔀 Quy trình Thực thi

### Bước 1: Sáng Tạo Nội Dung Cốt Lõi (Lõi Tri Thức)
- Kiểm tra xem Ticket ID đã có file `master_content.md` hay chưa.
- **NẾU CHƯA CÓ:** Tự động kích hoạt Não bộ Viết bài (`skills/brain/vietbai.md`). Trợ lý tự suy luận Idea và nặn ra 1 bài viết dài lưu vào `master_content.md`.
- **NẾU ĐÃ CÓ:** Bỏ qua bước này và tận dụng nội dung gốc `master_content.md`.

### Bước 2: Phát Động Tối Cao Lệnh Tạo Infographic (Infographic Specialist)
- **TÍCH HỢP KIẾN THỨC:** Tự động tải bộ lệnh từ `skills/media/infographic_specialist.md` vào trí nhớ tạm thời. Trợ lý KHÔNG ĐƯỢC làm theo ý thích cá nhân, phải làm 100% tuân thủ các Khối Cấu Trúc quy định tại tệp Specialist trên.
- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục chuyên biệt:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/infographic" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/infographic/infographic.html" "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/infographic/caption.txt"
  ```
- **Thực thi thiết kế:**
  1. Ghi 100% nội dung bài viết từ `master_content.md` vào `infographic/caption.txt`.
  2. Phân tích nội dung và DÙNG CÁC KHỐI LEGO (Skeletons) trong `infographic_specialist.md` để dệt nội dung.
  3. Viết Mã nguồn `infographic.html` xả thẳng vào file `infographic/infographic.html`.
- **Kích thước ảnh:** Khóa ở tỷ lệ 4:5 (1080px x 1350px).

### Bước 3: Động cơ Kết xuất Kỹ thuât số (Camera Engine)
Thực thi lệnh Console tương tác với Javascript:
```bash
node scripts/html_infographic_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/infographic.html" --ticketId "[Ticket_ID]"
```

### Bước 4: Đồng bộ Thành phẩm lên Cloud
// turbo
- Thực thi: `node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Infographic', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"`.
- Mục tiêu: Để Quản trị viên có thể xem bản đồ hoạ chuyên sâu và duyệt đăng bài ngay trên Google Sheets.

## 📤 Báo cáo Sau Cùng
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [media](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên Gọi lệnh `/publish` để hệ thống kết nối đăng lên Facebook!

// turbo-all