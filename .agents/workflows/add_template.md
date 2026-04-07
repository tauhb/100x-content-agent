---
description: Lệnh kích hoạt "Xưởng Đúc Template" - Yêu cầu AI (Antigravity) quét ảnh mẫu để thiết kế giao diện React/Remotion (Reels Layout) và liên kết tự động vào Engine.
---

# Lệnh: /add_template 

**Mục tiêu:** Trao quyền cho Quản trị viên bổ sung Giao Diện Phân Cảnh (Layout Skins) mới cho hệ máy đúc Video `tao_video` (Remotion Engine). Sự mở rộng thư viện Layout này giúp video Reels / TikTok được sinh ra với khung cảnh phong phú và có tính cách thương hiệu rõ ràng.

## 🔀 Định Tuyến Hoàn Thiện

### Bước 1: Tiếp nhận Yêu Cầu Thiết Kế Trực Quan
- Quản trị viên tải lên Tệp tin hình ảnh/Slide minh họa vào Khung đối thoại Chat.

### Bước 2: Viết Trực Tiếp Giao Diện React (Remotion Component)
- **THIẾT LẬP LUẬT VỀ MÀU SẮC THƯƠNG HIỆU (BRAND ADHERENCE):** Hệ thống BẮT BUỘC bỏ qua mọi màu sắc ngẫu nhiên của viền/điểm nhấn trên ảnh mẫu. Tất cả các điểm nhấn đồ họa, chữ màu, mảng phông viền... phải được gán thông qua Biến Màu Mặc Định `content.brand_accent || '#B6FF00'`.
- Khởi tạo trực tiếp một tệp React (TSX) trong thư mục nguồn: `scripts/reels_engine/src/templates/layouts/single_scene/Single[TênKhungHinh].tsx` (Ví dụ: `SingleTestimonialBubble.tsx`).
- Giao diện phải tương thích với `<AbsoluteFill>`, `<RichText text={...} brandAccent={...} />`.
- Toàn bộ dữ liệu hiển thị lấy qua đối tượng `content`, Ví dụ: `content.headline`, `content.author`, `content.quote`, `content.list`. (Không được phép nhập chữ chết Hard-code).

### Bước 3: Định Tuyến Router Giao Diện (Bắt buộc)
> ⚠️ **LUẬT THÉP (KHÔNG ĐƯỢC CHỈ BÁO CÁO MÀ PHẢI TỰ THỰC THI CHÍNH XÁC FILE):** 
AI lập tức mở và chỉnh sửa (Replace) **`scripts/reels_engine/src/templates/core/MultiSceneDarkTemplate.tsx`**:
- Thêm đường dẫn `import { Single[TênKhungHinh] } from '../layouts/single_scene/Single[TênKhungHinh]';` ở khối khai báo đầu file.
- Tìm điểm thả `{/* Bộ định tuyến Da (Layout Skin Router) */}` và thêm một thẻ React Router nối trực tiếp: 
  `{(layoutSkin === '[tên_nhãn_định_danh]') && <Single[TênKhungHinh] content={scene.visual_content} />}`

### Bước 4: 🧠 Tự Học - Đồng Bộ Cốt Lõi Kiến Thức AI
**LUẬT BẮT BUỘC:** Mỗi khi hoàn tất Bước 2 và 3, Đặc nhiệm AI phải sửa đổi (Edit) ngay bộ não để ghi nhớ nó vĩnh viễn. 
- Mở file Kỹ Năng của Đạo Diễn: `skills/media/reels_specialist.md`.
- Kéo xuống Bảng **"DANH SÁCH MẪU GIAO DIỆN CHUẨN (TEMPLATE) REELS (Trường layout_skin)"**. Bổ sung thêm 1 hàng Bảng `|` mới dưới cùng, điền chính xác `[tên_nhãn_định_danh]` và dịch dòng công dụng từ bức ảnh mẫu vào đó. Cấm thiếu bước này vì AI Đạo Diễn sẽ không biết có Skin mới để xài.

## 📤 Báo cáo Kết quả  
Đưa ra thông báo sau khi hoàn thiện: *"Mẫu Giao diện [Tên Khung Hình] đã chính thức đúc thành công vào Phân hệ Chuyển động Remotion System! Khung xương thiết kế đảm bảo bám sát Mã Màu Thương Hiệu (Brand Accent) theo hệ quy chiếu. Ngay lúc này, Engine đã hoàn tất nâng cấp Tự Học và sẵn sàng xài [tên_nhãn_định_danh] vào Video kế tiếp!"*

// turbo-all
