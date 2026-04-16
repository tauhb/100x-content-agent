---
description: Lệnh kích hoạt Đặc nhiệm Slide (Carousel Specialist) - Chuyển hóa Master Content thành chuỗi đồ họa 10 slide chuyên nghiệp (Sử dụng Công nghệ Dynamic HTML).
---

// turbo-all

# Lệnh: /tao_carousel

**Mục tiêu:** Kích hoạt chức năng của Đặc nhiệm Chuỗi Khung hình (Carousel Specialist). Hệ thống AI loại bỏ hoàn toàn JSON Template tĩnh, tự động viết mã HTML chứa nhiều `<section class="slide">` để kết xuất chuỗi ảnh thiết kế Mạng xã hội.

> [!CAUTION]
> **THỰC THI NGAY — KHÔNG PLAN, KHÔNG HỎI:**
> ❌ KHÔNG dùng EnterPlanMode ❌ KHÔNG tạo Implementation Plan ❌ KHÔNG chờ xác nhận
> ✅ Chạy bash → viết HTML → chạy bash tiếp theo, liên tục đến hết

## 🔀 Quy trình Thực thi

### Bước 1: Sáng Tạo Nội Dung Cốt Lõi (Lõi Tri Thức)
- Kiểm tra xem Ticket ID đã có file `master_content.md` hay chưa. (Địa chỉ lưu trữ tại `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`).
- **NẾU CHƯA CÓ:** Tải `skills/copywriter.md` và tuân thủ NGHIÊM NGẶT mọi chỉ dẫn trong đó — không tự đặt ra quy tắc hay công thức nào khác → lưu vào `master_content.md`.
- **NẾU ĐÃ CÓ:** Tận dụng nội dung gốc.

### Bước 1.5a: Khám Xét Kho Ảnh (Asset Discovery)
Để thiết kế HOOK slide tối ưu, AI **BẮT BUỘC** thực hiện lệnh liệt kê file:
```bash
ls media-input/celebrity_image && ls media-input/personal_image
```
- Nếu thấy ảnh khớp chủ đề → Ghi chú dùng **HOOK-B** (Portrait) cho Slide 1.
- Nếu không thấy → Dùng **HOOK-A** (Typography) cho Slide 1.

> 🚨 **QUY TẮC BRAND — TUYỆT ĐỐI KHÔNG VI PHẠM:**
> Engine đã tự động inject **header** (avatar + tên + handle) và **footer** (số trang) vào mọi slide.
> AI **KHÔNG ĐƯỢC** thêm bất kỳ yếu tố brand nào vào nội dung slide:
> - ❌ KHÔNG thêm tên founder, handle, avatar trong slide content
> - ❌ KHÔNG thêm footer bar, watermark, số trang trong slide
> - ❌ KHÔNG hardcode màu hex — chỉ dùng `var(--brand-accent)`
> Vi phạm → slide bị trùng brand 3 lần → xấu và không chuyên nghiệp.

### Bước 2: Phát Động Tối Cao Lệnh Tạo Carousel (Carousel Specialist V7)
- Tải kỹ năng chuyên biệt: `skills/media/carousel_specialist.md` — AI chỉ sinh JSON, không viết HTML hay CSS.
- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):**
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel" && touch "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/carousel.json" "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/caption.txt"
  ```
- **Thực thi — theo đúng thứ tự:**
  1. Trích xuất **phần HOOK (tam đoạn mở đầu)** từ `master_content.md` và ghi vào `caption.txt` — đây là caption đăng kèm bài carousel, không phải toàn bộ bài viết.
  2. Phân tích nội dung → chia ý chính → ánh xạ vào **HOOK → BODY(s) → CTA**.
  3. 🔒 **KHAI BÁO LAYOUT (MANDATORY — trước khi viết bất kỳ slide nào):**
     Output 2 dòng này ra màn hình:
     ```
     LAYOUT_DECISION: BODY-[A/B/C/D]
     LÝ DO: [1 câu giải thích tại sao layout này phù hợp với chủ đề]
     ```
     Sau đó **khóa layout đó** — tất cả BODY slides phải dùng đúng layout đã khai báo, không có ngoại lệ.
  4. Với mỗi BODY slide: áp dụng layout đã khai báo, quyết định visual type (url_screenshot / icon / svg / vault), viết **ít nhất 3 items, tối đa 7 items** — mỗi item có đủ `text` và `detail`. Sau khi viết xong mỗi slide, đếm lại số items trước khi sang slide tiếp theo.
  5. Viết file `carousel.json` theo đúng schema trong specialist.

### Bước 3: Động cơ Kết xuất (JSON → PNG)
```bash
node scripts/html_carousel_engine.js --path "media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/carousel/carousel.json" --ticketId "[Ticket_ID]"
```

### Bước 4: Đồng bộ Thành phẩm lên Cloud
// turbo
- Thực thi: `node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Carousel', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"`.
- Mục tiêu: Để Quản trị viên có thể xem chuỗi Slide và duyệt đăng ngay trên Google Sheets.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:
- Nội dung bài viết: [caption.txt](đường/dẫn/tuyệt/đối)
- Link media: [Thư mục Carousel](đường/dẫn/tới/thư/mục/chứa/ảnh)

Đề xuất Quản trị viên Gọi lệnh `/duyet_dang` hoặc `/publish` để hệ thống đẩy bài.
// turbo-all