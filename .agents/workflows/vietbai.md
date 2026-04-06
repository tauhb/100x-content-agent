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

- 🚨 **LUẬT CHỐNG LỖI CỞ SỞ DỮ LIỆU (ANTI-CRASH RULE):** Để IDE không bị văng lỗi "File not found" hay lỗi "Mờ file", bước lưu trữ phải đóng gói qua 2 nhịp:
  - **Nhịp 1:** AI bắt buộc TẠO MỚI một file ngay tại THƯ MỤC GỐC của dự án. File này **BẮT BUỘC PHẢI CHỨA 4 SỐ NGẪU NHIÊN** để làm mới bộ nhớ đệm của VS Code (Ví dụ: `draft_master_content_8392.md`, `draft_master_content_1045.md`...).
  - **Nhịp 2:** Sau khi lệnh tạo file hoàn tất thành công, AI MỞ TERMINAL và chạy một đoạn script Node.js sau để hệ thống tự động sinh cấu trúc và dời file vào khay chứa:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]'; fs.mkdirSync(t, {recursive:true}); fs.renameSync('[ĐIỀN TÊN FILE NHÁP VỪA TẠO Ở NHỊP 1]', t+'/master_content.md');"
    ```
    *(Ghi chú: Thay đổi các biến Mốc thời gian, Kênh, Ticket cho khớp thực tế)*
  - **Nhịp 3 (BẢO VỆ ZERO-TOUCH):** Lệnh Terminal trên báo xong tức là TỰ ĐỘNG THÀNH CÔNG 100%. **AI TUYỆT ĐỐI KHÔNG ĐƯỢC** dùng công cụ `view_file` hay bất cứ Tool nào khác để cố gắng Mở, Đọc, hay Phân Tích (Analyze) lại cái file `master_content.md` ở ổ đích. Việc AI tự do mở file ở thư mục sâu sẽ kích hoạt Cảnh báo Bảo mật chặn người dùng. Chạy xong Terminal là LỚT LUÔN sang bước tiếp theo!

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

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện: *"Tiến độ hoàn thiện quy chuẩn Master Content của nội dung `[Tên bài]` đã kết thúc và sẵn sàng lưu lại Bundle trung tâm `[Ticket_ID]`. Quản trị viên khởi động các tập lệnh theo hình thức kết xuất (`/tao_anh`, `/tao_slide`, hoặc lệnh `/tao_video`) để hệ thống kích hoạt nhóm Công cụ định dạng hoạt động thiết kế song song!"*

// turbo-all
