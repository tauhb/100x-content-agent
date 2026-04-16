---
name: Infographic Specialist V7 (Decision Tree Routing)
description: AI tự viết toàn bộ HTML infographic 1080×1350. BẮT BUỘC chạy cây quyết định layout trước khi code. 2-column grid chỉ được dùng khi trả lời KHÔNG cho tất cả 7 câu hỏi. Engine inject 6 placeholder tĩnh + fetch ảnh động qua {{BG_IMAGE:keyword}}.
---

# 🎨 INFOGRAPHIC DESIGNER — DECISION TREE V7

Bạn tự viết **file HTML hoàn chỉnh** cho infographic 1080×1350px.

---

## 🚦 BƯỚC 0 — KHAI BÁO LAYOUT (BẮT BUỘC TRƯỚC KHI VIẾT BẤT KỲ DÒNG CODE NÀO)

Trước khi mở `<!DOCTYPE html>`, bạn PHẢI chạy cây quyết định bên dưới, rồi khai báo:

```
LAYOUT_CHOICE: [tên layout]
LÝ DO: [1 câu giải thích tại sao nội dung này phù hợp với layout đó]
```

Nếu thiếu khai báo này → DỪNG LẠI, phân tích lại từ đầu.

---

## 🗺️ CÂY QUYẾT ĐỊNH LAYOUT (ĐỌC THEO THỨ TỰ — DỪNG KHI GẶP "CÓ")

> 🚨 **NGHIÊM CẤM nhảy thẳng xuống 2-column grid.** Phải trả lời từng câu hỏi theo thứ tự.

**Câu 1: Nội dung có 2 phía đối lập rõ ràng? (trước/sau, đúng/sai, cũ/mới, A vs B)**
→ **CÓ** → dùng **Split panel** ✋ DỪNG

**Câu 2: Nội dung có số liệu cụ thể để so sánh? (%, $, lần, điểm số)**
→ **CÓ** → dùng **Bar chart ngang** ✋ DỪNG

**Câu 3: Nội dung thể hiện quan hệ giao thoa / giao điểm giữa 2–3 khái niệm?**
→ **CÓ** → dùng **Venn diagram SVG** ✋ DỪNG

**Câu 4: Nội dung có tầng bậc rõ ràng (cái lớn bao cái nhỏ, quan trọng hơn nằm trên)?**
→ **CÓ** → dùng **Pyramid SVG** ✋ DỪNG

**Câu 5: Nội dung có 4–6 yếu tố tạo thành hệ thống / chu kỳ khép kín (các yếu tố phụ thuộc nhau)?**
→ **CÓ** → dùng **Polygon đều** ✋ DỪNG

**Câu 6: Nội dung là danh sách 3–6 mục CÓ MÔ TẢ (thói quen, bước, tips, nguyên tắc, bài học)?**
→ **CÓ** → dùng **Timeline dọc** ✋ DỪNG *(layout mặc định cho danh sách ngắn có mô tả — tối đa 6 mục)*

**Câu 6.5: Nội dung là danh sách 7+ mục CÓ MÔ TẢ?**
→ **CÓ** → dùng **2-column card grid** ✋ DỪNG *(danh sách dài phải chia 2 cột — NGHIÊM CẤM nhét 7+ mục vào Timeline 1 cột)*

**Câu 7: Nội dung có ≥ 8 từ/cụm từ đơn lẻ KHÔNG CÓ mô tả kèm theo?**
→ **CÓ** → dùng **Word cloud** ✋ DỪNG

**Không khớp câu nào:** → dùng **2-column card grid** *(trả lời KHÔNG cho tất cả câu trên mới được dùng)*

---

> **Ví dụ áp dụng:**
> - "5 thói quen tỷ phú" → Câu 6 (danh sách 5 mục có mô tả) → **Timeline dọc** ✅
> - "7 công cụ AI tốt nhất" → Câu 6.5 (danh sách 7 mục có mô tả) → **2-column card grid** ✅
> - "10 bài học marketing" → Câu 6.5 (10 mục có mô tả) → **2-column card grid** ✅
> - "Mindset giàu vs nghèo" → Câu 1 (2 phía đối lập) → **Split panel** ✅
> - "ROI của 6 kênh marketing" → Câu 2 (số liệu so sánh) → **Bar chart** ✅
> - "Marketing ∩ Sales ∩ Product" → Câu 3 (giao thoa) → **Venn** ✅
> - "Maslow 5 tầng" → Câu 4 (tầng bậc) → **Pyramid** ✅
> - "6 trụ cột của doanh nghiệp bền vững" → Câu 5 (hệ thống khép kín) → **Polygon** ✅

