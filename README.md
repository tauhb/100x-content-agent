# 🚀 100X Content Agent

**Cỗ Máy Sản Xuất Nội Dung AI Tự Động — Từ Ý Tưởng Đến Đăng Bài, Zero-Touch**

Biến một chủ đề thành Video Reels, Carousel, Ảnh Quote, Infographic rồi tự động đăng lên Facebook — chỉ bằng một dòng lệnh chat.

---

## Tính Năng Cốt Lõi

- **Video Reels** — Remotion engine render video 60-90 giây với B-Roll, voiceover AI (ElevenLabs), kinetic typography, biểu đồ động
- **Carousel / Ảnh / Infographic** — Puppeteer render HTML thành ảnh chất lượng cao
- **Viết bài tự động** — Gemini AI viết Master Content 800-2000 từ theo Brand DNA
- **Tự động đăng bài** — Playwright mô phỏng thao tác người dùng, đăng lên Facebook không cần API
- **White-label** — Toàn bộ màu sắc, font, giọng thương hiệu cấu hình trong 1 file `brand_config.json`
- **Cross-platform** — Chạy trên Windows 64-bit, macOS, Linux (không cần Docker)

---

## Yêu Cầu Hệ Thống

| Phần mềm | Phiên bản |
| :--- | :--- |
| Node.js | v18+ (khuyến nghị v20 LTS) |
| Claude Code CLI | Mới nhất |
| OS | Windows 10/11 **64-bit**, macOS 12+, Ubuntu 20.04+ |

> ❌ **Windows 32-bit không được hỗ trợ** — Chromium, Remotion, Node.js 18+ đều yêu cầu 64-bit.

---

## Cài Đặt Nhanh

```bash
# 1. Clone dự án
git clone <repository-url> "100X Content Agent"
cd "100X Content Agent"

# 2. Cài dependencies (tự động tạo .env từ mẫu)
npm install

# 3. Cài Chromium cho tự động đăng bài
npx playwright install chromium

# 4. Điền API Keys vào file .env
# Mở .env và điền: GEMINI_API_KEY, PEXELS_API_KEY, ELEVENLABS_API_KEY

# 5. Mở Claude Code và chạy setup
claude
# Gõ: /setup
```

---

## API Keys Cần Thiết

| Key | Mục đích | Lấy ở đâu | Bắt buộc? |
| :--- | :--- | :--- | :--- |
| `GEMINI_API_KEY` | Viết nội dung tự động | [aistudio.google.com](https://aistudio.google.com) | Khuyến nghị |
| `PEXELS_API_KEY` | Kho video B-Roll miễn phí | [pexels.com/api](https://www.pexels.com/api/) | Khuyến nghị |
| `ELEVENLABS_API_KEY` | Giọng đọc AI cho video | [elevenlabs.io](https://elevenlabs.io) | Tùy chọn |

---

## Bảng Lệnh

| Lệnh | Chức năng |
| :--- | :--- |
| `/setup` | Thiết lập lần đầu — Brand DNA, API Keys, cấu hình Facebook |
| `/vietbai` | Viết Master Content từ ý tưởng |
| `/research_ideas` | Tự động nghiên cứu ý tưởng viral |
| `/tao_video` | Tạo video Reels 60-90 giây (B-Roll + voiceover AI) |
| `/tao_anh` | Tạo ảnh quote/inspiration |
| `/tao_carousel` | Tạo carousel 10 slide |
| `/tao_infographic` | Tạo infographic |
| `/publish` | Tự động đăng bài lên Facebook |
| `/auto_mode` | Chế độ rảnh tay — chạy toàn bộ pipeline tự động |

---

## Cấu Trúc Thư Mục

```
100X Content Agent/
├── .env                    ← API Keys (KHÔNG commit file này)
├── database/
│   ├── brand_config.json   ← Cấu hình thương hiệu (màu, font, tên)
│   └── ideation_pipeline.json
├── media-input/            ← Đặt media cá nhân vào đây
│   ├── avatar.png
│   ├── background-video/   ← Clip B-Roll (.mp4)
│   └── background-music/   ← Nhạc nền (.mp3)
├── media_output/           ← Thành phẩm tự động xuất ra đây
└── scripts/                ← Các engine xử lý
```

---

## Hướng Dẫn Chi Tiết

Xem **[GUIDE.md](GUIDE.md)** để biết quy trình cài đặt từng bước, cách lấy API keys, xử lý lỗi thường gặp, và các mẹo vận hành nâng cao.

---

**Bản quyền © 100X Academy. Dùng cho mục đích cá nhân và thương mại theo gói thuê bao.**
