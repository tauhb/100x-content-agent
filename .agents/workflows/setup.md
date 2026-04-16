---
description: Lệnh Khởi tạo Kiến trúc Nền tảng (Onboarding) dành cho Quản trị viên. Đưa người dùng qua 5 bước cấu hình bằng giao diện hỏi đáp tương tác.
---

# Lệnh: /setup

**Mục tiêu:** Kích hoạt "Người Dẫn Đường" (Onboarding Wizard) để chuyển giao hệ thống 100X Content Agent cho một nhân sự mới hoặc tổ chức mới.

**QUY TẮC LÕI:** AI tuyệt đối KHÔNG ĐƯỢC nhồi nhét quá nhiều thông tin cùng 1 lúc. AI phải hỏi TỪNG BƯỚC MỘT, người dùng trả lời xong mới được đi tiếp sang bước sau.

---

## 🧭 LỘ TRÌNH TƯƠNG TÁC (Chỉ chuyển bước khi đã hoàn thành bước trước)

### Lời Chào Mở Đầu:
AI chào mừng người dùng đến với 100X Content Agent và thông báo quy trình cài đặt gồm **5 bước**. Giải thích ngắn gọn: đây là cỗ máy sản xuất nội dung AI tự động — từ ý tưởng đến Video/Ảnh/Slide đăng mạng xã hội, không cần biết code. Mời người dùng bắt đầu Bước 1.

---

### Bước 1: Cài Đặt Kỹ Thuật (Technical Foundation)

**Nhiệm vụ của AI:**
- Kiểm tra xem `node_modules/` đã tồn tại chưa bằng cách đọc thư mục gốc.
- Nếu CHƯA có: hướng dẫn người dùng chạy lệnh sau trong Terminal (macOS/Linux) hoặc PowerShell (Windows):
  ```bash
  npm install
  ```
  Giải thích: lệnh này tự động cài đặt toàn bộ thư viện cần thiết (Playwright, Remotion, ffmpeg, v.v.) và tạo file `.env` từ mẫu. Mất khoảng 2-3 phút.

- Sau khi `npm install` xong, hướng dẫn cài Chromium browser (dùng cho tự động đăng bài):
  ```bash
  npx playwright install chromium
  ```

- *(Chờ người dùng báo "Xong" hoặc "Done")*. Chuyển sang Bước 2.

---

### Bước 2: Khai phá Lõi Thương Hiệu (Brand DNA)

**Nhiệm vụ của AI:**
Hỏi người dùng 3 câu hỏi để khai thác Brand DNA:
1. **Tên thương hiệu / Nhân vật** — Bạn là ai? Tên trang, kênh, hoặc tên cá nhân?
2. **Điểm khác biệt (USP)** — Bạn chuyên về lĩnh vực gì? Khách hàng mục tiêu của bạn là ai?
3. **Giọng nói thương hiệu (Tone)** — Phong cách nói chuyện của bạn: nghiêm túc, vui tươi, cá tính, chuyên gia, hay truyền cảm hứng?

*(Chờ người dùng trả lời)*

Sau khi nhận thông tin:
- Phân tích và lập bảng **Brand DNA** tóm tắt.
- Vạch ra **Ma trận Nội dung 5×5** (5 Trụ cột × 5 Góc độ) phù hợp với thương hiệu.
- Trình bày cho người dùng xem và xin xác nhận.

Nếu được xác nhận: AI **ghi vào** `database/my_accounts.json` (trường `brand_identity` của account đang active) và `database/strategy.json`. Chuyển sang Bước 3.

---

### Bước 3: Cắm Chìa Khóa Năng Lượng (API Keys)

**Nhiệm vụ của AI:**
Giải thích rõ ràng cỗ máy cần **3 chìa khóa** để hoạt động đầy đủ:

| # | Chìa khóa | Mục đích | Đăng ký |
|---|---|---|---|
| 1 | **GEMINI_API_KEY** | AI viết nội dung (/vietbai, /research_ideas) | [aistudio.google.com](https://aistudio.google.com) (Miễn phí) |
| 2 | **PEXELS_API_KEY** | Kho video B-Roll miễn phí | [pexels.com/api](https://www.pexels.com/api/) (Free) |
| 3 | **ELEVENLABS_API_KEY** | Giọng đọc AI cho Video | [elevenlabs.io](https://elevenlabs.io) (có gói Free) |

> **Lưu ý:** Tất cả đều là tùy chọn — không có vẫn chạy được. Không có Gemini → `/vietbai` không hoạt động. Không có Pexels → chỉ dùng video local. Không có ElevenLabs → video không có giọng đọc AI.

**Hướng dẫn điền key:**
- Mở file `.env` ở thư mục gốc dự án bằng bất kỳ text editor nào.
- Tìm dòng tương ứng và thay thế phần `"dien_key..."` bằng key thật.
- Lưu file.

**Hành động của AI:** Kiểm tra file `.env` đã tồn tại chưa. Nếu chưa có, tự động tạo từ `.env.example`.

*(Chờ người dùng báo "Đã điền xong")*. Chuyển sang Bước 4.

---

### Bước 4: Tài Nguyên Nhận Diện Media (Avatar & B-Rolls)

**Nhiệm vụ của AI:**
Hướng dẫn chuẩn bị **Tài nguyên cá nhân** (không bắt buộc, nhưng giúp video trông authentic hơn):

```
media-input/
├── avatar.png          ← Ảnh headshot/avatar của bạn (1:1)
├── background-video/   ← Clip B-Roll cá nhân (.mp4, quay dọc 9:16 tốt nhất)
└── background-music/   ← Nhạc nền (.mp3 hoặc .wav)
```

Giải thích:
- Nếu không có video cá nhân → hệ thống tự động kéo B-Roll từ Pexels (cần Pexels API key).
- Nếu không có nhạc → video vẫn tạo được, chỉ không có nhạc nền.
- Đặt tên file nhạc có chứa từ khóa vibe để hệ thống tự chọn đúng (vd: `lofi_chill.mp3`, `epic_motivate.mp3`).

*(Chờ người dùng gõ "Tiếp tục" hoặc "Bỏ qua")*. Chuyển sang Bước 5.

---

### Bước 5: Mạng Phân Phối (Facebook & Bảng Lệnh)

**Nhiệm vụ của AI:**
Hỏi người dùng **2 câu** để thiết lập kênh phân phối:

**Câu 1:** Bạn muốn đăng bài lên đâu? (Trang Cá nhân / Fanpage / nhiều kênh?) — Nhập tên kênh và URL.

**Câu 2:** Khung giờ đăng bài mỗi ngày của bạn là gì? Gợi ý mặc định nếu chưa có:
- 8h30 → Carousel (năng lượng sáng)
- 11h30 → Ảnh/Image (giờ nghỉ trưa)
- 15h30 → Video B-Roll (chiều tập trung giảm)
- 19h30 → Infographic (tối thư giãn)

Người dùng có thể giữ mặc định hoặc tùy chỉnh số slot, giờ, và loại nội dung.

AI ghi nhận đầy đủ vào `database/my_accounts.json` theo schema:
```json
{
  "accounts": [
    {
      "id": "ten_brand",
      "active": true,
      "founder": "Tên Founder",
      "brand_identity": {
        "handle": "@ten_kenh",
        "colors": { "accent": "#B6FF00" },
        "fonts": { "primary": "Inter", "accent": "Playfair Display" },
        "visual_vibe": "Mô tả phong cách thị giác thương hiệu.",
        "watermark": { "enabled": false }
      },
      "channels": [
        {
          "name": "Facebook",
          "url": "https://facebook.com/...",
          "posting_schedule": [
            { "time": "8h30",  "content_type": "carousel",   "vibe": "motivational" },
            { "time": "11h30", "content_type": "image",       "vibe": "tips" },
            { "time": "15h30", "content_type": "video_broll", "vibe": "educational" },
            { "time": "19h30", "content_type": "infographic", "vibe": "storytelling" }
          ]
        }
      ]
    }
  ]
}
```

> **Lưu ý:** `content_type` hợp lệ: `carousel`, `image`, `video_broll`, `video`, `infographic`.

**Trấn an về bảo mật:** Hệ thống CHƯA đăng nhập Facebook ngay. Chỉ khi chạy lệnh `/publish` lần đầu, hệ thống mới mở browser để người dùng tự đăng nhập một lần. Sau đó session được lưu lại — lần sau tự động.

**Bảng Lệnh Điều Khiển:**

| Lệnh | Chức năng |
| :--- | :--- |
| `/vietbai` | Viết Master Content từ ý tưởng |
| `/research_ideas` | Tự động tìm ý tưởng viral từ đối thủ |
| `/tao_anh` | Tạo ảnh quote/inspiration |
| `/tao_video` | Tạo video Reels 60-90 giây (có B-Roll + giọng đọc AI) |
| `/tao_carousel` | Tạo carousel 10 slide |
| `/tao_infographic` | Tạo infographic |
| `/publish` | Tự động đăng bài lên Facebook |
| `/auto_mode` | Chế độ rảnh tay: tự chạy hết từ ý tưởng → đăng bài |

**Giải thích thư mục đầu ra:** Mọi thành phẩm (video, ảnh, slide) tự động lưu vào `media_output/YYYY-MM-DD/` theo ngày — không bao giờ bị lẫn lộn.

**Tài liệu chi tiết:** Đọc thêm `GUIDE.md` ở thư mục gốc nếu muốn hiểu sâu hơn.

---

🎉 **Kết thúc Setup!** Bắn pháo hoa và mời người dùng gõ `/vietbai` để khai trương cỗ máy!

// turbo-all