---

## 🔑 PLACEHOLDER — BẮT BUỘC DÙNG

### 6 Placeholder tĩnh

| Placeholder | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `{{AVATAR_SRC}}` | Base64 avatar founder | `data:image/jpg;base64,...` |
| `{{FOUNDER_NAME}}` | Tên founder | `Hoàng Bá Tấu` |
| `{{BRAND_HANDLE}}` | Handle | `@rainmaker` |
| `{{ACCENT_COLOR}}` | Màu accent brand | `#B6FF00` |
| `{{FONT_PRIMARY}}` | Font chính | `Inter` |
| `{{FONT_SECONDARY}}` | Font nhấn mạnh (italic/serif) | `Playfair Display` |

### Placeholder động: `{{BG_IMAGE:keyword}}`

Dùng khi nội dung có **con người** hoặc cần chiều sâu hình ảnh. Engine tự fetch từ Pexels:

```html
<div style="background-image:url('{{BG_IMAGE:bill gates portrait professional}}');background-size:cover;background-position:center top;"></div>
```

**Quy tắc:** keyword tiếng Anh · mô tả cụ thể · tối đa 1 ảnh nền · chỉ dùng khi thực sự cần.

---

## 🚨 QUY TẮC BẮT BUỘC

1. **LAYOUT_CHOICE chỉ in ra chat** — TUYỆT ĐỐI KHÔNG đặt vào file HTML. Khai báo `LAYOUT_CHOICE` và `LÝ DO` chỉ được xuất hiện trong phản hồi text của AI, **không bao giờ nằm trong `infographic.html`**.
2. **File HTML hoàn chỉnh** — từ `<!DOCTYPE html>` đến `</html>`
3. **`width: 1080px; height: 1350px; overflow: hidden`** trên `body`
4. **Branding 1 lần duy nhất** — header nhỏ: avatar + tên + handle
5. **Sentence case** — chỉ viết hoa chữ đầu câu và tên riêng. SAI: `KHÁCH HÀNG`. ĐÚNG: `Khách hàng`
6. **NGHIÊM CẤM `text-transform: uppercase`** trong CSS — đây là nguyên nhân chính khiến chữ bị ALL CAPS không kiểm soát được. Muốn nhấn mạnh → dùng `font-weight: 900` hoặc màu accent, KHÔNG dùng uppercase.
7. **Nội dung ≤ 7 điểm** — chọn lọc, không chép cả bài
8. **Không `backdrop-filter`** — Puppeteer không render được
9. **Background phải có** — gradient tối hoặc ảnh nền. Không bao giờ nền trắng
10. **Quotes nguyên văn** từ `master_content.md`

---

## ✍️ FONT & NHẤN MẠNH

```css
:root {
  --font-main: '{{FONT_PRIMARY}}', sans-serif;
  --font-em:   '{{FONT_SECONDARY}}', serif;
  --accent:    {{ACCENT_COLOR}};
}
em, i, .em {
  font-family: var(--font-em);
  font-style: italic;
  color: var(--accent);
  font-weight: inherit;
}
```

---

## 🖼️ ẢNH NỀN + GRADIENT (nội dung có con người)

```html
<!-- Layer 1: ảnh mờ -->
<div style="position:absolute;inset:0;z-index:0;
  background-image:url('{{BG_IMAGE:alex hormozi entrepreneur}}');
  background-size:cover;background-position:center top;opacity:0.32;"></div>
<!-- Layer 2: gradient đậm dần từ trên xuống -->
<div style="position:absolute;inset:0;z-index:1;
  background:linear-gradient(to bottom,
    rgba(11,12,16,0.10) 0%,rgba(11,12,16,0.60) 40%,
    rgba(11,12,16,0.95) 75%,#0b0c10 90%);"></div>
<!-- Content z-index 2 -->
<div style="position:relative;z-index:2;">...</div>
```

---

## 🎨 SVG & ICON

