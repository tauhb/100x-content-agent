---
description: Lệnh kích hoạt Đạo diễn Video Đa Cảnh (Multi-Scene Reels) - Phân tích Master Content, gán Archetype cho từng phân cảnh (B-Roll, Diagram, Chart, Terminal, Split), rồi kết xuất video 60-90 giây bằng Remotion.
---

# Lệnh: /tao_video

> [!IMPORTANT]
> **ANTI-PLANNING DIRECTIVE:** Đây là chuỗi hành động tự động tuyến tính. AI thực thi ngay lập tức qua Run Command. TUYỆT ĐỐI KHÔNG vào Planning Mode, KHÔNG tạo Implementation Plan, KHÔNG hỏi xác nhận kế hoạch từ Quản trị viên.

**Mục tiêu:** Biến Master Content thành video chuyên nghiệp 60-90 giây với đa dạng hình ảnh (Cinematic B-Roll, Sơ đồ logic, Biểu đồ dữ liệu, Hiệu ứng terminal, So sánh đối lập). Sử dụng Remotion làm lõi kết xuất duy nhất.

> ℹ️ **Lưu ý:** Để tạo video B-Roll ngắn 8 giây không lời, hãy dùng `/tao_video_broll`.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG

Nếu Quản trị viên KHÔNG cung cấp Ticket ID:
1. **Ưu tiên 1:** Dùng Ticket vừa được tạo trong phiên hội thoại hiện tại.
2. **Ưu tiên 2:** Truy xuất `database/ideation_pipeline.json`, lấy Ticket mới nhất có `master_content.md`.
3. **Ưu tiên 3:** Hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 1: Thu thập Dữ liệu Gốc
- Xác định Ticket ID và đọc file `master_content.md` từ bundle path tương ứng.
- Kiểm tra `database/ideation_pipeline.json` để lấy thông tin Ticket (target_page, bundle_path).

### Bước 2: Kích hoạt Đạo diễn Phân Cảnh (AI Director)
- Tải và thực thi bộ não tại: `skills/media/video_director_specialist.md`
- Yêu cầu AI Director:
  1. Đọc toàn bộ `master_content.md`.
  2. Chia nội dung thành 10-15 phân cảnh (5-8 giây/cảnh, tổng 60-90 giây).
  3. Gán Archetype cho từng cảnh theo Ma trận trong `video_director_specialist.md`.
  4. Trích xuất `props` đúng schema (xem bảng Field bắt buộc trong Director skill).
  5. Xuất Timeline JSON hoàn chỉnh.

- 🚨 **LUẬT CHỐNG CRASH (BẮT BUỘC):** Lưu file chia 2 nhịp:
  - **Nhịp 1:** Ghi Timeline JSON vào file nháp tại THƯ MỤC GỐC dự án, tên PHẢI có số ngẫu nhiên (VD: `draft_payload_[RANDOM].json`).
  - **Nhịp 2:** Chạy lệnh Node dời file nháp vào đúng vị trí:
    ```bash
    node -e "const fs=require('fs'); const t='media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels'; fs.mkdirSync(t,{recursive:true}); fs.renameSync('[TÊN_FILE_NHÁP]', t+'/media_payload.json');"
    ```
  - **Nhịp 3:** Lệnh báo xong là Thành Công. KHÔNG đọc lại file để kiểm tra. Đi tiếp ngay!

### Bước 3: Kết xuất Video (Remotion Engine)
- Kích hoạt Engine bằng lệnh:
  ```bash
  node scripts/reels_engine.js --id "[Ticket_ID]"
  ```
- Engine sẽ tự động:
  - Inject `template_core: 'archetype_director'` cho mỗi scene có `archetype` field.
  - Normalize schema (chart_data → data array, code_lines → lines, props.keyword → b_roll_keywords).
  - Tải B-Roll từ kho Local (`media-input/background-video`) trước, fallback Pexels.
  - Tải Voice từ ElevenLabs (nếu có API key).
  - Render video 1080x1920 bằng Remotion → xuất `media.mp4`.

### Bước 4: Đồng bộ lên Cloud
- Thực thi:
  ```bash
  node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Video Reels', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"
  ```

## 📤 Báo cáo Kết quả

Sau khi hoàn thiện, hiển thị:
- Timeline JSON: [media_payload.json](đường/dẫn/tuyệt/đối)
- Link media: [media.mp4](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên gọi `/duyet_dang` hoặc `/publish` để đẩy bài lên Facebook.

// turbo-all
