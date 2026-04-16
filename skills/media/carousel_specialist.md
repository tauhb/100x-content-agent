---
name: Carousel Specialist V7 (JSON-Driven)
description: AI sinh file carousel.json với cấu trúc HOOK → BODY → CTA. Engine tự render thành PNG dùng template cứng. AI chỉ quyết định nội dung và layout — không viết HTML, không viết CSS.
---

# CAROUSEL ARCHITECT V7 — JSON OUTPUT

AI sinh ra file `carousel.json`. Engine đọc JSON và render slides bằng template cứng.

> 🚨 **LUẬT CỐT LÕI:**
> - AI **KHÔNG viết HTML, KHÔNG viết CSS**. Chỉ sinh JSON.
> - Cấu trúc bắt buộc: **HOOK → BODY(s) → CTA**
> - **Sentence case** — không viết HOA toàn bộ. Đúng: `Chiến lược tăng trưởng`. Sai: `CHIẾN LƯỢC TĂNG TRƯỞNG`.
> - **🔢 Mỗi BODY slide BẮT BUỘC có TỪ 3 ĐẾN 7 items** — không được ít hơn 3. Không có giới hạn từ. Viết nhiều = tốt.
> - Mỗi item **PHẢI có `detail`** — 1 câu cụ thể với số liệu hoặc ví dụ thực tế. Thiếu `detail` = sai.
> - **Nội dung liên quan đến công cụ/website/app** → LUÔN dùng `url_screenshot` + BODY-A. KHÔNG dùng SVG để mô phỏng logo hay UI.
> - Engine tự inject header (avatar + tên + handle) và footer (số trang). Không thêm brand vào JSON content.

---

## 📐 SCHEMA TỔNG QUAN

```json
{
  "slides": [
    { "type": "hook",  "layout": "HOOK-A|HOOK-B", ... },
    { "type": "body",  "layout": "BODY-A|BODY-B|BODY-C|BODY-D", ... },
    { "type": "cta",   "layout": "CTA", ... }
  ]
}
```

---

## 🧱 LOẠI 1 — HOOK (bắt buộc, 1 slide đầu tiên)

### HOOK-A: Typography thuần
*Dùng khi không có ảnh nhân vật phù hợp. Nền lấy từ Pexels.*