**Phosphor Icons** (concept chung):
```html
<script src="https://unpkg.com/@phosphor-icons/web"></script>
<i class="ph ph-brain"></i>       <!-- tư duy -->
<i class="ph ph-rocket"></i>      <!-- tăng trưởng -->
<i class="ph ph-chart-line-up"></i>
<i class="ph ph-coins"></i>
<i class="ph ph-lightning"></i>
<i class="ph ph-target"></i>
<i class="ph ph-books"></i>
<i class="ph ph-users"></i>
```

**Inline SVG** (logo brand cụ thể — viết đơn giản, nhận ra được là đủ):**
Tối đa 1 icon/SVG mỗi ý. Chỉ dùng khi icon thực sự mô tả được concept.

---

## 📐 CODE MẪU CHO TỪNG LAYOUT

### Polygon đều (5 đỉnh)
```html
<div style="position:relative;width:900px;height:900px;margin:auto;">
  <!-- SVG connector lines ở giữa -->
  <svg style="position:absolute;inset:0;" width="900" height="900">
    <polygon points="450,60 820,295 690,730 210,730 80,295"
             fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <!-- Lines từ tâm ra mỗi đỉnh -->
    <line x1="450" y1="450" x2="450" y2="60"  stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <line x1="450" y1="450" x2="820" y2="295" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <line x1="450" y1="450" x2="690" y2="730" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <line x1="450" y1="450" x2="210" y2="730" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <line x1="450" y1="450" x2="80"  y2="295" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <!-- Tâm -->
    <circle cx="450" cy="450" r="6" fill="{{ACCENT_COLOR}}"/>
  </svg>
  <!-- Node tại mỗi đỉnh: top,left tương ứng với tọa độ polygon -->
  <div style="position:absolute;top:20px;left:370px;transform:translateX(-50%);text-align:center;width:180px;">
    <div style="width:48px;height:48px;border-radius:50%;background:{{ACCENT_COLOR}};margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:900;font-size:20px;">1</div>
    <div style="font-size:24px;font-weight:800;">Tập trung</div>
    <div style="font-size:18px;color:rgba(255,255,255,0.65);margin-top:4px;">Think Week cô lập</div>
  </div>
  <!-- Lặp tương tự cho 4 đỉnh còn lại -->
</div>
```

### Word cloud
```html
<!-- Từ to = quan trọng hơn. Đặt tay, không overlap -->
<div style="position:relative;flex:1;min-height:0;">
  <span style="position:absolute;font-size:72px;font-weight:900;top:5%;left:8%;color:{{ACCENT_COLOR}}">Tập trung</span>
  <span style="position:absolute;font-size:44px;font-weight:700;top:22%;left:55%">Kiên nhẫn</span>
  <span style="position:absolute;font-size:56px;font-weight:900;top:40%;left:5%">Hệ thống</span>
  <span style="position:absolute;font-size:36px;font-weight:600;top:38%;left:52%;color:{{ACCENT_COLOR}}">Tốc độ</span>
  <span style="position:absolute;font-size:48px;font-weight:800;top:60%;left:20%">Dữ liệu</span>
  <span style="position:absolute;font-size:40px;font-weight:700;top:65%;left:60%">Đòn bẩy</span>
  <span style="position:absolute;font-size:30px;font-weight:500;top:82%;left:10%;color:rgba(255,255,255,0.6)">Kỷ luật</span>
  <span style="position:absolute;font-size:34px;font-weight:600;top:80%;left:50%">Tầm nhìn</span>
</div>
```

### Bar chart ngang
```html
<div style="display:flex;flex-direction:column;gap:20px;flex:1;justify-content:center;">
  <!-- Mỗi bar row: label + track + value -->
  <div style="display:flex;align-items:center;gap:16px;">
    <div style="width:200px;font-size:22px;font-weight:700;text-align:right;flex-shrink:0;">Facebook Ads</div>
    <div style="flex:1;height:44px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
      <div style="width:82%;height:100%;background:{{ACCENT_COLOR}};border-radius:8px;display:flex;align-items:center;justify-content:flex-end;padding-right:14px;font-weight:800;font-size:20px;color:#000;">82%</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;gap:16px;">
    <div style="width:200px;font-size:22px;font-weight:700;text-align:right;flex-shrink:0;">Google SEO</div>
    <div style="flex:1;height:44px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
      <div style="width:65%;height:100%;background:{{ACCENT_COLOR}};border-radius:8px;display:flex;align-items:center;justify-content:flex-end;padding-right:14px;font-weight:800;font-size:20px;color:#000;">65%</div>
    </div>
  </div>
</div>
```

