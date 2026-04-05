---
description: Lệnh thu thập Bảng Điều Khiển CMS (Dashboard hiển thị Ý Tưởng) để thẩm định nội dung trực tiếp trên giao diện hệ thống.
---

# Lệnh: /danh_sach_y_tuong

**Mục tiêu:** Kích hoạt chế độ "Trạm Kiểm Duyệt CMS" nội bộ. Hệ thống sẽ truy xuất dữ liệu từ Kho ý tưởng (Idea Bank) và khởi tạo một Bảng Thông tin trực quan lên file tĩnh (Dashboard vật lý), hỗ trợ Quản trị viên theo dõi, phê duyệt hoặc loại bỏ dự án với trải nghiệm tốt nhất trên VS Code.

## 🔀 Quy trình Thực thi của Hệ thống

### Bước 1: Khai thác Dữ liệu
- Hệ thống truy xuất file `database/idea_bank.json`.
- Sàng lọc và trích xuất danh sách các hạng mục mang nhãn `"status": "pending"`. Giới hạn hiển thị 10-15 ý tưởng mới nhất.

### Bước 2: Dựng Giao Diện Quản Trị (CMS View)
- Hệ thống tạo và thao tác trên 1 file vật lý tĩnh tại thư mục gốc của Dự án: `DASHBOARD_Y_TUONG.md`.
- **LUẬT KHÔNG XẢ RÁC:** TUYỆT ĐỐI không tạo thêm file mới có chứa số đếm (như `..._1.md`). Phải sử dụng công cụ Tái Lập và Ghi đè (Overwrite) lên chính xác file `DASHBOARD_Y_TUONG.md` này mỗi khi gọi lệnh.
- Cấu trúc Bảng gồm các Cột:
- Sử dụng tiêu chuẩn bảng Markdown chuyên nghiệp.
- Cấu trúc Bảng gồm các Cột:
  - `STT`: Số thứ tự (để Quản trị viên dễ gọi "Duyệt cái thứ 3").
  - `ID`: Mã định danh (In đậm).
  - `Góc Nhìn (Angle)`: Thể loại nội dung, phong cách truyền đạt.
  - `Nội dung`: Trích dẫn tóm tắt mô tả cốt lõi.
  - `Nguồn`: Liên kết gốc.

**Ví dụ:**
| # | 🎫 ID | 🎭 Góc Nhìn | 📝 Mô Tả | 🔗 Nguồn |
|:--|:------|:------------|:----------|:---------|
| 1 | **`idea_01`** | *Phản biện* | Đi ngược số đông về việc làm 14h/ngày... | [Link] |
| 2 | **`idea_02`** | *Case Study* | Phân tích mô hình 100M của Alex Hormozi... | [Link] |

### Bước 3: Báo Cáo Tóm Tắt trên Khung Chat 
Bên cạnh thẻ Artifact, Hệ thống BẮT BUỘC đưa ra báo cáo tóm tắt trên Khung Chat:
- Tổng số lượng Ý tưởng đang chờ (VD: *"Hệ thống ghi nhận 8 Ý tưởng chờ xét duyệt"*).
- Phân loại chủ điểm nếu có (VD: *"Tập trung vào AI và Khởi nghiệp"*).
- Kết thúc bằng hướng dẫn: *"Quản trị viên có thể phản hồi trực tiếp, ví dụ: 'Duyệt idea_01 và idea_03' hoặc 'Bỏ cái thứ 2'."*

### Bước 4: Xử lý Lệnh Phê duyệt / Loại bỏ (Natural Language Parser)
Sau khi hiển thị Bảng, nếu Quản trị viên phản hồi bằng ngôn ngữ tự nhiên, Hệ thống BẮT BUỘC phân tích ý định và thực thi:

**Trường hợp PHÊ DUYỆT** (VD: "Duyệt idea_01", "Lấy cái đầu tiên", "Duyệt idea_01 idea_03"):
1. Mở file `database/idea_bank.json`.
2. Tìm đối tượng có ID tương ứng, đổi `"status": "pending"` → `"status": "approved"`.
3. Lưu file `idea_bank.json`.
4. Mở file `database/ideation_pipeline.json`.
5. Tạo Ticket mới và ghi bổ sung vào cuối mảng:
   ```json
   {
     "ticket_id": "post_[timestamp_hoặc_ID_ngắn]",
     "source_idea_id": "[ID vừa duyệt]",
     "status": "WAITING_FOR_CONTENT"
   }
   ```
6. Lưu file `ideation_pipeline.json`.
7. Phản hồi ngắn gọn: *"🟢 Đã phê duyệt `[ID]`. Ticket `[ticket_id]` đã sẵn sàng trong Pipeline. Quản trị viên có thể gọi `/vietbai` để bắt đầu sản xuất nội dung."*

**Trường hợp LOẠI BỎ** (VD: "Bỏ idea_02", "Xóa cái thứ 2", "Hủy idea_05 idea_08"):
1. Mở file `database/idea_bank.json`.
2. Tìm đối tượng có ID tương ứng, đổi `"status": "pending"` → `"status": "rejected"`.
3. Lưu file `idea_bank.json`.
4. Phản hồi ngắn gọn: *"🔴 Đã loại bỏ `[ID]`."*

> **Lưu ý:** Quản trị viên có thể thao tác nhiều ID cùng lúc. Hệ thống phải phân tách từng ID và xử lý tuần tự.

// turbo-all
