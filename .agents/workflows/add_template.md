---
description: Lệnh kích hoạt "Xưởng Đúc Template" - Yêu cầu AI (Antigravity) quét ảnh mẫu để tái tạo thành file giao diện React/HTML thực tiễn, kèm theo "Tag Ngữ Cảnh" tự động.
---

# Lệnh: /add_template 

**Mục tiêu:** Trao quyền cho Quản trị viên khả năng Nâng cấp tính năng của Trợ lý Kết xuất Đa Phương Tiện (Visual Output Specialist). Nhờ vào công nghệ nhận diên hình ảnh, AI sẽ chủ động dịch thiết kế tĩnh từ ảnh mẫu của Quản trị viên sang khối mã thiết kế, cung cấp tài nguyên thiết kế mới cho hệ sinh thái của Động cơ.

## 🔀 Định Tuyến Hoàn Thiện

### Bước 1: Tiếp nhận Yêu Cầu Thiết Kế Trực Quan
- Quản trị viên sử dụng thao tác nạp một Tệp tin hình ảnh/Slide minh họa vào Khung đối thoại Chat.

### Bước 2: Kích Hoạt Tư Duy Thiết Kế Kiến trúc (Frontend Code Generation)
- Trợ lý Cấu trúc Tự động triển khai bộ kỹ năng Front-End Developer.
- Trợ lý AI có trách nhiệm rà soát ảnh mẫu và viết ra toàn bộ khối mã Cấu hình.
- **Nếu là Định dạng Template Trình Chiếu tĩnh (Carousel):** 
  Viết tệp tin chứa mã chuẩn đuôi `.html` mang tên `tên_template.html` lưu trực tiếp vào thư mục mã nguồn: `scripts/templates/carousel/`. Sử dụng cấu trúc CSS nhúng trực tiếp chuẩn hiện hành.
- **Nếu là Định dạng Phim Đa Khung (Reels):** 
  Viết tập lệnh chứa chuẩn biến thể CSS/React sử dụng hệ Remotion và cấp thêm định danh `layout_skin` cho thư mục `scripts/templates/reels/`. Mảng đồ họa cần đạt tính khả thi để luồng dữ liệu JSON từ Payload đè giá trị lên hiển thị. 

### Bước 3: Đặt Định Danh Hệ Thống Tự Động (Metadata Labeling)
Hệ thống AI đóng vai trò Đặt tên Nhãn cho sự tương quan của tệp lệnh:
- Khởi tạo giá trị Nhãn Tính Chất (Ví dụ: `["quote", "story", "bold_statement"]`) phản ánh rõ mục đích hiển thị cho hệ thống. 
- Yêu cầu cấu trúc thư viện tài nguyên phân loại. (Tài nguyên này sẽ là điểm tựa để Lệnh `/tao_anh` hoặc `/tao_slide` tự động phán đoán và khớp cấu trúc template tương thích với từng định dạng nội dung riêng biệt).

### Bước 4: 🧠 Tự Học (Self-Updating Template Database)
**LUẬT BẮT BUỘC:** Mỗi khi một Template / Layout mới được sinh ra hoàn tất ở các bước trên, Đặc nhiệm AI phải thực thi NGAY LẬP TỨC việc chỉnh sửa (Edit) để tự cập nhật bộ nhớ dài hạn, tránh tình trạng "tạo ra xong để đấy". 
- Trợ lý chủ động tự rà soát file Kỹ Năng tương ứng với Định Dạng sinh Template (`skills/media/..._specialist.md`).
- Bổ sung tên Giao Diện vừa thiết lập (Ví dụ: `minimal_warning`) cùng một mô tả ngắn gọn đi thẳng xuống Bảng **"DANH SÁCH MẪU GIAO DIỆN CHUẨN (TEMPLATE)"** nằm trong nội dung Markdown của bộ Kỹ Năng đó.
- Việc này giúp Đặc nhiệm Sinh Content của Quản trị viên trong tương lai nhận thức được sự xuất hiện của tài nguyên hiển thị mới để bóc tách.

## 📤 Báo cáo Kết quả  
Đưa ra thông báo sau khi hoàn thiện: *"Tiến hành tải Tệp mã nguồn định dạng giao diện đã được triển khai xong! Định danh Thiết kế (Template) mới vừa được thiết lập nội trú trên Nền tảng. Quản trị viên được quyền ra lệnh cho Phân hệ Render áp dụng tệp mẫu cho Lệnh kết xuất Ảnh/Video sắp tới của Hệ thống để theo dõi thực tiễn quy mô."*

// turbo-all
