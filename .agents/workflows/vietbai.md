---
description: Viết Master Content độc lập — dùng khi muốn đọc và chỉnh sửa nội dung TRƯỚC khi tạo media. Các lệnh /tao_video, /tao_carousel, /tao_anh đã tự viết master_content nếu chưa có — không cần /vietbai trước đó.
---

// turbo-all

# Lệnh: /vietbai

> **Khi nào dùng lệnh này:**
> - Muốn **review và chỉnh sửa** bài viết trước khi chạy media
> - Muốn tạo **bài đăng text thuần** không kèm media
> - Dùng quy trình 2 bước: viết → kiểm duyệt trên Sheets → rồi mới `/tao_video`
>
> **Khi nào KHÔNG cần:** Nếu anh gọi thẳng `/tao_video [chủ đề]` — lệnh đó tự viết master_content rồi chạy luôn.

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG sử dụng phân bổ file lưu trữ nháp tại đường dẫn `/tmp/`. Mọi hồ sơ liên kết đối với chung quy dữ kiện đều yêu cầu lưu trữ cấu trúc ổn định bên trong Thư mục Nguồn: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.

---

## 🔀 Quy trình Thực thi

### Bước 1: Khởi tạo Dữ liệu Nền tảng (Pre-requisite)
- Khảo sát đầu vào từ khóa nguồn qua đề xuất của Quản trị viên, hoặc thông qua kho dự trữ thông tin nội hàm `database/idea_bank.json`.
- Truy xuất chuỗi giá trị Cột mốc Thời gian (`YYYY-MM-DD`), thuộc tính Kênh nền tảng tương tác, đồng thời phát sinh mã ID danh mục quy định tiêu chuẩn (`post_...`).
- Tham chiếu giá trị định hướng thương hiệu từ `database/my_accounts.json` (account có `"active": true`).

### Bước 2: Hiệu lệnh Triệu tập Trợ Lý Biên Tập (Master Content)
- Tải ngay bộ Kỹ năng Văn phong tại tệp: `skills/copywriter.md` và tuân thủ NGHIÊM NGẶT mọi chỉ dẫn trong đó — không tự đặt ra quy tắc hay công thức nào khác ngoài những gì skill quy định.
- Khởi tạo giá trị thuộc tính định mức `visual_hook_core` (Câu Thông Nạp Tiềm Năng Hiệu Suất Cao Nhất).

- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/master_content.md"
  ```
- **Thực thi:** AI xả Master Content trực tiếp vào file Đích vừa được khởi tạo rỗng. Không dùng file nháp.

### Bước 3: Tạo Ticket Lưu Khay Chờ (Pending Format)
Cấu trúc khởi tạo phiên chờ của Ticket, ĐẶC BIỆT KHÔNG KHAI BÁO biến tham số nội tại `media_payload`, phục vụ cơ chế nhãn đánh dấu chờ tiến trình tái định dạng hiển thị mạng:
```json
{
  "id": "[Ticket_ID]",
  "target_page": "[Kênh_Vận_Động]",
  "bundle_path": "media_output/[YYYY-MM-DD]/[Kênh_Vận_Động]/[Ticket_ID]",
  "format": "WAITING_FOR_COMMAND",
  "status": "pending"
}
```

### Bước 4: Đồng bộ Master Content lên Cloud
// turbo
- Thực thi: `node scripts/google_sync_engine.js --up`
- Mục tiêu: Cập nhật nội dung bài viết mới soạn thảo vào Tab `💡 IDEA HUB` với trạng thái `Ready` để Sếp kiểm duyệt tiếp phần Media.

## 📤 Báo cáo Kết quả

Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:

*Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)

Xin mời bạn khởi động các tập lệnh theo hình thức kết xuất (`/tao_anh`, `/tao_carousel`, hoặc lệnh `/tao_video_broll`) để hệ thống kích hoạt nhóm Công cụ định dạng hoạt động thiết kế song song!*

// turbo-all