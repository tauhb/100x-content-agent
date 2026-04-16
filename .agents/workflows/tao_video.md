---
description: Lệnh kích hoạt Đạo diễn Video Đa Cảnh (Multi-Scene Reels) - Phân tích Master Content, gán Archetype cho từng phân cảnh (B-Roll, Diagram, Chart, Terminal, Split), rồi kết xuất video 60-90 giây bằng Remotion.
---

// turbo-all

# Lệnh: /tao_video

> [!CAUTION]
> **THỰC THI NGAY — KHÔNG PLAN, KHÔNG HỎI:**
> Đây là pipeline tuyến tính hoàn toàn tự động. Bắt đầu Bước 0 ngay lập tức.
> ❌ KHÔNG dùng EnterPlanMode
> ❌ KHÔNG tạo "Implementation Plan" hay "Plan of Action"
> ❌ KHÔNG hiển thị danh sách bước rồi chờ xác nhận
> ✅ Chạy lệnh bash → ghi file → chạy lệnh bash tiếp theo, liên tục đến hết

**Mục tiêu:** Biến Master Content thành video chuyên nghiệp 60-90 giây với phong cách hình ảnh nhất quán theo Style Pack. Sử dụng Remotion làm lõi kết xuất duy nhất.

> ℹ️ **Lưu ý:** Để tạo video B-Roll ngắn 8 giây không lời, hãy dùng `/tao_video_broll`.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG

Nếu Quản trị viên KHÔNG cung cấp Ticket ID:
1. **Ưu tiên 1:** Dùng Ticket vừa được tạo trong phiên hội thoại hiện tại.
2. **Ưu tiên 2:** Truy xuất `database/ideation_pipeline.json`, lấy Ticket mới nhất có `master_content.md`.
3. **Ưu tiên 3:** Hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 0: Lưu chủ đề vào Idea Bank (BẮT BUỘC khi user cung cấp chủ đề)

Nếu Quản trị viên cung cấp chủ đề/topic kèm lệnh (VD: `/tao_video 7 bài học Tony Robbins`), **PHẢI ghi vào idea_bank trước** khi làm bất cứ điều gì khác:

```bash
node -e "
const fs = require('fs');
const p = 'database/idea_bank.json';
const bank = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')) : [];
bank.push({
  id: 'idea_' + Date.now(),
  topic: '[CHỦ ĐỀ USER CUNG CẤP]',
  source: 'manual_command',
  format: 'video_reels',
  created_at: new Date().toISOString()
});
fs.writeFileSync(p, JSON.stringify(bank, null, 2));
console.log('✅ Đã lưu topic vào idea_bank');
"
```

### Bước 1: Thu thập Dữ liệu Gốc
- Xác định Ticket ID và đọc file `master_content.md` từ bundle path tương ứng.
- Kiểm tra `database/ideation_pipeline.json` để lấy thông tin Ticket (target_page, bundle_path).
- **Nếu chưa có `master_content.md`:** Tải `skills/copywriter.md` và tuân thủ NGHIÊM NGẶT mọi chỉ dẫn trong đó — không tự đặt ra quy tắc hay công thức nào khác → lưu trực tiếp vào: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/master_content.md`

### Bước 2: Scaffold thư mục output + Kích hoạt Đạo diễn Phân Cảnh (AI Director)

**Bước 2.0 — Scaffold (BẮT BUỘC chạy đầu tiên):**
```bash
node scripts/reels_engine.js --scaffold --id "[Ticket_ID]" --channel "[target_page]"
```
Lệnh này tạo sẵn `media_output/.../reels/` + `reels/assets/` + placeholder `media_payload.json`. Sau khi scaffold xong, AI ghi thẳng vào path đã có — **không cần file nháp trung gian**.

**Bước 2.1 — AI Director:**
- Tải và tuân thủ NGHIÊM NGẶT bộ não tại: `skills/media/video_director_specialist.md`
- Thực thi ĐÚNG THỨ TỰ sau — KHÔNG ĐƯỢC bỏ qua hoặc đảo thứ tự bất kỳ bước nào:

  **🎨 BƯỚC A — KHAI BÁO STYLE PACK (BẮT BUỘC OUTPUT RA TRƯỚC):**
  Phân tích nội dung `master_content.md` → chọn 1 trong 5 Style Pack → output 2 dòng này ra màn hình TRƯỚC KHI làm bất cứ điều gì khác:
  ```
  STYLE_PACK: [TÊN_PACK]
  LÝ DO: [1 câu giải thích]
  ```
  ⛔ DỪNG lại ở đây nếu chưa output 2 dòng trên. KHÔNG ĐƯỢC chuyển sang Bước B.

  **📐 BƯỚC B — PHÂN CẢNH VÀ GÁN ARCHETYPE:**
  Chỉ thực hiện sau khi đã khai báo Style Pack. Chia nội dung thành 10-15 phân cảnh, **chỉ dùng archetype trong palette của Style Pack đã chọn** — tra bảng palette trong `video_director_specialist.md`. Trích xuất `props` đúng schema.

  **💾 BƯỚC C — GHI FILE:**
  Ghi Timeline JSON **trực tiếp** vào: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/media_payload.json`

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

### Bước 4: Ghi Caption cho video (BẮT BUỘC)

Ghi **100% nội dung gốc** từ `master_content.md` thẳng vào file — không cắt, không viết lại, không tóm tắt:
`media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/reels/caption.txt`

### Bước 5: Đồng bộ lên Cloud
- Thực thi:
  ```bash
  node -e "require('./scripts/google_sync_engine.js').pushResultToPipeline('[Ticket_ID]', 'Video Reels', '[Nội dung Caption]', '[Link_Media]', '[Source_Idea_ID]')"
  ```

## 📤 Báo cáo Kết quả

Sau khi hoàn thiện, hiển thị:
- Timeline JSON: [media_payload.json](đường/dẫn/tuyệt/đối)
- Link media: [media.mp4](đường/dẫn/tuyệt/đối)

Đề xuất Quản trị viên gọi `/duyet_dang` hoặc `/publish` để đẩy bài lên Facebook.