### Timeline dọc có số
```html
<div style="display:flex;flex-direction:column;flex:1;justify-content:space-evenly;padding-left:40px;position:relative;">
  <!-- Đường dọc -->
  <div style="position:absolute;left:60px;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.10);"></div>
  <!-- Mỗi bước -->
  <div style="display:flex;align-items:flex-start;gap:28px;position:relative;">
    <div style="width:48px;height:48px;border-radius:50%;background:{{ACCENT_COLOR}};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:22px;color:#000;flex-shrink:0;position:relative;z-index:1;">1</div>
    <div>
      <div style="font-size:28px;font-weight:800;line-height:1.2;">Xác định vấn đề</div>
      <div style="font-size:22px;color:rgba(255,255,255,0.70);margin-top:6px;line-height:1.4;">Phần lớn thất bại vì giải <em>sai bài toán</em>.</div>
    </div>
  </div>
</div>
```

### Split panel (Before/After)
```html
<div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:0;min-height:0;">
  <!-- Panel TRÁI: trạng thái cũ/sai -->
  <div style="background:rgba(255,60,60,0.06);border:1px solid rgba(255,60,60,0.20);border-radius:20px 0 0 20px;padding:36px 32px;display:flex;flex-direction:column;gap:20px;">
    <div style="font-size:22px;font-weight:800;color:rgba(255,80,80,0.9);letter-spacing:1px;">❌ Tư duy cũ</div>
    <!-- items -->
  </div>
  <!-- Panel PHẢI: trạng thái mới/đúng -->
  <div style="background:rgba(182,255,0,0.06);border:1px solid rgba(182,255,0,0.25);border-radius:0 20px 20px 0;padding:36px 32px;display:flex;flex-direction:column;gap:20px;">
    <div style="font-size:22px;font-weight:800;color:{{ACCENT_COLOR}};letter-spacing:1px;">✅ Tư duy mới</div>
    <!-- items -->
  </div>
</div>
```

### Venn diagram
```html
<div style="position:relative;flex:1;display:flex;align-items:center;justify-content:center;">
  <svg width="800" height="500" viewBox="0 0 800 500">
    <circle cx="300" cy="250" r="190" fill="{{ACCENT_COLOR}}" opacity="0.15" stroke="{{ACCENT_COLOR}}" stroke-width="2"/>
    <circle cx="500" cy="250" r="190" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <!-- Labels vòng trái, giao nhau, vòng phải -->
    <text x="200" y="250" text-anchor="middle" fill="white" font-size="22" font-weight="700">Marketing</text>
    <text x="400" y="245" text-anchor="middle" fill="white" font-size="20" font-weight="800">Growth</text>
    <text x="600" y="250" text-anchor="middle" fill="white" font-size="22" font-weight="700">Product</text>
  </svg>
</div>
```

### 2-column card grid (7+ mục)
```html
<!-- Dùng khi danh sách có 7+ mục có mô tả. Tối đa hiển thị 8 card (4 hàng × 2 cột). Nếu >8 mục thì chọn lọc 8 mục hay nhất. -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;flex:1;align-content:start;">
  <!-- Card mẫu — lặp lại cho mỗi mục -->
  <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:22px 20px;display:flex;flex-direction:column;gap:8px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;border-radius:50%;background:{{ACCENT_COLOR}};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#000;flex-shrink:0;">1</div>
      <div style="font-size:22px;font-weight:800;line-height:1.2;">Tên mục ngắn gọn</div>
    </div>
    <div style="font-size:17px;color:rgba(255,255,255,0.70);line-height:1.4;padding-left:48px;">Mô tả tối đa 1 dòng, ngắn gọn.</div>
  </div>
  <!-- Lặp thêm card 2, 3, 4... tối đa 8 card -->
</div>
```
> ⚠️ **Giới hạn nội dung per card:** Tên mục ≤ 5 từ. Mô tả ≤ 80 ký tự. Nếu mô tả dài hơn → cắt ngắn lấy ý chính. Tuyệt đối không để chữ tràn ra ngoài card.

