---
description: Lệnh kích hoạt Trợ lý Sáng tạo Nhãn quan (Brain) - Chuyên gia Biên Tập Viết ra văn bản gốc nguyên bản (Master Content) làm cơ sở cho mọi Định dạng xuất bản phương tiện.
---

# Lệnh: /vietbai

> [!IMPORTANT]
> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command / Viết File, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

**Mục tiêu (V3 Specialist):** Kích hoạt hệ sinh thái làm việc của Trợ lý Biên Tập nội dung nhằm phát triển nền móng cấu trúc cho **Master Content** (Nội dung Nguồn). Được định vị như Lõi Dữ Liệu Tối Cao của quy trình vòng lặp bao gồm toàn bộ Hệ giá trị Insight, Thông tin Fact, và dữ kiện Phát triển Câu Chuyện. Đầu ra này sẽ được tái xử dụng trên toàn bộ mảng Hình/Slide/Phim động (Image/Carousel/Reels) của hệ hệ sinh thái để loại bỏ nguy cơ chênh lệch định hướng ngôn ngữ (Tone).

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG sử dụng phân bổ file lưu trữ nháp tại đường dẫn `/tmp/`. Mọi hồ sơ liên kết đối với chung quy dữ kiện đều yêu cầu lưu trữ cấu trúc ổn định bên trong Thư mục Nguồn: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.

---

## 🔀 Quy trình Thực thi

### Bước 1: Khởi tạo Dữ liệu Nền tảng (Pre-requisite)
- Khảo sát đầu vào từ khóa nguồn qua đề xuất của Quản trị viên, hoặc thông qua kho dự trữ thông tin nội hàm `database/idea_bank.json`.
- Truy xuất chuỗi giá trị Cột mốc Thời gian (`YYYY-MM-DD`), thuộc tính Kênh nền tảng tương tác, đồng thời phát sinh mã ID danh mục quy định tiêu chuẩn (`post_...`).
- Tham chiếu giá trị định hướng thương hiệu từ `database/brand_config.json`.

### Bước 2: Hiệu lệnh Triệu tập Trợ Lý Biên Tập (Master Content)
- Tải ngay bộ Kỹ năng Văn phong tại tệp: `skills/copywriter.md`.
- Phát triển kịch bản văn xuôi dài hướng đích **Long Form (Dung lượng 800-2000 từ vựng)** tuân thủ NGHIÊM NGẶT Công thức 7 phần STORY ADS:
  - **LƯU Ý CỰC KỲ QUAN TRỌNG:** Thành phẩm là MỘT BÀI VIẾT LONG-FORM HOÀN CHỈNH, ĐỌC MƯỢT MÀ TỪ ĐẦU ĐẾN CUỐI (Tối ưu cho định dạng Ảnh + Text). TUYỆT ĐỐI KHÔNG ĐƯỢC CHÈN CÁC TIÊU ĐỀ CÔNG THỨC MÁY MÓC (ví dụ cấm dùng: `## 1. Core Insight`). 
  - Các yếu tố chiến lược (Hook, Facts, Story, CTA) vẫn phải có đầy đủ, nhưng phải được AI **HÒA QUYỆN NGẦM** vào văn phong kể chuyện tự nhiên mượt mà.
  - Chỉ được dùng Markdown Heading (`##`) cho các tiêu đề nội dung thật sự của bài viết.
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