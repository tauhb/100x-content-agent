# KẾ HOẠCH TỔNG THỂ: TÍCH HỢP APIFY & XÂY DỰNG DATA PIPELINE CHO 100X CONTENT

Để đáp ứng yêu cầu nâng cấp toàn diện việc thu thập và quản trị dữ liệu quy mô lớn (Enterprise-grade) mà không sợ bị Facebook chặn, và đồng thời quản lý chuẩn xác trọn vòng đời nội dung, chúng ta sẽ chuyển dịch từ mô hình "Cào thủ công" sang "Đường ống Dữ liệu Tự động (Data Pipeline)" với Apify.

Dưới đây là Giải pháp Hệ thống Toàn diện:

## 1. Tầng Thu thập Mục Tiêu (Target Management)
**Vấn đề:** Tránh việc người dùng phải ném lại link cũ nhiều lần và có chỗ quản lý đối thủ.
**Giải pháp:**
- Tạo một file CSDL mới: `database/target_pages.json` chứa danh sách các trang đối thủ/nguồn cấp.
- **Workflow mới `/add_target [URL]`**: Khi người dùng ném link, Agent sẽ:
  1. Đọc file `target_pages.json` xem link đã tồn tại chưa.
  2. Nếu có rồi -> Bỏ qua và thông báo *"Nguồn này đã nằm trong rada quét định kỳ"*.
  3. Nếu chưa -> Thêm mới với Object: `{ "id": "fanpage_123", "url": "[URL]", "status": "active", "last_scraped": null }`.

## 2. Tầng Máy Bơm Dữ Liệu (Apify Synchronization Engine)
**Vấn đề:** Tool Playwright cục bộ dễ bị gián đoạn, nặng máy, và bị FB block IP nếu quét nhiều.
**Giải pháp:**
- **Bảo mật:** Lưu cấu hình Apify Token tại file `.env` ẩn (`APIFY_API_TOKEN=xxx`).
- **Engine `scripts/apify_sync.js`**: 
  1. Script này gọi API sang máy chủ đám mây của Apify (dùng Actor `facebook-pages-scraper` hoặc tương đương).
  2. Nó đọc danh sách URL từ `target_pages.json` và yêu cầu Apify đi "Cào hộ" trên Cloud.
  3. Kết thúc, nó tải bộ dữ liệu JSON xịn sò (gồm Post Text, Metrics, Comments) về máy tính của Anh.

## 3. Tầng Bể Chứa & Chống Trùng Lặp (Data Lake & Deduplication)
**Vấn đề:** Không lưu trùng bài viết nếu chạy quét nhiều lần trong tháng.
**Giải pháp:**
- Dữ liệu thô tải từ Apify không ném thẳng cho Agent đọc ngay, mà đổ vào một bể chứa trung tâm: `database/raw_data_lake.json`.
- **Logic Chống Trùng (Upsert):** Mọi bài viết FB đều có 1 ID duy nhất (VD: `post_id: 12345`). Khi tải data về, hệ thống đối chiếu mảng:
  - Nếu `post_id` đã có trong Bể chứa -> Bỏ qua (Hoặc chỉ cập nhật nếu số Like/Share tăng vọt).
  - Nếu `post_id` chưa có -> Thêm mới vào Bể.

## 4. Tầng Xử Lý Tình Báo (Researcher Workflow Update)
**Vấn đề:** Dữ liệu thô từ Apify rất hỗn loạn, cần chuyển hóa thành Insight và "Hook".
**Giải pháp:**
- Lệnh `/research_topic` giờ đây không cần bật Browser lên cào nữa, thời gian chạy sẽ siêu tốc (chỉ 2 giây).
- Nó sẽ chui vào cái Bể `raw_data_lake.json`, lôi ra 10 bài mới nhất chưa từng đọc, ép qua Não Bộ để đóng gói lại thành `idea_bank.json`.

## 5. Tầng Bảng Điều Khiển Vòng Đời Nội Dung (Content Lifecycle Tracking)
**Vấn đề:** Làm sao biết Idea nào đã được dùng, ai chịu trách nhiệm, dùng cho kênh nào, chất lượng ra sao?
**Giải pháp:** 
- Nâng cấp schema của `database/idea_bank.json`. Mỗi idea giờ đây sẽ được gắn thêm 1 bộ **Meta-Tag Quản trị**:
```json
{
  "id": "idea_duynguyen_1",
  ... (Các trường cũ: topic, angle, insight, outline, hook)...
  
  "lifecycle": {
    "status": "UNUSED",            // Trạng thái: UNUSED | DRAFTING | IN_REVIEW | APPROVED | PUBLISHED | REJECTED
    "assigned_to": null,           // Giao cho AI nào viết (VD: "Copywriter_1") hoặc Nhân sự nào (VD: "Hoang Ba Tau")
    "target_channel": ["facebook", "tiktok"], // Kênh dự kiến dùng Idea này
    "quality_score": 9,            // Điểm số giá trị Insight (Researcher AI tự chấm 1-10)
    "used_in_content_id": null,    // Nếu đã xuất bản, gắn ID bài viết thành phẩm vào đây
    "date_added": "2026-03-24",
    "date_published": null
  }
}
```

## Luồng Thao Tác 3 Bước Mới Cho Dân Operator:
1. Ném Đạn: Gõ `/add_target [URL]` để ghim mục tiêu vào Rada.
2. Bom Đạn Dội Về: Hàng tuần Anh/Chị gõ `/sync_data`, để Apify cào tự động 10 trang mục tiêu và đổ vào Data Lake.
3. Chưng Cất Định Kỳ: Gõ `/research_topic`, AI sẽ bốc Data Lake ra nhào nặn thành Idea Bank (kèm trạng thái Unused chờ Copywriter dùng).

---
**Đây là kiến trúc chuẩn Enterprise cho hệ thống cào Data Social Media.** 
Thay vì cào ăn xổi, chúng ta xây kho dữ liệu vĩnh cửu.