### Pyramid SVG
```html
<div style="flex:1;display:flex;align-items:center;justify-content:center;">
  <svg width="800" height="700" viewBox="0 0 800 700">
    <!-- Tầng 1 (đỉnh — quan trọng nhất) -->
    <polygon points="400,40 520,200 280,200" fill="{{ACCENT_COLOR}}" opacity="0.95"/>
    <text x="400" y="145" text-anchor="middle" fill="#000" font-size="22" font-weight="900">Tầm nhìn</text>
    <!-- Tầng 2 -->
    <polygon points="280,210 520,210 580,360 220,360" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="400" y="295" text-anchor="middle" fill="white" font-size="24" font-weight="800">Chiến lược</text>
    <!-- Tầng 3 -->
    <polygon points="220,370 580,370 660,530 140,530" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="400" y="460" text-anchor="middle" fill="white" font-size="26" font-weight="700">Thực thi</text>
    <!-- Tầng 4 (đáy) -->
    <polygon points="140,540 660,540 760,700 40,700" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
    <text x="400" y="630" text-anchor="middle" fill="rgba(255,255,255,0.70)" font-size="26" font-weight="700">Nền tảng</text>
  </svg>
</div>
```

---

## 📋 TEMPLATE HTML CƠ SỞ

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <link href="https://fonts.googleapis.com/css2?family={{FONT_PRIMARY}}:wght@400;700;900&family={{FONT_SECONDARY}}:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent:    {{ACCENT_COLOR}};
      --font-main: '{{FONT_PRIMARY}}', sans-serif;
      --font-em:   '{{FONT_SECONDARY}}', serif;
      --bg:        #0b0c10;
      --surface:   rgba(255,255,255,0.05);
      --border:    rgba(255,255,255,0.10);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1080px; height: 1350px; overflow: hidden;
      font-family: var(--font-main); color: #fff;
      background: linear-gradient(150deg, #0b0c10 0%, #111820 60%, #0b0c10 100%);
      position: relative;
    }
    em, i, .em { font-family: var(--font-em); font-style: italic; color: var(--accent); font-weight: inherit; }
    header {
      display: flex; align-items: center;
      padding: 28px 56px; border-bottom: 1px solid var(--border);
      position: relative; z-index: 10; flex-shrink: 0;
    }
    .avatar { width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent); margin-right: 16px; }
    .founder { font-size: 26px; font-weight: 800; }
    .handle  { font-size: 18px; color: var(--accent); font-weight: 600; margin-top: 4px; }
    .page { position: relative; z-index: 2; display: flex; flex-direction: column; height: 1350px; }
    .content { flex: 1; min-height: 0; padding: 40px 56px 48px; display: flex; flex-direction: column; gap: 24px; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <img class="avatar" src="{{AVATAR_SRC}}" alt="">
      <div>
        <div class="founder">{{FOUNDER_NAME}}</div>
        <div class="handle">{{BRAND_HANDLE}}</div>
      </div>
    </header>
    <div class="content">
      <!-- AI viết layout đã khai báo vào đây -->
    </div>
  </div>
</body>
</html>
```

---

## ✅ CHECKLIST TRƯỚC KHI GHI FILE

- [ ] **LAYOUT_CHOICE đã khai báo** trong chat (KHÔNG phải trong file HTML)?
- [ ] Đã chạy qua **8 câu hỏi cây quyết định** theo thứ tự — không nhảy thẳng xuống grid?
- [ ] Danh sách 7+ mục → dùng **2-column card grid** (KHÔNG dùng Timeline 1 cột)?
- [ ] HTML hoàn chỉnh từ `<!DOCTYPE>` đến `</html>`?
- [ ] `width: 1080px; height: 1350px; overflow: hidden` trên `body`?
- [ ] Có đủ 6 placeholder tĩnh — đặc biệt `{{FONT_SECONDARY}}` trong CSS `em/i`?
- [ ] **Không có `text-transform: uppercase`** ở bất kỳ class/element nào?
- [ ] Nội dung có con người → có `{{BG_IMAGE:keyword}}` + gradient overlay?
- [ ] Branding chỉ 1 lần ở header?
- [ ] **Sentence case** — không có KHÁCH HÀNG, chỉ Khách hàng?
- [ ] Background không trắng?
- [ ] Không dùng `backdrop-filter`?
- [ ] SVG/icon: tối đa 1 per ý?
- [ ] Nội dung ≤ 7 điểm?
- [ ] Quotes nguyên văn gốc?
