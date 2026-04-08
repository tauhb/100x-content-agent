# 🚀 100X Content Agent (White-Label V2)

**Hệ thống Tự Động Hóa Nội Dung Đa Kênh (Omnichannel Content Factory)**

Chào mừng bạn đến với kỷ nguyên sản xuất media "Zero-Touch". 100X Content Agent là một cỗ máy AI toàn diện, giúp bạn biến một ý tưởng sơ khai thành các định dạng media chuyên nghiệp (Reels, Carousel, Image, Infographic) và tự động đăng tải lên các nền tảng mạng xã hội.

---

## 🌟 Tính Năng Cốt Lõi

-   **Multi-Engine Rendering**:
    -   🎬 **Reels Engine (Remotion)**: Tạo video ngắn với B-Roll, Voice-over AI và Subtitle Karaoke.
    -   📸 **Image/Carousel Engine (Puppeteer)**: Thiết kế đồ họa Dynamic HTML với độ thẩm mỹ Premium.
    -   📊 **Infographic Engine**: Tự động hóa thiết kế số liệu và kiến thức dạng dài.
-   **Cross-Platform Native**: Chạy mượt mà trên **Windows, macOS, và Linux** mà không cần Docker.
-   **Cloud Sync**: Đồng bộ hóa 2 chiều với Google Sheets để quản lý và kiểm duyệt từ xa.
-   **Auto-Publish**: Tự động đăng bài qua Playwright (Vượt rào cản API).

---

## 🛠 Yêu Cầu Hệ Thống

1.  **Node.js**: Phiên bản 18 trở lên.
2.  **FFMPEG**: (Đã được tích hợp sẵn qua `ffmpeg-static`, không cần cài đặt thủ công).
3.  **Browser**: Chromium (Tự động tải về qua Puppeteer/Playwright).

---

## 📥 Hướng Dẫn Cài Đặt (Đa Nền Tảng)

Mở Terminal (hoặc CMD/PowerShell trên Windows) và chạy các lệnh sau:

### 1. Clone Repository
```bash
git clone https://github.com/your-repo/100x-content-agent.git
cd 100x-content-agent
```

### 2. Cài Đặt & Cấu Hình Tự Động
Lệnh này sẽ tự động cài đặt dependencies cho tất cả các engine và tạo file `.env` mẫu.
```bash
npm install
```

### 3. Cấu Hình API
Mở file `.env` và điền các Key cần thiết:
-   `ANTHROPIC_API_KEY`: Dành cho bộ não sáng tạo nội dung.
-   `PEXELS_API_KEY`: Dành cho kho video B-Roll.
-   `ELEVENLABS_API_KEY`: Dành cho giọng nói AI.
-   `GOOGLE_SHEET_APP_URL`: Dành cho Dashboard điều khiển.

---

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Nghiên Cứu Ý Tưởng
```bash
/research_ideas
```
AI sẽ tự động cào dữ liệu Viral và đề xuất ma trận nội dung 5x5.

### Bước 2: Viết Bài (Master Content)
```bash
/vietbai --topic "Mindset kinh doanh"
```

### Bước 3: Sản Xuất Media (Chọn 1 trong các lệnh)
-   **Tạo Video Reels**: `/tao_video_broll` (Dùng Remotion Engine).
-   **Tạo Carousel**: `/tao_carousel` (Dùng HTML Engine).
-   **Tạo Ảnh Đơn**: `/tao_anh` (Dùng Image Engine).

### Bước 4: Đăng Bài
```bash
/publish
```

---

## 📖 Tài Liệu Hướng Dẫn Chi Tiết

Để biết cách thiết lập Google Sheets CMS và chi tiết cách vận hành từng bước, vui lòng xem:
👉 **[HƯỚNG DẪN VẬN HÀNH & THIẾT LẬP (GUIDE.md)](docs/GUIDE.md)**

---

## 📂 Cấu Trúc Thư Mục

-   `/database`: Chứa "Lake" dữ liệu và Pipeline sản xuất.
-   `/media-input`: Nơi bạn nạp Avatar, Logo, Nhạc nền và Video cá nhân.
-   `/media_output`: Thành phẩm sẽ được xuất xưởng tại đây theo ngày/kênh.
-   `/scripts`: Các cỗ máy Engine lõi.
-   `/skills`: Định nghĩa năng lực của AI Agent.

---

## ⚖️ License

Bản quyền thuộc về **100X Academy**. Sử dụng cho mục đích cá nhân và thương mại theo gói thuê bao.

---

**Cỗ máy này được thiết kế để bạn rảnh tay. Chúc bạn bùng nổ nội dung! 🚀**
