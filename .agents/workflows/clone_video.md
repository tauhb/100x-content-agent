---
description: Nhân bản và biến tấu một video YouTube thành video mới — cùng topic, khác hoàn toàn hook/góc nhìn/media. Tự động extract transcript, remix nội dung, rồi render video với Remotion + ElevenLabs.
---

// turbo-all

# Lệnh: /clone_video

> [!CAUTION]
> **THỰC THI NGAY — KHÔNG PLAN, KHÔNG HỎI:**
> ❌ KHÔNG dùng EnterPlanMode ❌ KHÔNG tạo Implementation Plan ❌ KHÔNG chờ xác nhận
> ✅ Chạy bash → ghi file → bash tiếp theo, liên tục đến hết

**Mục tiêu:** Nhận YouTube URL → Extract transcript → Phân tích cấu trúc video gốc → Remix hoàn toàn thành nội dung mới (cùng topic, khác góc nhìn/hook/ví dụ) → Tạo video 60-90 giây với Remotion.

---

## ⚙️ CÚ PHÁP

```
/clone_video [YOUTUBE_URL]
/clone_video [YOUTUBE_URL] --channel [tên_kênh]
/clone_video [YOUTUBE_URL] --lang vi
```

Ví dụ:
```
/clone_video https://youtu.be/dQw4w9WgXcQ
/clone_video https://www.youtube.com/watch?v=xxx --channel ainius
```

---

## 🔀 QUY TRÌNH THỰC THI

### Bước 1: Extract Transcript

Chạy Clone Video Engine để lấy transcript và scaffold ticket:

```bash
node scripts/clone_video_engine.js --url "[YOUTUBE_URL]" --channel "[CHANNEL]"
```

> **Nếu có flag `--lang`:** Thêm `--lang vi` vào lệnh trên để ưu tiên transcript tiếng Việt.

Engine sẽ tự động:
- Extract transcript qua YouTube InnerTube API (fallback: web scrape)
- Tạo Ticket ID dạng `CLN-xxxxx-xxx`
- Scaffold thư mục `media_output/[date]/[channel]/[ticket_id]/`
- Lưu transcript formatted tại `[bundle_path]/yt_transcript_formatted.txt`
- In ra **Remix Prompt** — đây là chỉ thị cho bước tiếp theo

---

### Bước 2: Đọc Transcript & Phân Tích

Đọc transcript đã được format:

```bash
cat "[bundle_path]/yt_transcript_formatted.txt"
```

Sau khi đọc, AI thực hiện phân tích nội bộ:

| Phân tích | Ghi chú |
|---|---|
| **Topic Core** | Chủ đề cốt lõi là gì? |
| **Hook Style** | Gốc dùng: số liệu / câu hỏi / controversy / story? |
| **Narrative** | Listicle / comparison / story arc / how-to? |
| **Tone** | Serious / motivational / analytical / hài hước? |
| **Key Claims** | 3-5 luận điểm chính có data cụ thể |
| **Gaps** | Góc nhìn nào video chưa khai thác? |

---

### Bước 3: Remix — Viết master_content.md Mới

Dựa trên phân tích, **viết lại hoàn toàn** và lưu vào `[bundle_path]/master_content.md`:

#### Luật Remix (BẮT BUỘC tuân thủ):

| ✅ GIỮ | ❌ CẤM |
|---|---|
| Topic cốt lõi | Copy bất kỳ câu nào từ transcript |
| Các fact/số liệu (đã verify) | Giữ nguyên cấu trúc bài gốc |
| Insight giá trị | Dùng cùng hook style |
| | Dùng cùng ví dụ/nhân vật |

#### Quy tắc đổi Hook:
- Gốc dùng **SỐ LIỆU** → dùng **CÂU HỎI** hoặc **CONTROVERSY**
- Gốc dùng **CÂU HỎI** → dùng **SỐ LIỆU** gây sốc (`HOOK_STAT`)
- Gốc dùng **STORY** → dùng **COMPARISON** (trước/sau, A vs B)
- Gốc dùng **CONTROVERSY** → dùng **LISTICLE** với twist

