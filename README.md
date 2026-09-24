# 🧳 VALIGO - Nền Tảng Giao Nhận & Lưu Trữ Hành Lý Thông Minh
> **"Keep It Safe — Enjoy The Way"**  
> Nền tảng giao nhận hành lý du lịch cao cấp hàng đầu kết nối khách sạn, resort, sân bay và các tuyến tàu cao tốc tại Việt Nam và Nhật Bản.

---

## 🌟 Tổng Quan Dự Án

VALIGO giải phóng đôi tay du khách trong mọi chuyến đi. Không còn nỗi lo kéo vali cồng kềnh qua cầu thang ga tàu, chen chúc xe buýt hay chờ đợi check-in khách sạn. VALIGO nhận hành lý tận nơi, niêm phong bảo mật số và giao thẳng đến phòng khách sạn/resort của bạn.

---

## 🚀 Các Phân Hệ & Giao Diện Chính

### 1. 🇻🇳 Giao Diện Tuyến Việt Nam (`vietnam.html` / `index.html`)
* **URL:** `http://localhost:8080/` hoặc `http://localhost:8080/vietnam.html`
* **Các tuyến trọng điểm:**
  * ✈️ **Sân bay Nội Bài ➔ Phố Cổ Hà Nội** (từ 120.000đ)
  * 🏖️ **Sân bay Đà Nẵng ➔ Resort Phố Cổ Hội An** (từ 99.000đ)
  * 🏙️ **Sân bay Tân Sơn Nhất ➔ Trung tâm TP. Hồ Chí Minh** (từ 140.000đ)
  * 🚅 **Tuyến tàu Thống Nhất di sản & Đèo Hải Vân** (Hà Nội ➔ Đà Nẵng / Hội An)
  * 🏝️ **Đảo Ngọc Phú Quốc & Nha Trang**
* **Tính năng:**
  * Báo giá minh bạch theo VNĐ (đ) & USD ($).
  * Quy trình gắn tem niêm phong điện tử số (Tamper-evident QR/NFC Seal).
  * Gói bảo hiểm hành lý ValiShield tới 25.000.000 VNĐ.

### 2. 🇯🇵 Giao Diện Tuyến Nhật Bản (`japan.html`)
* **URL:** `http://localhost:8080/japan.html`
* **Đối tác mạng lưới:** Liên kết mạng lưới vận chuyển **Kuroneko Yamato (ヤマト運輸)** và hệ thống tàu siêu tốc **Shinkansen Tokaido/Sanyo**.
* **Các tuyến trọng điểm:**
  * 🚅 **Tokyo Station ➔ Kyoto Station** (từ ¥2,090 / ~350.000đ)
  * ✈️ **Sân bay Haneda (HND) ➔ Shinjuku / Shibuya** (giao hỏa tốc 3-4h)
  * ✈️ **Sân bay Narita (NRT) ➔ Trung tâm Tokyo** (từ ¥2,800)
  * 🏯 **Kyoto Ryokan ➔ Osaka Dotonbori / Umeda** (từ ¥2,100)
  * ⛩️ **Osaka Station ➔ Hiroshima & Đảo Miyajima** (từ ¥2,949)
  * ⛷️ **Sân bay New Chitose (CTS) ➔ Tokyo** (chuyên dụng vali quá khổ & đồ trượt tuyết Ski/Snowboard)
* **Tính năng:**
  * Chuyển đổi linh hoạt 3 loại tiền tệ: **JPY (¥)** ➔ **VNĐ (đ)** ➔ **USD ($)**.
  * Hỗ trợ đa ngôn ngữ không lo rào cản ngôn ngữ.
  * Bảo hiểm bồi thường tới ¥1,000,000 (~170.000.000 VNĐ).

### 3. ✨ Màn Hình Tải Trang Điện Ảnh (Cinematic Preloader)
* Hiển thị logo chính thức của **VALIGO** với hiệu ứng quét ánh kim (metallic sheen sweep), vầng hào quang chuyển động và chuyển động nâng hạ floating.
* Mô phỏng lộ trình giao nhận thời gian thực (xe van điện tại VN / tàu Shinkansen tại Nhật Bản).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu Cầu Hệ Thống:
* Node.js (phiên bản 18+ trở lên).

### Khởi Chạy:
1. Clone dự án:
   ```bash
   git clone https://github.com/trandinhnhut05/valigo.git
   cd valigo
   ```
2. Khởi động máy chủ:
   ```bash
   node server.js
   ```
   *(Hoặc click đúp chuột vào file `start.bat` trên Windows)*
3. Mở trình duyệt truy cập:
   * **Trang chủ Tuyến Việt Nam:** `http://localhost:8080`
   * **Tuyến Nhật Bản:** `http://localhost:8080/japan.html`

---

## 📁 Cấu Trúc Dự Án

```
VALIGO/
├── assets/                  # Hình ảnh thương hiệu, banner & logo chính thức
│   ├── valigo-logo.png      # Logo VALIGO chính thức
│   ├── vietnam-hero.jpg     # Banner du lịch Việt Nam
│   ├── japan-hero.jpg       # Banner du lịch Nhật Bản (Kyoto Gion)
│   └── japan-shinkansen.jpg # Hình ảnh Shinkansen ngắm núi Phú Sĩ
├── css/
│   ├── bounce.css           # Hệ thống giao diện chính (Design System)
│   ├── preloader.css        # Hiệu ứng chuyển động màn hình Loading
│   └── styles.css           # Bổ trợ phong cách
├── js/
│   ├── bounce.js            # Controller Tuyến Việt Nam
│   ├── japan.js             # Controller Tuyến Nhật Bản (đa tiền tệ, tuyến Shinkansen)
│   └── motion.js            # Engine chuyển động & Preloader
├── index.html               # Trang chủ chính (Tuyến Việt Nam)
├── vietnam.html             # Bản trang đích Tuyến Việt Nam
├── japan.html               # Bản trang đích Tuyến Nhật Bản
├── server.js                # Máy chủ HTTP Node.js tĩnh tối ưu
├── start.bat                # Kịch bản khởi chạy nhanh Windows
└── README.md                # Tài liệu dự án
```

---

## 📜 Giấy Phép (License)
Dự án được phát triển và sở hữu bởi **VALIGO Platform** © 2026.
Tất cả các quyền được bảo lưu.