```json
{
  "type": "hook",
  "layout": "HOOK-A",
  "badge": "7 bí quyết",
  "title": "Chiến lược tăng trưởng không tốn 1 đồng",
  "subtitle": "Dành cho founder B2B đang bootstrap",
  "bg": { "vault": "image_stock", "keyword": "dark abstract business strategy" }
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `badge` | Không | Pill label nhỏ trên đầu (số, label ngắn) |
| `title` | Có | Tối đa 12 từ |
| `subtitle` | Không | 1 dòng làm rõ giá trị |
| `bg.keyword` | Nên có | Keyword tiếng Anh cho Pexels |

---

### HOOK-B: Portrait + Text overlay
*Dùng khi có ảnh nhân vật/celebrity phù hợp (bài về danh nhân, người nổi tiếng).*

```json
{
  "type": "hook",
  "layout": "HOOK-B",
  "badge": "10 bài học",
  "title": "Warren Buffett: Bí quyết đầu tư vượt thời gian",
  "bg": { "vault": "celebrity_image", "keyword": "warren buffett" }
}
```

| Field | Bắt buộc | Ghi chú |
|---|---|---|
| `bg.vault` | Có | `celebrity_image` hoặc `personal_image` |
| `bg.keyword` | Có | Tên nhân vật — engine tìm trong local vault |

---

## 🧱 LOẠI 2 — BODY (slide 2 đến n−1, mỗi slide 1 ý chính)

### ⚠️ BƯỚC BẮT BUỘC TRƯỚC KHI VIẾT BẤT KỲ SLIDE NÀO

Trước khi bắt đầu viết JSON, AI **PHẢI** khai báo 1 dòng:

```
LAYOUT_DECISION: BODY-[A/B/C/D]
LÝ DO: [Tại sao layout này phù hợp với chủ đề tổng thể]
```

Sau đó dùng **đúng layout đó** cho **TẤT CẢ** body slides. Tuyệt đối không thay đổi giữa chừng.

---

### Bảng chọn layout (chọn 1, dùng xuyên suốt):

| Chủ đề bài viết | Layout |
|---|---|
| Bài về tool, app, website cụ thể (có URL để chụp màn hình) | **BODY-A** |
| Bài có diagram, flow, chart so sánh làm visual chính | **BODY-B** |
| Bài phân tích, lý giải, nhiều text — visual chỉ minh họa | **BODY-C** |
| Bài quote, insight, triết lý — không cần visual minh họa | **BODY-D** |

---

### Mô tả ngắn 4 layout:

**BODY-A** — `Title → Visual full-width → Items bên dưới`
Dùng khi visual (screenshot/ảnh) là trọng tâm cần không gian lớn.

**BODY-B** — `Visual 1/3 trái | Title + Items 2/3 phải`
Dùng khi visual là SVG diagram hoặc icon lớn, text đủ để chiếm 2/3.

**BODY-C** — `Title + Items 2/3 trái | Visual 1/3 phải`
Dùng khi text là trọng tâm, visual chỉ minh họa thêm.

**BODY-D** — `Title + Quote + Items (không có visual)`
Dùng khi nội dung đủ mạnh để đứng một mình — quote, số liệu lớn, insight sắc bén.

---

### Ví dụ đầy đủ — BODY-D (canonical example, áp dụng logic tương tự cho A/B/C):

> 👉 Ví dụ này có **6 items** — đây là mức chuẩn. Slide nào có ít hơn 3 items là **sai**.

```json
{
  "type": "body",
  "layout": "BODY-D",
  "step": "01",
  "title": "Bán hàng không phải thuyết phục — là giúp đỡ",
  "quote": "Người mua tốt nhất là người đã tin bạn trước khi nghe pitch.",
  "items": [
    { "icon": "ph-handshake", "text": "Xây trust trước, pitch sau — tỉ lệ close cao hơn 60%", "detail": "Gửi 3 bài viết giá trị liên quan trước khi đề xuất call. Không cần dùng trick — chỉ cần đúng lúc." },
    { "icon": "ph-heart", "text": "Người mua quyết định bằng cảm xúc, lý trí chỉ để hợp lý hóa", "detail": "Nếu prospect nói 'Để tôi suy nghĩ thêm' — họ chưa tin, không phải chưa hiểu." },
    { "icon": "ph-chat-circle-dots", "text": "Lắng nghe nhiều hơn nói trong mọi cuộc gọi sales", "detail": "Tỉ lệ nghe:nói lý tưởng là 60:40. Sales nói nhiều hơn → prospect cảm thấy bị push." },
    { "icon": "ph-trophy", "text": "Follow-up là nơi 80% deal được chốt — không phải cuộc gọi đầu tiên", "detail": "Trung bình cần 5–8 điểm tiếp xúc trước khi prospect sẵn sàng mua. Hầu hết sales dừng sau 2." },
    { "icon": "ph-question", "text": "Câu hỏi hay hơn lập luận hay — luôn luôn", "detail": "'Điều gì đang giữ bạn lại?' hiệu quả hơn 10 trang slide thuyết phục. Hỏi → lắng nghe → phản ánh lại." },
    { "icon": "ph-chart-line-up", "text": "Đo tỉ lệ close theo từng giai đoạn, không phải tổng kết cuối tháng", "detail": "Nếu 70% deal tắc ở bước demo → vấn đề ở script demo, không phải ở prospecting." }
  ],
  "bg": null
}
```

> **Tự kiểm trước khi sang slide tiếp:** Đếm items trong slide vừa viết. Nếu < 3 → thêm ngay, đừng chuyển sang slide mới.

---

### Schema đầy đủ cho từng layout (để tham khảo field):

**BODY-A** cần thêm: `"visual": { "type": "url_screenshot", "url": "https://..." }` hoặc `"visual": { "type": "vault", "vault": "image_stock", "keyword": "..." }`

**BODY-B** cần thêm: `"visual": { "type": "icon", "name": "ph-[tên]" }` hoặc `"visual": { "type": "svg", "code": "<svg>...</svg>" }`

**BODY-C** cần thêm: `"visual": { "type": "svg", "code": "..." }` hoặc `"visual": { "type": "icon", "name": "..." }`

**BODY-D** không có visual. Có thể thêm `"quote": "..."`.

---

## 🖼️ VISUAL TYPES — 4 loại

| type | Dùng khi | Fields bổ sung |
|---|---|---|
| `"url_screenshot"` | **Tool, app, website, dashboard** — BẮT BUỘC khi nhắc đến tên công cụ cụ thể | `"url": "https://..."` |
| `"icon"` | Concept trừu tượng, không có visual rõ ràng | `"name": "ph-[tên icon]"` |
| `"svg"` | Diagram flow, funnel, comparison chart — **phải có số liệu thực** | `"code": "<svg>...</svg>"` |
| `"vault"` | Ảnh stock minh họa không khí, cảm xúc | `"vault": "image_stock"`, `"keyword": "..."` |

> ⚠️ **SVG KHÔNG THỂ hiển thị logo** (Notion, ChatGPT, Google, v.v.). Nếu slide nói về tool có tên → dùng `url_screenshot`, không dùng SVG.

> ✅ **SVG tốt** = có nhãn, số liệu, tên giai đoạn rõ ràng. **SVG xấu** = chỉ vẽ hình học không có text mô tả.

**Icon Phosphor hay dùng:**
`ph-target` `ph-users` `ph-chart-line-up` `ph-lightning` `ph-brain` `ph-rocket` `ph-coins` `ph-handshake` `ph-megaphone` `ph-funnel` `ph-check` `ph-star` `ph-bookmark-simple` `ph-share-network` `ph-heart` `ph-chat-circle-dots` `ph-trophy` `ph-pencil-line` `ph-envelope` `ph-arrows-clockwise`

**SVG mẫu — Funnel 3 giai đoạn (có nhãn + số liệu):**
```json
"visual": {
  "type": "svg",
  "code": "<svg width='320' height='200' viewBox='0 0 320 200'><rect x='40' y='8' width='240' height='44' rx='8' fill='rgba(255,255,255,0.12)'/><text x='160' y='36' text-anchor='middle' fill='#fff' font-size='17' font-weight='700'>Awareness — 10.000 người</text><rect x='70' y='68' width='180' height='44' rx='8' fill='rgba(255,255,255,0.18)'/><text x='160' y='96' text-anchor='middle' fill='#fff' font-size='17' font-weight='700'>Consideration — 800 người</text><rect x='100' y='128' width='120' height='44' rx='8' fill='#B6FF00'/><text x='160' y='156' text-anchor='middle' fill='#000' font-size='17' font-weight='800'>Sale — 64 người</text></svg>"
}
```

**SVG mẫu — Bar chart ngang (có số liệu %):**
```json
"visual": {
  "type": "svg",
  "code": "<svg width='380' height='180' viewBox='0 0 380 180'><text x='0' y='28' fill='rgba(255,255,255,0.6)' font-size='18'>Kênh A</text><rect x='110' y='8' width='240' height='30' rx='6' fill='rgba(255,255,255,0.08)'/><rect x='110' y='8' width='197' height='30' rx='6' fill='#B6FF00'/><text x='315' y='29' fill='#000' font-size='16' font-weight='800'>82%</text><text x='0' y='88' fill='rgba(255,255,255,0.6)' font-size='18'>Kênh B</text><rect x='110' y='68' width='240' height='30' rx='6' fill='rgba(255,255,255,0.08)'/><rect x='110' y='68' width='156' height='30' rx='6' fill='#B6FF00' opacity='0.7'/><text x='274' y='89' fill='#000' font-size='16' font-weight='800'>65%</text></svg>"
}
```

---

## 🧱 LOẠI 3 — CTA (bắt buộc, 1 slide cuối)

```json
{
  "type": "cta",
  "layout": "CTA",
  "headline": "Lưu lại để dùng khi cần",
  "sub": "Áp dụng 1 trong 5 chiến lược này tuần tới",
  "icon": "ph-bookmark-simple",
  "actions": [
    "Lưu bài này lại",
    "Chia sẻ cho 1 founder khác"
  ],
  "bg": { "vault": "image_stock", "keyword": "success motivation dark" }
}
```

---

## ✅ CHECKLIST TRƯỚC KHI GHI FILE

- [ ] Đã khai báo `LAYOUT_DECISION: BODY-X` trước khi viết JSON?
- [ ] Slide đầu là HOOK, slide cuối là CTA?
- [ ] **Tất cả** BODY slides dùng đúng layout đã khai báo — không có layout khác lẫn vào?
- [ ] **ĐẾM từng slide:** Slide 1 có _ items / Slide 2 có _ items / ... — tất cả phải ≥ 3?
- [ ] Mỗi item có trường `detail` (không được bỏ qua bất kỳ item nào)?
- [ ] Không có chữ HOA TOÀN BỘ trong bất kỳ text field nào?
- [ ] Nội dung về tool/app → dùng `url_screenshot` + BODY-A, KHÔNG dùng SVG?
- [ ] SVG có nhãn text + số liệu rõ ràng (không chỉ là hình học)?
- [ ] JSON hợp lệ — không thiếu dấu phẩy, không thiếu ngoặc?
- [ ] Caption.txt chứa 100% nội dung gốc từ master_content.md?
