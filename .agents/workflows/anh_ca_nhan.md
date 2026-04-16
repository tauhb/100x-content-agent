---
description: Khởi động Xưởng Đúc Ảnh Cá Nhân - Đề xuất bối cảnh và Vẽ theo lô (Face-Conditioning).
---

# Lệnh: /anh_ca_nhan

**Mục tiêu**: Lấp đầy kho dữ liệu `personal_library` bằng cách tạo hàng loạt bối cảnh từ 1 khuôn mặt gốc. Giúp hệ thống đạt tốc độ tối đa cho việc Render bài viết sau này.

## Quy trình Thực thi

### Bước 1: Trí tuệ Đề xuất (Brainstorming)
- Đọc dữ liệu từ `database/my_accounts.json`, tìm account có `"active": true`, lấy `brand_identity.visual_vibe`.
- Trình bày ra **20 bối cảnh/concept** phù hợp với phong thái một Doanh nhân/Founder (VD: Đang ngồi điều hành ở bàn làm việc gỗ tự nhiên, đứng khoanh tay trên tòa nhà kính, sải bước ngoài đường may đo Vest...). 
- Liệt kê ra màn hình thành danh sách để User LỰA CHỌN. **DỪNG LẠI CHỜ USER CHỐT.**

### Bước 2: Khai hoả Lò Đúc (Bulk Generation)
- Nhận lệnh chốt từ User. AI kích hoạt công cụ `generate_image`.
- **Face-Conditioning BẮT BUỘC:** Tham số `ImagePaths` phải trỏ về `media-input/personal_image/master_face.jpg` (hoặc .png).
- Prompt thiết kế: `[Bối cảnh User chốt] + [Visual Vibe]`. Đảm bảo chân thực, sắc nét.
- Mỗi concept User yêu cầu, đúc ra lô **5 bức ảnh biến thể** (Tạo 5 lần).

### Bước 3: Đánh Nhãn Lưu Kho (Zero-Error Naming)
- Sử dụng Lệnh Terminal dời từng tệp ảnh từ Artifacts sang thẳng `media-input/personal_image/`.
- **Quy Tắc Tên File Tối Thượng:** Tiếng Việt Không Dấu, chữ thường, cách nhau bằng gạch dưới, kèm số đếm. (Ví dụ: `hoang_ba_tau_ngoi_cafe_1.jpg`). Tuyệt đối KHÔNG chứa từ `master`.
- Báo cáo xuất xưởng khi hoàn thành.