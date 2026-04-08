---
description: Lệnh đồng bộ và truy cập Bảng Điều Khiển CMS (Google Sheets Dashboard) để kiểm duyệt nội dung.
---

# Lệnh: /danh_sach_y_tuong

**Mục tiêu:** Kích hoạt chế độ "Trạm Kiểm Duyệt Cloud CMS". Hệ thống sẽ thực hiện đồng bộ 2 chiều giữa máy tính và Google Sheets, sau đó mời Quản trị viên truy cập vào Bảng điều khiển trực quan để phê duyệt hoặc giao việc cho AI.

## 🔀 Quy trình Thực thi của Hệ thống

### Bước 1: Đồng bộ Dữ liệu 2 Chiều (Cloud Sync)
Hệ thống kích hoạt bộ công cụ Google Sync Engine để đảm bảo dữ liệu mới nhất:
// turbo
1. **Đẩy Ý tưởng mới lên:** Thực thi `node scripts/google_sync_engine.js --up`.
2. **Kéo lệnh Duyệt về:** Thực thi `node scripts/google_sync_engine.js --down`.

### Bước 2: Báo Cáo & Truy Cập Dashboard
Sau khi đồng bộ thành công, Hệ thống BẮT BUỘC đưa ra thông báo:

- **Trạng thái:** "🔄 Đã hoàn tất đồng bộ với Google Sheets."
- **Hành động:** "Mời Quản trị viên truy cập vào Bảng điều khiển tại Google Sheets để kiểm duyệt."
- **Link truy cập:** [Link Dashboard Google Sheets của bạn] (Lấy từ biến `GOOGLE_SHEET_APP_URL` nhưng chuyển thành dạng Spreadsheet URL hoặc nhắc người dùng mở Bookmark).

### Bước 3: Hướng dẫn Thao tác trên Sheet
Nhắc nhở Quản trị viên các phím năng lượng trên Sheet:
- Tại Tab **`💡 IDEA HUB`**: Đổi trạng thái sang `✅ Approved -> DO IT` để Robot tự động bắt đầu viết bài.
- Tại Tab **`🚀 CONTENT PIPELINE`**: Xem thành phẩm cuối cùng và chọn `🚀 PUBLISH NOW` để đăng bài.

### Bước 4: Hậu kỳ sau khi Duyệt trên Sheet
Nếu Quản trị viên phản hồi: "Đã duyệt trên Sheet", Hệ thống thực hiện lại lệnh `node scripts/google_sync_engine.js --down` để cập nhật các Ticket mới vào máy và sẵn sàng cho lệnh `/vietbai`.

// turbo-all
