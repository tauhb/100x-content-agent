---
description: Lệnh trình chiếu Ấn phẩm Đa phương tiện (Đã xử lý hoàn thiện) để Quản trị viên kiểm duyệt trước khi Phát hành.
---

# Lệnh: /xem_output

**Mục tiêu:** Khi quy trình Biên tập Hình ảnh hoặc Kết xuất Video hoàn tất, lệnh này hỗ trợ Hệ thống trích xuất dữ liệu từ thư mục `media_output` dưới dạng Thẻ Giao diện đa phương tiện (Media Artifact) để Quản trị viên nghiệm thu.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG (CONTEXT-AWARE RULE)
Nếu Quản trị viên KHÔNG cung cấp mã Ticket ID sau lệnh, Hệ thống thực hiện theo thứ tự ưu tiên:
1. **Ưu tiên 1:** Sử dụng Ticket vừa được kết xuất trong phiên hội thoại hiện tại (VD: vừa chạy `/tao_slide` xong).
2. **Ưu tiên 2:** Quét thư mục `media_output/` lấy Bundle mới nhất theo ngày.
3. **Ưu tiên 3:** Nếu cả 2 nguồn trên đều trống, hỏi lại Quản trị viên.

## 🔀 Quy trình Thực thi của Hệ thống

### Bước 1: Trích xuất Kho Thành Phẩm
- Hệ thống tự động quét dữ liệu từ danh mục `media_output/[Ngày]/[Kênh]/` tại hạng mục Ticket sở hữu hoạt động gần nhất.
- Tiến hành xác thực định dạng hệ Sinh thái (Hệ thống chứa `gallery`, thành phẩm tĩnh `media.png` hoặc ấn phẩm động `mp4`).

### Bước 2: Hiển thị Thẻ Artifact (Preview Giao Diện)
- Khởi tạo ngay 1 Thẻ Artifact tương ứng (VD: `preview_[ticket_id].md`).
- **Phân loại Ấn Phẩm Tĩnh (Image) hoặc Phim ngắn (Reels):**
  Thực hiện nhúng (Embed) hình ảnh/video chuẩn Markdown kèm nội dung phụ đề (Caption Text) bên dưới.
  `![Thành Phẩm Trực Quan](đường/dẫn/tuyệt/đối)`
- **Phân loại Chuỗi Trình Chiếu (Carousel):**
  BẮT BUỘC sử dụng thẻ đánh dấu 4 Nháy (` ` ` `) cộng kèm định dạng phân tách Slide `<!-- slide -->` của máy chủ nhằm mô phỏng trải nghiệm người dùng tương đồng như mạng xã hội thực tế:
  ````carousel
  ![Slide 1](đường/dẫn)
  <!-- slide -->
  ![Slide 2](đường/dẫn)
  ````

### Bước 3: Đề Xuất Phê duyệt Hệ thống Đăng bài
- Nếu Quản trị viên xác nhận Ấn phẩm đáp ứng tiêu chuẩn, gợi ý thực hiện thao tác lệnh `/duyet_dang` để hệ thống tự động kết nối `publish_engine_pw.js` đưa phương tiện lên máy chủ nền tảng!
- Trường hợp nội dung Caption cần cải thiện văn phong, Quản trị viên có thể gửi yêu cầu chỉnh sửa văn bản trực tiếp. Hệ thống sẽ truy xuất tệp `caption.txt` để hỗ trợ chỉnh sửa thời gian thực.

// turbo-all
