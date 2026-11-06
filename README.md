# Ứng Dụng Webapp: Năng Lực Tự Nhiên & Thiền Chuyển Hoá Cảm Xúc (Chị Minh Hằng)

Webapp thương mại tinh gọn chuyên cung cấp các gói đào tạo số hóa và dịch vụ tư vấn 1:1 theo triết lý Năng Lực Tự Nhiên, giải phóng bế tắc Thân - Tâm và trở về Tính Không.

---

## 🌿 Điểm Nổi Bật Của Ứng Dụng

1. **Trải nghiệm Zen & Chánh niệm:** Tone màu mộc mạc, tĩnh lặng (Warm Cream, Sage Green, Earth Sand), tối ưu cho người thực hành thiền.
2. **Zen Audio Player Tích Hợp:**
   - Hỗ trợ nghe thử trực tiếp Bài thiền 1 (đã tích hợp file audio thực tế).
   - Bộ hẹn giờ tắt (Sleep Timer: 10p, 20p, 30p, 45p) phục vụ người nghe trước khi ngủ.
   - Hiển thị song song các bước thực hành và nội dung Ebook chiêm nghiệm.
3. **Thanh Toán VietQR Đơn Giản (0đ Chi Phí Vận Hành):**
   - Tự động tạo ảnh mã VietQR ngân hàng cá nhân có sẵn số tiền và mã đơn.
   - Nút chép nhanh Số tài khoản, Nội dung chuyển khoản.
   - Nút kết nối Zalo gửi hóa đơn trực tiếp cho Chị Minh Hằng.
4. **Sổ Quán Sát Thân & Tâm (Digital Mindful Journal):**
   - Đánh giá chỉ số tâm lý trước/sau thiền.
   - Đánh dấu các điểm đau/tắc nghẽn trên cơ thể (ngực, cổ vai gáy, dạ dày...).
   - Bóc tách củ hành tây: Cảm xúc bề mặt & Lớp sâu bên dưới (nỗi sợ, cảm giác thiếu thốn...).
   - Viết lời yêu thương ôm ấp con người nhược điểm (như bài thiền 6 hướng dẫn).
   - Lưu trữ an toàn trên thiết bị (LocalStorage).
5. **Hệ Thống Đặt Lịch 1:1 (Consultation Booking):**
   - Chọn 1 trong 5 chủ đề: Thiền xem NLTN, Đặt tay năng lượng, Xem timeline quá khứ, Chuyển hóa cảm xúc, Chữa lành đất ở & dòng họ.
   - Chọn hình thức Online (Google Meet) hoặc Trực tiếp.
   - Điền phiếu chuẩn bị tâm thức (Intake Form) và gửi trực tiếp qua Zalo.

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### 1. Chạy ở chế độ phát triển (Development):
```bash
cd "/Volumes/D/Du an/Hang thien/web"
npm run dev
```
Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

### 2. Đóng gói bản Production (Build):
```bash
npm run build
npm run start
```

---

## ⚙️ Cấu Hình Thông Tin Ngân Hàng & Số Điện Thoại Zalo

Để thay đổi thông tin tài khoản ngân hàng nhận tiền và số Zalo hỗ trợ, bạn chỉ cần mở file:
`web/src/lib/data.ts` và chỉnh sửa biến `BANK_CONFIG`:

```typescript
export const BANK_CONFIG = {
  bankId: "MB", // Ngân hàng (MB, VCB, TCB, ACB, ...)
  bankName: "Ngân hàng TMCP Quân Đội (MBBank)",
  accountNumber: "0988888888", // Số tài khoản của bạn
  accountName: "TRAN THI MINH HANG", // Tên chủ tài khoản
  zaleContact: "https://zalo.me/0988888888",
  phoneSupport: "0988.888.888",
};
```
*(Mã QR trên web sẽ tự động cập nhật ngay lập tức theo tài khoản này).*

---

## 📁 Cấu Trúc Mã Nguồn

```text
web/
├── public/
│   └── audio/
│       └── bai-thien-1.m4a         # Audio mẫu nghe thử bài thiền 1
├── src/
│   ├── app/
│   │   ├── page.tsx               # Trang chủ giới thiệu triết lý, 6 bài thiền & các gói dịch vụ
│   │   ├── journal/page.tsx       # Sổ Quán Sát Thân Tâm tương tác
│   │   ├── booking/page.tsx       # Đặt lịch tư vấn 1:1 & Phiếu sàng lọc
│   │   ├── globals.css            # Cấu hình phong cách Zen & Tailwind
│   │   └── layout.tsx             # Khung trang chính
│   ├── components/
│   │   ├── Navbar.tsx             # Menu điều hướng tĩnh lặng
│   │   ├── ZenPlayerModal.tsx     # Trình phát thiền chuyên dụng & đọc Ebook
│   │   └── VietQRModal.tsx        # Màn hình quét mã VietQR đơn giản
│   └── lib/
│       └── data.ts                # Dữ liệu 6 bài thiền, các gói giá & cấu hình ngân hàng
```
