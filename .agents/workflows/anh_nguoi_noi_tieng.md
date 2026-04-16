---
description: Khởi động Xưởng Đúc Ảnh Danh Nhân - Đề xuất Danh nhân và Vẽ theo lô.
---
# Lệnh: /anh_nguoi_noi_tieng

**Mục tiêu**: Lấp đầy kho `celebrity_image` để phục vụ các bài viết trích dẫn. Máy dập bài sẽ lôi ảnh đúc sẵn ra dùng chứ không tìm trên mạng nữa.

## Quy trình Thực thi

### Bước 1: Trí tuệ Đề xuất (Brainstorming)
- Đọc `database/my_accounts.json`, tìm account có `"active": true`, lấy `brand_identity.visual_vibe` để đồng bộ Vibe thẩm mỹ.
- Đề xuất **10 Tên Danh Nhân, Doanh Nhân Tỷ Phú nổi tiếng toàn cầu** (VD: Elon Musk, Marcus Aurelius, Steve Jobs, Naval Ravikant). Đi kèm là 1-2 concept chụp tương ứng cho từng người.
- In danh sách ra chờ User phản hồi chọn nhân vật.

### Bước 2: Khai hoả Lò Đúc (Bulk Generation)
- Kích hoạt công cụ `generate_image`. Prompt tuân thủ nghiêm ngặt Vibe thương hiệu để đúc tượng tỷ phú sao cho khớp với màu sắc của Kênh.
- Vẽ **5 bức chân dung** có thần thái khác nhau cho nhân vật mà User chốt.

### Bước 3: Đánh Nhãn Lưu Kho (Zero-Error Naming)
- Dời ảnh từ Artifacts về `media-input/celebrity_image/`.
- **Quy Tắc Tên File Tối Thượng:** Tiếng Việt / Tiếng Anh Không Dấu, chữ thường, cách nhau bằng gạch dưới, kèm số đếm. (Ví dụ: `elon_musk_doc_sach_1.jpg`).
- Báo cáo xuất xưởng khi hoàn thành.
