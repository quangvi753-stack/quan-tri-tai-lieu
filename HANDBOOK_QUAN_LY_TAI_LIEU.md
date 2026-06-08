# CẨM NANG VẬN HÀNH HỆ THỐNG QUẢN LÝ TÀI LIỆU (DOCMANAGER)

Chào mừng bạn đến với hệ thống quản lý và khởi tạo chứng từ thông minh. Cẩm nang này giúp các phòng ban (Kinh doanh, Kế toán, Kho, Ban giám đốc) nắm rõ trình tự lập và quản lý chứng từ chuẩn hóa của công ty.

---

## 🗺️ LUỒNG CHỨNG TỪ TIÊU CHUẨN

Mỗi đơn hàng/hợp đồng phát sinh trong doanh nghiệp sẽ đi qua các bước chứng từ theo đúng trình tự sau:

```
[Báo giá] ➔ [Xác nhận đặt hàng] ➔ [Hợp đồng] ➔ [Đề nghị tạm ứng] ➔ [Phiếu xuất kho] ➔ [Đề nghị thanh toán]
```

---

## 📘 CHI TIẾT CÁC BƯỚC THỰC HIỆN

### Bước 1: Soạn Báo Giá (Phòng Kinh Doanh)
*   **Mục đích**: Gửi báo giá sản phẩm cho khách hàng.
*   **Lưu ý quan trọng**:
    *   Sử dụng tính năng **Cấu hình khoảng giá** nếu khách đặt số lượng lớn để tự động tối ưu đơn giá.
    *   Bấm chọn nhanh **Presets mẫu điều khoản** ở chân trang để điền nhanh quy định thanh toán/giao hàng.
*   **Hành động tiếp theo**: Xuất file Word gửi khách hàng duyệt.

### Bước 2: Biên bản xác nhận đặt hàng (Phòng Kinh Doanh)
*   **Mục đích**: Xác nhận nhanh chủng loại, số lượng, thời gian, địa điểm giao nhận trước khi làm hợp đồng.
*   **Lưu ý quan trọng**:
    *   Sử dụng **Danh bạ khách hàng** để chọn nhanh thông tin đối tác mua hàng (Bên B).
    *   Xác định rõ địa điểm giao nhận (ví dụ: kho khách hàng, công trình...).
*   **Hành động tiếp theo**: Hai bên ký xác nhận đơn hàng.

### Bước 3: Soạn thảo Hợp đồng kinh tế (Phòng Kinh Doanh / Pháp Chế)
*   **Mục đích**: Ký hợp đồng chính thức ràng buộc pháp lý.
*   **Lưu ý quan trọng**:
    *   Tận dụng **Presets Điều khoản** (Điều 2 đến Điều 5) để đưa các điều khoản thanh toán, bảo hành, phạt chậm tiến độ chuẩn mực vào hợp đồng.
*   **Hành động tiếp theo**: Trình ký ban giám đốc hai bên và đóng dấu đỏ.

### Bước 4: Giấy đề nghị Tạm ứng (Phòng Kinh Doanh / Kế Toán)
*   **Mục đích**: Đề nghị khách chuyển khoản cọc đợt 1 để thực hiện đơn hàng.
*   **Lưu ý quan trọng**:
    *   Cần chọn đúng **Loại Căn cứ** (Hợp đồng / Đơn hàng / Đề nghị đặt hàng) và điền số hiệu tương ứng.
    *   Bấm các nút chọn tài khoản ngân hàng thụ hưởng mẫu của công ty để điền nhanh thông tin nhận tiền.
*   **Hành động tiếp theo**: Gửi công văn đề nghị tạm ứng cho kế toán đối tác.

### Bước 5: Phiếu xuất kho / Giao hàng (Phòng Kho)
*   **Mục đích**: Xác nhận giao hàng hóa đầy đủ và đúng tiến độ.
*   **Lưu ý quan trọng**:
    *   Kiểm tra số lượng bàn giao thực tế khớp với phiếu xuất kho.
*   **Hành động tiếp theo**: Lấy chữ ký nhận hàng của đại diện đối tác trên phiếu xuất kho để làm căn cứ thanh toán.

### Bước 6: Giấy đề nghị Thanh toán (Phòng Kế Toán)
*   **Mục đích**: Thu hồi số tiền còn lại sau khi đã giao hàng.
*   **Lưu ý quan trọng**:
    *   Điền đúng tổng giá trị và số tiền đã tạm ứng đợt trước để hệ thống tự động khấu trừ công nợ.
*   **Hành động tiếp theo**: Gửi đề nghị thanh toán kèm theo bộ chứng từ (Hợp đồng + Phiếu xuất kho + Hóa đơn VAT) để đối tác thanh toán dứt điểm.

---

## 🤖 HƯỚNG DẪN CÁC CÔNG CỤ NÂNG CAO

1.  **Bộ Chứng Từ (Folder Quản Lý)**:
    *   Mỗi khi bắt đầu một đơn hàng/dự án mới, hãy tạo một **Bộ chứng từ mới** tại menu trái.
    *   Trong lúc soạn thảo bất kỳ tài liệu nào (Báo giá, Hợp đồng...), hãy bấm nút **Lưu Hồ Sơ** và chọn đúng Bộ chứng từ đó. Dữ liệu sẽ được nhóm chung giúp dễ dàng kiểm tra lịch sử.
2.  **AI OCR (Quét Tự Động)**:
    *   Bấm nút **"AI Quét File/Ảnh"** ở đầu các form để tải lên file nháp, PDF hoặc ảnh chụp. Gemini sẽ tự động đọc và điền dữ liệu vào form mà không cần gõ thủ công.
3.  **Soạn Thảo AI (Trợ Lý Chat)**:
    *   Sử dụng khi cần soạn thảo các văn bản phụ trợ phát sinh nằm ngoài các biểu mẫu có sẵn. Bấm **Lưu vào Bộ Chứng từ** sau khi hoàn thành.
