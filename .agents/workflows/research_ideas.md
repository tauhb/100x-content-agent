---
description: Lệnh kích hoạt toàn bộ quy trình Nghiên cứu Ý tưởng — Tự động cào dữ liệu, phân tích Insight và nhân bản ý tưởng từ Ma trận 5x5.
---

# Lệnh: /research_ideas

**Mục tiêu:** Kích hoạt quá trình tự động thu thập và thiết lập cơ sở dữ liệu ý tưởng (Idea Bank) thông qua phương pháp cào dữ liệu từ các tệp tham chiếu mở rộng, kết hợp ứng dụng Mạng lưới Ma trận chủ đề 5x5.

## ⚙️ QUY TẮC NẠP NGUỒN TỰ ĐỘNG (TÍCH HỢP ADD TARGET)
Nếu Quản trị viên cung cấp kèm URL sau lệnh (VD: `/research_ideas https://facebook.com/page123`), 
Hệ thống BẮT BUỘC thực hiện theo thứ tự:
1. **Ghi bổ sung (Append)** URL vào danh sách `database/target_pages.json` (Không ghi đè, chỉ thêm vào mảng).
2. Sau đó mới tiến hành cào dữ liệu từ URL đó cùng toàn bộ danh sách mục tiêu đã lưu.

Nếu Quản trị viên chỉ gõ `/research_ideas` (Không kèm URL), Hệ thống sử dụng toàn bộ 
danh sách URL đã có trong `database/target_pages.json`.

## 🔀 Quy trình Thực thi Hệ thống

### Bước 1: Thu thập Dữ liệu Thô (Data Scraping)
- Đọc danh sách URL từ `database/target_pages.json`.
- Hệ thống tự động phân tách tài nguyên và thực thi thu thập: `node scripts/fb_scraper.js`.
- Toàn bộ dữ liệu thô được lưu vào Hồ chứa Cấp độ 1: `database/raw_data_lake.json`.

### Bước 2: Phân tích và Nhân bản Ý tưởng (Idea Extraction & Matrix Expansion)
- Tải Kỹ năng chuyên biệt: `skills/researcher/SKILL.md` và Ma trận định hướng `database/strategy.json`.
- Hệ thống ứng dụng bộ sàng lọc 5 Trụ cột x 5 Góc nhìn của Ma trận cốt lõi. Mọi dữ liệu nguyên bản được bóc tách nội hàm (Insight) và tạo bản sao phản biện thành ý tưởng nội dung mới.
- Dữ liệu ý tưởng được lưu vào Bảng tin chờ duyệt: `database/idea_bank.json`.

## 📤 Báo cáo Kết quả
Tóm tắt trên Khung Chat:
- Số lượng URL đã quét.
- Số lượng Ý tưởng mới được sinh ra.
- Thông báo: *"Quản trị viên vui lòng gọi lệnh `/danh_sach_y_tuong` để xem Bảng điều khiển và phê duyệt các Ý tưởng đạt tiêu chuẩn."*

// turbo-all
