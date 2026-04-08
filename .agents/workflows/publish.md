---
description: Lệnh tổng hợp Xếp Lịch + Đăng Bài + Seeding cho Đa Kênh.
---

# Lệnh: /publish

**Mục tiêu:** Kích hoạt chức năng phát hành nội dung vòng ngoài không giới hạn (Publisher Agent). Dựa vào nhóm Gói nội dung chờ xử lý (Pending), Hệ thống sẽ kiểm duyệt tính hợp lệ trước đăng tải đối với nội dung Bài đăng ảnh/Clip và chuỗi Bình luận mồi tương tác, để khởi nguồn phiên giao dịch Đăng bài mạng xã hội và Seeding đa phương diện.

> ⚠️ **LUẬT THÉP BẢO MẬT & ZERO-GARBAGE:**
Tuyệt đối KHÔNG đăng xuất mã phân quyền nền tảng (Cookies) sang môi trường bên ngoài bộ nhớ hệ thống. Mọi phân tác phát hành sẽ thực thi đồng thuận cơ sở môi trường Playwright tự khởi chạy trên bộ lưu trữ bảo mật cục bộ.

## ⚙️ QUY TẮC NGỮ CẢNH TỰ ĐỘNG (CONTEXT-AWARE RULE)
Nếu Quản trị viên KHÔNG cung cấp mã Ticket ID sau lệnh, Hệ thống thực hiện theo thứ tự ưu tiên:
1. **Ưu tiên 1:** Sử dụng Post ID vừa được kết xuất/phê duyệt trong phiên hội thoại hiện tại.
2. **Ưu tiên 2:** Đồng bộ từ Google Sheets CONTENT PIPELINE về local — chạy `node scripts/google_sync_engine.js --down` — lấy các bài có trạng thái `🚀 ĐĂNG BÀI NGAY` (bao gồm cả thành phẩm từ `/auto_mode [kênh]`).
3. **Ưu tiên 3:** Truy xuất `database/post_inventory.json`, lấy dự án có trạng thái `pending_publish`.
4. **Ưu tiên 4:** Nếu tất cả nguồn trên đều trống, hỏi lại Quản trị viên.

---

## 🔀 Quy trình Thực thi

### Bước 1: Khởi động Động cơ Phát hành (Auto-Publisher Engine)
- Rà soát các dự án trong Kho Thành phẩm `database/post_inventory.json` đang hiển thị trạng thái `pending_publish`.
- Hệ thống thi hành mã chạy ngầm tự khởi tạo: `npm run publish -- "[Post_ID]"` (Lưu ý ID lúc này sẽ phụ thuộc vào mảng `post_id` trong file json).
- *(Chú thích hệ thống: Cấu trúc Node.JS chịu trách nhiệm xử lý luồng thao tác với Playwright Automation `scripts/publish_engine_pw.js` qua các Cổng Session bảo mật được lưu kho cục bộ)*.

### Bước 2: Kích hoạt Định dạng Truyền tải Nền Tảng (Cross-Channel Adapting)
- Tiến hành tham chiếu dữ liệu định dạng (`image`, `carousel`, `reels`, `comment_chain`...) nhằm tối ưu phương thức khởi chạy thuật toán của Playwright.
- Điển hình định dạng đặc thù tương tác chuỗi `comment_chain`: Yêu cầu thực thi lệnh rải Văn bản Status đầu bảng sau đó tiếp nối chu kỳ khoảng trễ (delay) nhỏ và rải cấu trúc chuỗi giá trị mở rộng xuống khoang bình luận. 

### Bước 3: Rà Soát Chất Lượng Phân Phối Kép 
- Chuyên viên Tự động thu thập lại Đường dẫn bài đăng hiện thời (Post ID URL).
- Tổ chức chuyển đổi hạng mục tại hệ quy chiếu Pipeline json về mục dữ liệu cuối hành trình `"status": "published"`. Đồng thời khởi tạo log truy cập.

## 📤 Báo cáo Kết quả
Đưa ra thông báo sau khi hoàn thiện: *"Mọi thủ tục phân phối đã cấu thành một phiên giao dịch chuyển dữ liệu thành công! Trình tự đăng tải bao gồm phân tích ảnh động và các mảng tham số bình luận phụ trợ đều xuất hiện trên giao thức mạng Facebook nguyên bản. Quản trị viên tiến hành khai thác lệnh `/analyze_kpi` nếu có nhu cầu hậu kiểm chỉ số tương tác tổng thể theo định kỳ."*

// turbo-all
