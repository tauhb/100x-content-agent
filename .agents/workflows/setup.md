---
description: Lệnh Khởi tạo Kiến trúc Nền tảng (Onboarding) dành cho Quản trị viên. Đưa người dùng qua 4 bước cấu hình bằng giao diện hỏi đáp tương tác.
---

# Lệnh: /setup

**Mục tiêu:** Kích hoạt "Người Dẫn Đường" (Onboarding Wizard) để chuyển giao hệ thống 100X Content Agent cho một nhân sự mới hoặc tổ chức mới. 
**QUY TẮC LÕI:** AI tuyệt đối KHÔNG ĐƯỢC nhồi nhét quá nhiều thông tin cùng 1 lúc. AI phải hỏi TỪNG BƯỚC MỘT, người dùng trả lời xong mới được đi tiếp sang bước sau.

## 🧭 LỘ TRÌNH TƯƠNG TÁC (Chỉ chuyển bước khi đã hoàn thành bước trước)

### Lời Chào Mở Đầu:
AI tự động chào mừng người dùng đến với Cỗ Máy 100X Content Agent và thông báo quy trình cài đặt sẽ diễn ra trong 4 bước đơn giản. Mời người dùng bắt đầu Bước 1.

---

### Bước 1: Khai phá Lõi (SOUL & Strategy)
**Nhiệm vụ của AI:** 
- Hỏi người dùng 3 câu hỏi cơ bản: Tên thương hiệu/Nhân vật, Lợi thế khác biệt (USP), và Phong cách nói chuyện (Tone of Voice).
- *(Chờ người dùng trả lời)*.
- Sau khi nhận thông tin, AI tự động phân tích và lập bảng định dạng **Brand DNA**. Đồng thời, AI tự vạch ra **Ma trận Chiến lược 5x5** (5 Trụ cột x 5 Góc độ) phù hợp nhất với thương hiệu đó.
- Trình bày cho người dùng xem và yêu cầu Xác nhận.
- Nếu Xác nhận: AI **ghi đè dữ liệu** vào `database/brand_config.json` và `database/strategy.json`. Sau đó chuyển sang Bước 2.

---

### Bước 2: Cắm Chìa Khóa Năng Lượng (API Config)
**Nhiệm vụ của AI:**
- Giải thích rành mạch: Vì Cỗ máy đã có *Antigravity* làm Bộ não Trung tâm lo toàn bộ việc Viết Lách và Tư Duy, người dùng KHÔNG CẦN tốn tiền mua ChatGPT hay Gemini API.
- Cỗ máy chỉ cần 2 giác quan bổ trợ:
  1. **Giọng nói (ElevenLabs)**: Để tạo Voiceover cho Video. (Đăng ký tại elevenlabs.io)
  2. **Tài nguyên Video Nền (Pexels)**: Để tự động kéo B-Rolls chất lượng cao. (Đăng ký tại pexels.com)
- **Hành động của AI:** AI thực hiện kiểm tra file `.env` tại thư mục gốc. Nếu chưa có, AI PHẢI TỰ ĐỘNG TẠO MỚI (Dùng `write_to_file`). Nếu đã có, AI thực hiện cập nhật khóa (Dùng `replace_file_content`).
- Mẫu nội dung file `.env`:
  ```env
  ELEVENLABS_API_KEY="Điền_Key_Của_Bạn_Vào_Đây"
  PEXELS_API_KEY="Điền_Key_Của_Bạn_Vào_Đây"
  ```
- *(Chờ người dùng báo "Đã điền xong")*. Chuyển sang Bước 3.

---

### Bước 3: Tài Nguyên Nhận Diện Media (Avatar & B-Rolls)
**Nhiệm vụ của AI:**
- Hướng dẫn người dùng chuẩn bị **Tài nguyên Nhận diện (Tuỳ chọn - KHÔNG BẮT BUỘC):**
  1. Hình ảnh Đại diện: Đặt một file tên là `avatar.png` vào thư mục `media-input/` (hỗ trợ đóng dấu Watermark cho khung hình nếu có).
  2. Video Nền: Chuẩn bị một số Video Mờ / Phong cảnh thả vào thư mục `media-input/background-video/` nếu Quản trị viên muốn làm Reels mang thương hiệu cá nhân thay vì tự động kéo từ Pexels.
- *(Chờ người dùng gõ "Tiếp tục" hoặc "Bỏ qua")*. Chuyển sang Bước 4.

---

### Bước 4: Mạng Phân Phối & Trạm Điều Khiển (Facebook & Bảng Lệnh)
**Nhiệm vụ của AI:**
- Hỏi người dùng muốn hệ thống tự động đăng bài lên Đâu? (Trang Cá Nhân hay Fanpage? Nhập kèm URL mở rộng).
- AI ghi nhận và tạo một bản ghi mới rớt vào `database/my_accounts.json` (VD: ID `profile_test`).
- **LƯU Ý:** Trấn an người dùng là HỆ THỐNG CHƯA YÊU CẦU ĐĂNG NHẬP NGAY để giữ tính bảo mật. AI giải thích rành mạch: *"Chỉ khi nào ngài thực thi lệnh `/publish` để phát hành bài đầu tiên, hệ thống mới mở trình duyệt giả lập lên để ngài đăng nhập tài khoản một lần duy nhất. Sau đó Session sẽ được ghi nhớ."*
- Cung cấp **Bảng Lệnh Điều Khiển (System Board)**:
  | Lệnh Vận Hành | Chức Năng (Skill / Workflow) |
  | :--- | :--- |
  | `/research_ideas` | Lùng sục và phân tích Website/Mạng xã hội để nhào nặn Ý tưởng (Idea Bank) |
  | `/vietbai` | Giao nhiệm vụ cho Bộ não (Brain) viết Master Content |
  | `/tao_anh` | Kích hoạt Đặc nhiệm Thiết kế Ảnh Quote Cảm hứng |
  | `/tao_video` | Kích hoạt Đặc nhiệm Đạo diễn Video Reels (Voiceover ElevenLabs) |
  | `/xem_output` | Duyệt kho Media thành phẩm 100% trước giờ G |
  | `/publish` | Lên nòng, Đăng bài tự động lên Facebook / MXH |
  | `/auto_mode` | Chuyên cơ chế độ Rảnh tay: Chạy đồng loạt mọi Ticket ý tưởng một nút h bấm |

- Kêu gọi người dùng tham khảo tài liệu [GUIDE.md](file:///Users/hoangbatau/Desktop/Vibe%20Coding/100X%20Content%20Agent/GUIDE.md) nằm ở thư mục gốc nếu muốn vọc sâu hơn các bí thuật Cỗ Máy.
- **Giải thích thư mục Đầu ra:** Nhắc nhở người dùng rằng mọi Thành phẩm Media cuối cùng (Hình ảnh, Video Reels, Carousel) sau khi tạo xong đều sẽ tự động lưu vào thư mục `media_output/` theo từng phân loại cụ thể để họ dễ dàng kiểm tra.
- Bắn Pháo hoa 🎉. Khép lại tiến trình `/setup` và mời người dùng gạt cần sang số bằng cách gõ `/vietbai` để khai trương!
// turbo-all
