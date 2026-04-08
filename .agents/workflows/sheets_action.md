---
description: Lệnh đồng bộ và thực hiện các hành động hàng loạt từ Bảng Điều Khiển CMS (Google Sheets Dashboard).
---

# Lệnh: /sheets_action

**Mục tiêu:** Kích hoạt chế độ "Trạm Vận Hành Cloud CMS". Hệ thống sẽ thực hiện đồng bộ 2 chiều giữa máy tính và Google Sheets, sau đó thực thi các lệnh mà Quản trị viên đã phê duyệt hoặc yêu cầu trên Bảng điều khiển.

## 🔀 Quy trình Thực thi của Hệ thống

### Bước 1: Đồng bộ Dữ liệu 2 Chiều (Cloud Sync)
Hệ thống kích hoạt bộ công cụ Google Sync Engine để đảm bảo dữ liệu mới nhất:
// turbo
1. **Đẩy kết quả lên:** Thực thi `node scripts/google_sync_engine.js --up`.
2. **Kéo lệnh hành động về:** Thực thi `node scripts/google_sync_engine.js --down`.

### Bước 2: Báo Cáo & Truy Cập Dashboard
Sau khi đồng bộ thành công, Hệ thống BẮT BUỘC đưa ra thông báo:

- **Trạng thái:** "🔄 Đã hoàn tất đồng bộ hóa hành động từ Google Sheets."
- **Hành động:** "Mời Quản trị viên truy cập vào Bảng điều khiển tại Google Sheets để kiểm soát dự án."
- **Link truy cập:** [Link Dashboard Google Sheets của bạn] (Lấy từ biến `GOOGLE_SHEET_APP_URL`).

### Bước 3: Hướng dẫn Thao tác trên Sheet
Nhắc nhở Quản trị viên các quyền năng hành động trên Sheet:
- Tại Tab **`💡 IDEA HUB`**: Đổi trạng thái sang `✅ Approved -> DO IT` để Robot tự động bắt đầu triển khai viết bài.
- Tại Tab **`🚀 CONTENT PIPELINE`**: Chọn `🚀 PUBLISH NOW` cho các bài đã sẵn sàng để hệ thống tự động đăng tải.

### Bước 4: Hậu kỳ sau khi Duyệt trên Sheet
Nếu Quản trị viên phản hồi: "Đã duyệt/Xong hành động trên Sheet", Hệ thống thực hiện lại lệnh `node scripts/google_sync_engine.js --down` để kích hoạt dây chuyền sản xuất nội dung hàng loạt.

// turbo-all
