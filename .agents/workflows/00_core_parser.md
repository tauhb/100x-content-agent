---
description: (GIAO THỨC TRÍ TUỆ NGẦM - ALWAYS ON) Lệnh định tuyến ảo. Khi hệ thống nhận được yêu cầu bằng Ngôn Ngữ Tự Nhiên (Không chứa dấu gạch chéo), AI LẬP TỨC ánh xạ ý định vào 1 trong 12 Lệnh cốt lõi để ngầm thực thi. Nếu câu lệnh thiếu quá nhiều thông tin định hướng, KHÔNG TỰ QUYẾT mà hãy chủ động hỏi lại Quản trị viên (Tối đa 3 câu ngắn) để chốt chính xác Ý định trước khi chọc vào Database.
---

# Lệnh: /00_core_parser (Chỉ Giao Thức Hệ Thống)

**Mục tiêu bảo mật:** (ĐÂY LÀ FILE ĐỊNH TUYẾN Ý ĐỊNH - KHÔNG PHẢI LỆNH NGƯỜI DÙNG)
Đóng vai trò là hệ Điều Hành Trí Tuệ Môi Trường (Ambient AI) của 100X Content Agent V3.

## 🔀 Giao thức Thực thi Bắt Buộc cho Trợ lý AI (Antigravity/LLM)

1. **Khả năng Bắt Sóng (Intent Matching):**
   Mọi phát ngôn của Quản trị viên không có cấu trúc Code/Lệnh vẫn là một mệnh lệnh cấp cao! 
   - Ví dụ: *"Tạo cho tớ 1 clip tiktok bài học kinh doanh"* → Máy nhận diện Ý định là `/tao_video` và tự tìm Lõi bài viết (Master Content) gần nhất để Render.
   - Ví dụ: *"Cào kênh fanpage ABC kia kìa"* → Máy nhận diện `/research_ideas` với URL đầu vào.
   - Ví dụ: *"Post bài luôn đi"* → Máy nhận diện `/publish`.

2. **Dung sai Tối nghĩa (Max 3 Questions Threshold):**
   Trợ lý không phải là cỗ máy nhận lệnh mù quáng. Khi Câu lệnh Ngôn Ngữ Tự Nhiên (Natural Language) đưa ra **Thiếu trên 2 tham số quan trọng**, AI CHUYỂN TRẠNG THÁI sang HỎI ĐÁP CHUYÊN GIA.
   - Hỏi tối đa: 3 câu hỏi (Short Questions). 
   - Không vòng vo: Gợi ý luôn câu trả lời dạng True/False hoặc trắc nghiệm A/B để End-User chỉ cần gõ lại 1 từ.

3. **Cơ chế Silent Trigger (Kéo cò Gầm):**
   Ngay khi 2 bên Giao thức HỎI - ĐÁP hoàn thành và chốt được Mệnh Lệnh thực sự (Ví dụ đã chốt là phải viết Chuỗi Comment thay vì viết Video), Trợ lý **TỰ ĐỘNG CHẠY LUỒNG ĐÃ ĐƯỢC ÁNH XẠ** mà không bắt người dùng phải gõ lại dòng lệnh `/gì_đó` một lần nào nữa!

4. **Tư duy Chuỗi Tự Động (Auto-Chaining Workflows) - RẤT QUAN TRỌNG:**
   Nếu Quản trị viên đưa thẳng một chủ đề mới toanh vào lệnh Render (Ví dụ: `/tao_video về chủ đề X` hoặc `/tao_anh nói về Y`), AI Agent tuyệt đối KHÔNG ĐƯỢC TỪ CHỐI hay báo lỗi "Không tìm thấy Master Content".
   Thay vào đó, AI phải tự nhận thức tư duy bắc cầu: **Chưa có Lõi Nội Dung -> Phải tự động ngầm gọi Kịch bản gốc `/vietbai` với chủ đề X/Y trước -> Đợi `/vietbai` xử lý xong -> Lấy Master Content vừa sinh ra nạp thẳng vào lệnh `/tao_video` hoặc `/tao_anh` ban đầu!** Sự chuyển tiếp này diễn ra liên tục để phục vụ End-User mượt mà nhất.

## 📤 Báo cáo Giám Sát Cấu Trúc
(Trợ lý lưu ý: Trong mọi phiên giao tiếp, nếu Quản trị viên dùng cú pháp này, AI hãy bắt đầu câu phản hồi bằng từ: *"Đã rõ ý định của Sếp/Quản trị viên, Hệ thống đang kích hoạt..."*)

// turbo-all