#### Cách viết master_content.md — tuân thủ `skills/copywriter.md`:

1. Đọc `database/my_accounts.json` → lấy đại từ xưng hô, tone, từ cấm của account `active: true`
2. Viết bài **đúng 7 phần STORY ADS** (Hook 3 câu → Mirror → Câu chuyện → Bước ngoặt → Insight 50-60% → Bài học → CTA mềm) — áp dụng **Luật Remix** ở trên để nội dung khác hoàn toàn bài gốc
3. Bài phải đạt **800–1200 từ** — tự đếm, nếu chưa đủ 800 từ thì mở rộng phần Insight
4. **KHÔNG chèn tiêu đề công thức** (`## HOOK:`, `## Phần 1:`, ...) — văn xuôi mượt mà tự nhiên
5. Sau phần CTA mềm, thêm khối meta **tách biệt** ở cuối file:

```markdown
---
source_url: [URL gốc]
source_title: [Tiêu đề gốc]
hook_style_used: [kiểu hook đã chọn]
b_roll_keywords: [5-8 keyword cho Pexels — KHÁC với video gốc]
ticket_id: [ticket_id]
---
```

---

### Bước 4: Scaffold + Director AI → Timeline JSON

**Bước 4.0 — Re-scaffold** (đảm bảo cấu trúc đầy đủ):
```bash
node scripts/reels_engine.js --scaffold --id "[TICKET_ID]" --channel "[CHANNEL]"
```

**Bước 4.1 — Director AI:**
- Tải skill: `skills/media/video_director_specialist.md`
- Đọc `master_content.md` vừa tạo
- Chia 10-15 phân cảnh (60-90 giây), gán Archetype
- **Lưu ý đặc biệt cho Clone Video:**
  - Nếu hook style là số liệu → Scene 1 PHẢI dùng `HOOK_STAT` (archetype mới)
  - B-roll keywords PHẢI khác với video gốc
  - Ưu tiên Foundation archetypes (C/D/E/F)
- Ghi Timeline JSON vào: `media_output/[date]/[channel]/[ticket_id]/reels/media_payload.json`

---

### Bước 5: Render Video

```bash
node scripts/reels_engine.js --id "[TICKET_ID]"
```

Engine tự động:
- Tải B-Roll từ Pexels với keywords mới
- Tạo voice ElevenLabs
- Render video 1080×1920 với Remotion

---

### Bước 6: Viết Caption

Dựa trên `master_content.md` vừa tạo, viết caption và lưu vào:
`media_output/[date]/[channel]/[ticket_id]/reels/caption.txt`

**Quy tắc caption:**
- Độ dài: 1800–2200 ký tự
- Cấu trúc: Hook → Nội dung chính → CTA
- Không dùng markdown headers, không `**bold**` kiểu markdown
- 5-8 hashtag cuối bài
- Không nhắc đến video gốc

---

## 📤 Báo Cáo Kết Quả

Sau khi hoàn thành, hiển thị:
- Ticket ID: `[TICKET_ID]`
- Source video: `[YOUTUBE_URL]`
- Timeline JSON: `[đường dẫn media_payload.json]`
- Video output: `[đường dẫn media.mp4]`
- Caption: `[đường dẫn caption.txt]`

Gọi `/publish` hoặc `/duyet_dang` để đăng bài.

---

## ⚠️ XỬ LÝ LỖI

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| `Video không có caption` | Video private hoặc tắt caption | Thử `--lang en`, nếu vẫn lỗi báo user |
| `Transcript rỗng` | Auto-caption bị tắt | Dùng `--lang en` hoặc chọn video khác |
| `Video unavailable` | Video bị xoá/private | Thông báo cho user |
| `Too many requests` | YouTube rate limit | Thử lại sau 30 giây |

// turbo-all
