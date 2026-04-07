---
description: Khởi động Xưởng Đúc Ảnh Stock - Gợi ý Concept và Vẽ nghệ thuật theo lô.
---
# Lệnh: /anh_stock

**Mục tiêu**: Làm đầy kho Rương `image_stock` nhằm phục vụ việc làm Nền (Background) cho các bài học triết lý, lời trích dẫn chung chung không mang tính định danh biểu tượng cá nhân. 

## Quy trình Thực thi

### Bước 1: Trí tuệ Đề xuất (Brainstorming)
- Trích xuất Gen Thẩm mỹ từ `database/brand_config.json`.
- Gợi ý **20 Ý Tưởng Trừu Tượng/Đồ Vật** kinh điển trong thế giới Doanh Nhân/Phát triển bản thân (VD: Đồng hồ đắt tiền, Quả địa cầu, Kính lúp trên bản hợp đồng, Bàn cờ vua, Bầu trời giông bão, Ngọn hải đăng...).
- Đợi User duyệt và chọn bối cảnh muốn đúc.

### Bước 2: Khai hoả Lò Đúc (Bulk Generation)
- Nhận Concept do User cấp. Trộn với Vibe Thương Hiệu tạo thành Master Prompt. Đảm bảo ảnh mang đậm chất chuyên nghiệp, có khoảng trống (Negative Space) để Engine dễ dập Text lên.
- Đúc trọn bộ lô **5 ảnh** cho Concept được chọn.

### Bước 3: Đánh Nhãn Lưu Kho (Zero-Error Naming)
- Dời ảnh từ Artifacts về `media-input/image_stock/`.
- **Quy Tắc Tên File Tối Thượng:** Tiếng Việt Không Dấu, chữ thường, cách nhau bằng gạch dưới, kèm số đếm. (Ví dụ: `dong_ho_rolex_1.jpg`). KHÔNG CHỨA DẤU CÁCH.
- Báo cáo xuất xưởng khi hoàn tất.
