---
description: Lệnh tự động bóc tách (Clone) một bài đăng Facebook, tái sinh nội dung và bọc dưới định dạng gốc (Layout Mimetics) kèm thiết kế 100X Brand Config.
---

# Lệnh: /clone_post

**Mục tiêu:** Kích hoạt giao thức Nhân Bản (Mimetics Protocol). Khi nhận được Link bài Post, AI sẽ tự động phân tách dữ liệu bài, nhưng tuyệt đối không copy xào nấu rẻ tiền. Thay vào đó, AI "nuốt" bài viết này coi như một Trọng tâm Ý Tưởng (Seed Idea) mới, viết lại 100% bằng thủ pháp Brand Copywriter, và tái sinh ra định dạng gốc (Carousel/Image) ứng với CSS của 100X Vibe.

> ⚠️ **LUẬT CHUẨN ĐỊNH DẠNG HỆ THỐNG:**
> Cấm Planning Phase. Chỉ cần tung link, phần còn lại cỗ máy chạy ngầm!

---

## 🔀 Quy Trình Vận Hành Mimetics (Brain Clone)

### Bước 1: 🕷️ Cào Dữ Liệu Thuần & Nạp Metadata
- Khi Quản trị viên gõ: `/clone_post [LINK_FACEBOOK]`
- AI kích hoạt cỗ máy:
  ```bash
  node scripts/facebook_scraper.js --url "[LINK_FACEBOOK]"
  ```
- Dữ liệu thu hồi MỚI NHẤT luôn được quét sạch và nằm tĩnh tại: `database/scraped_temp/latest/`.
- AI sử dụng tool `view_file` để tự mình đọc tệp `metadata.json` lấy tỷ lệ ảnh gốc, và đọc `caption_raw.txt` chứa content gốc.

### Bước 2: 🧠 Triệu hồi Kỹ Năng Biên Tập (The Brain)
- Từ cái gốc của Fact/Thông tin cào được (và tham khảo `layout_snapshot.jpg` để xem hình thái bài), AI tự kích hoạt chéo bộ lệnh `/vietbai`.
- Gạt phăng ảnh cũ đi, chỉ lấy Text và Insight. AI viết ra một `master_content.md` hoàn toàn mới toanh với lời văn sắc bén của 100X! Bài viết này sinh ra và tự lưu vào `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`.

### Bước 3: 🎨 Tái Tạo Thể Xác (Smart Routing & Structural Mimetics)
Dựa vào tham số `detectedFormat` trong `metadata.json` ở Bước 1:
- Nếu là **`carousel`**: 
   - AI ngay lập tức kích hoạt lệnh `/tao_carousel`.
   - **Mimetics Prompt:** Ra chỉ thị mạnh cho lệnh tạo HTML: "Hãy học theo cách dàn cột (Layout) ở ảnh `layout_snapshot.jpg` nhưng code lại giao diện bằng CSS 100X. *CẤM NHÚNG ẢNH CŨ LÊN LÀM NỘI DUNG. Nội dung mới là Typography/Kính 100X!*" (Nếu cần không khí, nhúng thẳng thẻ `data-img-vault="image_stock"`. Ngoại lệ duy nhất là chèn ảnh gốc mờ ảo xuống Background).
- Nếu là **`single_image`**:
   - AI lập tức gọi `/tao_anh`.
   - **Mimetics Prompt:** Yêu cầu Đặc nhiệm xây CSS Layout tương tự bố cục ảnh gốc nhưng áp mã CSS hệ thống. Không dùng `<img src="xxx">` rác, mà hãy xử lý Typography.

### Bước 4: Chuyển Trạm và Nghiệm Thu
- Lệnh chạy Kết xuất Engine báo hoàn tất.
- In ra link xem trước (File Media & Caption txt).
- Dọn dẹp thư mục: `rm -rf database/scraped_temp/latest`
- Kích thích Quản trị viên sử dụng lệnh `/publish`!

// turbo-all
