# 📖 HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH: 100X CONTENT AGENT

> Hệ thống sản xuất nội dung AI tự động hóa hoàn toàn — từ Ý tưởng đến Video/Ảnh/Slide đăng Facebook.

---

## MỤC LỤC

1. [Yêu Cầu Hệ Thống](#1-yêu-cầu-hệ-thống)
2. [Cài Đặt Môi Trường](#2-cài-đặt-môi-trường)
3. [Cấu Hình API Keys](#3-cấu-hình-api-keys)
4. [Cấu Hình Brand DNA](#4-cấu-hình-brand-dna)
5. [Chuẩn Bị Media Đầu Vào](#5-chuẩn-bị-media-đầu-vào)
6. [Chạy Thử Lần Đầu](#6-chạy-thử-lần-đầu)
7. [Bảng Lệnh Đầy Đủ](#7-bảng-lệnh-đầy-đủ)
8. [Quy Trình Tạo Video (tao_video)](#8-quy-trình-tạo-video-tao_video)
9. [Xử Lý Lỗi Thường Gặp](#9-xử-lý-lỗi-thường-gặp)
10. [Tương Thích Đa Nền Tảng](#10-tương-thích-đa-nền-tảng)

---

## 1. Yêu Cầu Hệ Thống

### Phần Mềm Bắt Buộc

| Phần mềm | Phiên bản tối thiểu | Tải về |
| :--- | :--- | :--- |
| **Node.js** | v18.0+ (khuyến nghị v20 LTS) | [nodejs.org](https://nodejs.org) |
| **npm** | v9.0+ (đi kèm Node.js) | — |
| **Git** | Bất kỳ | [git-scm.com](https://git-scm.com) |
| **Claude Code CLI** | Mới nhất | `npm install -g @anthropic/claude-code` |

> **Kiểm tra phiên bản hiện tại:**
> ```bash
> node --version   # phải >= v18.0.0
> npm --version    # phải >= v9.0.0
> ```

### Phần Cứng Khuyến Nghị

| Thành phần | Tối thiểu | Tốt nhất |
| :--- | :--- | :--- |
| RAM | 8 GB | 16 GB+ |
| CPU | 4 nhân | 8 nhân+ |
| Ổ cứng trống | 5 GB | 20 GB+ |
| Kết nối Internet | 10 Mbps | 50 Mbps+ |

### Hệ Điều Hành Được Hỗ Trợ

- ✅ **macOS** 12+ (Monterey trở lên)
- ✅ **Windows** 10/11 **(64-bit bắt buộc)**
- ✅ **Ubuntu/Debian** 20.04+
- ❌ **Windows 32-bit** — KHÔNG hỗ trợ (Node.js 18+, Playwright, Chromium, Remotion đều yêu cầu 64-bit)

> **Kiểm tra máy của bạn:** Vào *Settings → System → About → System type*. Nếu thấy "64-bit operating system" thì dùng được. Nếu thấy "32-bit" thì cần giải pháp thay thế (xem [Tương Thích Đa Nền Tảng](#10-tương-thích-đa-nền-tảng)).

---

## 2. Cài Đặt Môi Trường

### Bước 2.1 — Clone dự án về máy

```bash
git clone <repository-url> "100X Content Agent"
cd "100X Content Agent"
```

### Bước 2.2 — Cài đặt dependencies gốc

```bash
npm install
```

> Lệnh này tự động:
> - Cài tất cả thư viện Node.js (Playwright, Puppeteer, Axios, v.v.)
> - Tạo file `.env` từ `.env.example` nếu chưa có
> - Chạy `npm install` trong thư mục `scripts/reels_engine/` (Remotion)

### Bước 2.3 — Cài đặt Remotion Engine riêng biệt (nếu bước trên bỏ sót)

```bash
cd scripts/reels_engine
npm install
cd ../..
```

### Bước 2.4 — Cài Playwright Browsers

```bash
npx playwright install chromium
```

> Playwright cần tải Chromium (~150 MB) để chạy tự động hóa đăng bài.

---

## 3. Cấu Hình API Keys

### Bước 3.1 — Mở file `.env`

File `.env` đã được tạo tự động ở thư mục gốc. Mở bằng bất kỳ text editor nào:

- **Windows:** Notepad, VS Code, Notepad++
- **macOS/Linux:** `nano .env` hoặc `code .env`

### Bước 3.2 — Điền các API Key

```env
# 1. Khóa AI Viết Kịch Bản (Google Gemini)
GEMINI_API_KEY="your_gemini_api_key_here"

# 2. Khóa Kéo Video B-Roll từ Internet (Pexels)
PEXELS_API_KEY="your_pexels_api_key_here"

# 3. Khóa Giọng Đọc AI (ElevenLabs)
ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"

# 3.1 ID Giọng Đọc ưa thích (tùy chọn, để trống = giọng mặc định)
ELEVENLABS_VOICE_ID=""
```

### Hướng Dẫn Lấy API Key

#### 🔑 Gemini API Key (MIỄN PHÍ)
1. Truy cập [aistudio.google.com](https://aistudio.google.com)
2. Đăng nhập bằng Google Account
3. Click **Get API Key** → **Create API key**
4. Copy key và dán vào `GEMINI_API_KEY`

#### 🎥 Pexels API Key (MIỄN PHÍ)
1. Đăng ký tài khoản tại [pexels.com/api](https://www.pexels.com/api/)
2. Vào **Your API Key** trong tài khoản
3. Copy key và dán vào `PEXELS_API_KEY`

#### 🎙️ ElevenLabs API Key (Có gói Free)
1. Đăng ký tại [elevenlabs.io](https://elevenlabs.io)
2. Vào **Profile → API Keys**
3. Click **Generate API Key**
4. Copy key và dán vào `ELEVENLABS_API_KEY`
5. (Tùy chọn) Vào **Voice Library**, chọn giọng muốn dùng, copy **Voice ID** dán vào `ELEVENLABS_VOICE_ID`

> ⚠️ **Lưu ý:** Nếu không có ElevenLabs key, video vẫn tạo được nhưng **không có giọng đọc AI**. Hệ thống tự động bỏ qua bước lồng tiếng.

---

## 4. Cấu Hình Brand DNA

File: `database/my_accounts.json` — Brand DNA nằm trong từng account, cho phép quản lý nhiều brand song song.

```json
{
  "accounts": [
    {
      "id": "ten_brand",
      "active": true,
      "founder": "Tên Của Bạn",
      "brand_identity": {
        "handle": "@ten_trang_cua_ban",
        "colors": {
          "accent": "#B6FF00"
        },
        "fonts": {
          "primary": "Inter",
          "accent": "Playfair Display"
        },
        "visual_vibe": "Mô tả phong cách hình ảnh của bạn (dark mode, cinematic, v.v.)",
        "watermark": {
          "enabled": false,
          "text": "TÊN THƯƠNG HIỆU",
          "bottom_margin": "80px",
          "opacity": 0.6
        }
      },
      "channels": []
    }
  ]
}
```

### Các trường quan trọng

| Trường | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `founder` | Tên tác giả / người dùng | `"Nguyễn Văn A"` |
| `handle` | Username mạng xã hội | `"@rainmaker_vn"` |
| `colors.accent` | Màu nhấn mạnh thương hiệu (hex) | `"#B6FF00"` (neon xanh) |
| `fonts.primary` | Font chữ chính | `"Inter"` |
| `fonts.accent` | Font chữ tiêu đề | `"Playfair Display"` |
| `visual_vibe` | Mô tả phong cách hình ảnh cho AI | `"Dark mode, high contrast..."` |
| `watermark.enabled` | Bật/tắt logo watermark | `true` hoặc `false` |

---

## 5. Chuẩn Bị Media Đầu Vào

Toàn bộ media cá nhân đặt trong thư mục `media-input/`:

```
media-input/
├── avatar.png (hoặc avatar.jpg)       ← Ảnh avatar/headshot của bạn
├── background-video/                  ← Video B-Roll cá nhân
│   ├── clip_office_1.mp4
│   ├── clip_talking_2.mp4
│   └── ...
├── background-music/                  ← Nhạc nền
│   ├── lofi_beat_1.mp3
│   ├── ambient_2.mp3
│   └── ...
├── image_stock/                       ← Ảnh minh họa tổng quát
├── celebrity_image/                   ← Ảnh người nổi tiếng (nếu cần)
└── personal_image/                    ← Ảnh cá nhân bổ sung
```

### Lưu ý quan trọng

- **Video B-Roll:** Định dạng `.mp4` được ưu tiên. Độ phân giải khuyến nghị: 1080x1920 (dọc) hoặc 1920x1080 (ngang).
- **Nhạc nền:** `.mp3` hoặc `.wav`. Đặt tên file chứa từ khóa thể loại (vd: `lofi_chill.mp3`, `epic_background.mp3`) để hệ thống tự chọn đúng vibe.
- **Avatar:** Chỉ cần 1 file `avatar.png` hoặc `avatar.jpg` ở thư mục gốc `media-input/`.

---

## 6. Chạy Thử Lần Đầu

### Test 1 — Kiểm tra hệ thống hoạt động

Mở terminal trong thư mục dự án và gõ:

```bash
node -e "console.log('Node OK:', process.version)"
```

Kết quả mong đợi: `Node OK: v20.x.x`

### Test 2 — Kiểm tra biến môi trường

```bash
node -e "require('dotenv').config(); console.log('Gemini Key:', process.env.GEMINI_API_KEY ? 'OK ✅' : 'THIẾU ❌')"
```

### Test 3 — Tạo video thử nghiệm (không cần API key)

Mở Claude Code CLI và gõ:

```
tạo video cho tôi với chủ đề: 5 bí quyết thành công
```

Hệ thống sẽ:
1. Dùng AI phân tích chủ đề
2. Tạo kịch bản phân cảnh tự động
3. Bốc nhạc nền từ `media-input/background-music/`
4. Render video và lưu vào `media_output/YYYY-MM-DD/`

---

## 7. Bảng Lệnh Đầy Đủ

Tất cả lệnh được gõ trực tiếp vào Claude Code CLI (chat):

| Lệnh | Chức năng | Yêu cầu API |
| :--- | :--- | :--- |
| `tạo video [chủ đề]` | Tạo video Reels 45-90 giây | Pexels (tùy chọn), ElevenLabs (tùy chọn) |
| `tạo ảnh [chủ đề]` | Tạo ảnh quote/inspiration | Pexels (tùy chọn) |
| `tạo slide [chủ đề]` | Tạo carousel 10 slide | Pexels (tùy chọn) |
| `tạo infographic [chủ đề]` | Tạo infographic | Pexels (tùy chọn) |
| `viết bài [chủ đề]` | Viết Master Content | Gemini |
| `nghiên cứu ý tưởng` | Tìm ý tưởng nội dung | Gemini |
| `đăng bài` | Tự động đăng lên Facebook | Playwright (browser) |

---

## 8. Quy Trình Tạo Video (tao_video)

Khi bạn gõ `tạo video với chủ đề: [X]`, hệ thống thực hiện:

```
1. AI phân tích chủ đề
       ↓
2. Video Director Specialist
   tạo kịch bản phân cảnh JSON
   (BROLL_HOOK, ARCH_SPLIT, KINETIC_COUNT, v.v.)
       ↓
3. Asset Pipeline
   - Bốc video B-Roll local / Pexels
   - Bốc nhạc nền local
   - Tổng hợp giọng đọc (ElevenLabs, nếu có key)
       ↓
4. Remotion Renderer
   - Micro-server port 9876 serve media qua HTTP
   - Render từng frame thành video .mp4
       ↓
5. Lưu kết quả
   media_output/YYYY-MM-DD/content/TICKET_ID/reels/media.mp4
```

### Cấu Trúc Archetype Layout (cho người dùng nâng cao)

Khi muốn tùy chỉnh kịch bản video, bạn có thể chỉnh file `media_payload.json`:

| Archetype | Mô tả |
| :--- | :--- |
| `BROLL_HOOK` | Video nền + tiêu đề lớn fade-in |
| `BROLL_QUOTE` | Video nền + trích dẫn nghiêng |
| `BROLL_STAT` | Video nền + số liệu khổng lồ |
| `BROLL_BULLET` | Video nền + danh sách bullet |
| `KINETIC_WORD` | Từ bùng nổ động trên nền đen |
| `KINETIC_REVEAL` | Chữ trượt từ trái, từng dòng |
| `KINETIC_COUNT` | Đếm số lên với vòng ring |
| `ARCH_SPLIT` | Chia đôi màn hình (Sai vs Đúng) |
| `ARCH_DATA` | Biểu đồ bar/comparison |
| `ARCH_DIAGRAM` | Sơ đồ loop/flow/pyramid |
| `ARCH_TERMINAL` | Giao diện terminal typing |
| `DATA_PROGRESS` | Vòng ring đồng tâm (%) |

---

## 9. Xử Lý Lỗi Thường Gặp

### ❌ "Cannot find module" khi chạy

```bash
# Giải pháp: Cài lại dependencies
npm install
cd scripts/reels_engine && npm install && cd ../..
```

### ❌ Video render xong nhưng chỉ có nền đen

Nguyên nhân: Thiếu video B-Roll trong `media-input/background-video/`

```bash
# Giải pháp 1: Thêm ít nhất 1 file .mp4 vào thư mục
# Giải pháp 2: Cấu hình Pexels API key để tự động kéo video
```

### ❌ "Port 9876 already in use"

```bash
# macOS/Linux
lsof -ti:9876 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 9876).OwningProcess | Stop-Process
```

### ❌ Không có giọng đọc trong video

Nguyên nhân: Thiếu `ELEVENLABS_API_KEY` trong `.env`

> Video vẫn render bình thường — chỉ không có voiceover. Thêm key ElevenLabs để bật tính năng này.

### ❌ Playwright không mở được browser (lỗi đăng bài)

```bash
# Cài lại Chromium
npx playwright install chromium --with-deps
```

### ❌ Lỗi "ENOENT: no such file or directory" khi render

Nguyên nhân: Thư mục output chưa tồn tại

```bash
# Tạo thủ công
mkdir -p media_output
mkdir -p media-input/background-video
mkdir -p media-input/background-music
```

### ❌ Render chậm / hết RAM (Windows)

Nguyên nhân: Remotion dùng quá nhiều RAM

> Hệ thống đã tự động đặt `--concurrency=1` trên Windows. Nếu vẫn chậm, tăng RAM ảo (Virtual Memory) lên 8 GB trong System Properties.

---

## 10. Tương Thích Đa Nền Tảng

### Trạng Thái Hỗ Trợ

| Tính năng | macOS | Windows | Linux |
| :--- | :--- | :--- | :--- |
| Tạo video (Reels) | ✅ | ✅ | ✅ |
| Tạo ảnh/slide | ✅ | ✅ | ✅ |
| Giọng đọc AI | ✅ | ✅ | ✅ |
| Đăng bài tự động | ✅ | ✅ | ✅ |
| Hardware acceleration | Metal (GPU) | DirectX | CPU only |

### Lưu Ý Đặc Biệt Theo OS

#### Windows (64-bit)
- Render video tự động dùng chế độ `--concurrency=1` (ổn định, chậm hơn ~30%)
- Dùng **PowerShell** hoặc **Windows Terminal** — không dùng CMD cũ
- Đường dẫn có ký tự `\` được xử lý tự động, không cần lo

#### Windows 32-bit — KHÔNG hỗ trợ
Node.js 18+, Playwright, Puppeteer, Remotion đều không có phiên bản 32-bit. **Giải pháp thay thế:**
- **VPS/Cloud:** Triển khai hệ thống trên máy chủ 64-bit, khách hàng truy cập qua giao diện web — không cần cài đặt gì trên máy
- **Nâng cấp OS:** Windows 10/11 64-bit miễn phí cho phần lớn máy có CPU 64-bit ra đời từ 2007 trở đi

#### macOS
- Nếu gặp lỗi permission với Playwright: `sudo npx playwright install-deps`
- Apple Silicon (M1/M2/M3): Hoàn toàn tương thích, render nhanh hơn Intel

#### Linux
- Cần cài thêm: `sudo apt-get install -y libgbm-dev libnss3 libatk-bridge2.0-0`
- Chạy trên máy chủ không có màn hình: Playwright tự động dùng headless mode

---

## Cấu Trúc Thư Mục Tham Khảo

```
100X Content Agent/
├── .env                    ← API Keys (KHÔNG chia sẻ file này)
├── .env.example            ← Template API Keys
├── GUIDE.md                ← File này
├── database/
│   ├── my_accounts.json    ← Tài khoản & cấu hình thương hiệu (brand_identity + channels)
│   └── ideation_pipeline.json ← Database ticket nội dung
├── media-input/            ← Đặt media cá nhân vào đây
│   ├── avatar.png
│   ├── background-video/
│   └── background-music/
├── media_output/           ← Thành phẩm tự động xuất ra đây
│   └── YYYY-MM-DD/
│       └── content/
│           └── TICKET_ID/
│               └── reels/media.mp4
├── scripts/                ← Engine xử lý (không cần chỉnh)
│   ├── reels_engine.js
│   ├── reels_engine/       ← Remotion React app
│   └── utils/
├── skills/                 ← Kịch bản hành vi AI
└── database/
```

---

> **Hỗ trợ:** Nếu gặp lỗi không có trong danh sách trên, hãy đọc file `render_debug.log` ở thư mục gốc và mô tả lỗi cho Claude Code xử lý.
