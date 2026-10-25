# PolyGlot Studio 🎧🇩🇪🇬🇧

> Nền tảng học Tiếng Đức & Tiếng Anh chuyên sâu qua YouTube kết hợp **Nghe chép chính tả (Dictation)**, **Nói đuổi (Shadowing)**, **Hệ thống Hồ sơ Đa người dùng**, **Ngữ pháp & Giống danh từ**, và **Gamification chuẩn UI/UX Pro Max**.

[![Unit Tests](https://img.shields.io/badge/Unit%20Tests-4%2F4%20Passing%20(100%25)-emerald)]()
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205-blue)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20Express-green)]()
[![License](https://img.shields.io/badge/License-MIT-purple)]()

📖 **Xem tài liệu chi tiết đầy đủ tại**: [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 🌟 Tính Năng Nổi Bật

### 1. 👤 Hệ thống Hồ sơ Đa Người Dùng (Multi-User Profile)
- Onboarding chào mừng, chọn 12 Emoji Avatar sinh động.
- Cách ly hoàn toàn dữ liệu theo username: Cài đặt bật/tắt (Ẩn hiện kịch bản, màu giống danh từ), câu đã hoàn thành theo từng video, Sổ tay từ vựng, và Gamification (Streak, XP, Badges).
- Chuyển đổi qua lại giữa các profile nhanh chóng không sợ ghi đè dữ liệu.

### 2. 🎯 Nghe Chép Chính Tả (Dictation Mode)
- **Tự động ngắt & lặp câu (A-B Looper)**: Video tự dừng cuối câu để gõ.
- **Gợi ý tên riêng**: Trích xuất và hiển thị danh từ riêng tránh bị mất điểm chính tả oan.
- **Bàn phím tiếng Đức ảo**: Nút bấm nhanh `ä, ö, ü, ß, Ä, Ö, Ü`.
- **Thuật toán so khớp văn bản (Text Diff Engine)**: Đánh dấu xanh (đúng), vàng (sai hoa thường/umlaut), đỏ (thiếu), xám (thừa).
- **Phân tích ngữ pháp tức thì**: Thẻ ngữ pháp tự động mở rộng ngay sau khi nộp bài.

### 3. 🎙️ Nói Đuổi Chuẩn Sư Phạm 3 Bước (Shadowing Mode)
1. **Nghe câu gốc**: Thẩm thấu ngữ điệu người bản ngữ.
2. **Thu âm nhại giọng**: Bật mic (`MediaRecorder API`) để nói đuổi.
3. **Nghe đối chiếu 2 chiều**: Phát tuần tự `[Bản xứ] ➔ [Bạn]` để nhận diện độ lệch âm điệu.
- **AI Đánh giá phát âm**: Nhận diện giọng nói thời gian thực với Web Speech API.

### 4. 🇩🇪 Trụ Cột Ngữ Pháp & Giống Danh Từ Tiếng Đức
- **Hệ màu nhận diện giống danh từ**: `der` (Sky Blue), `die` (Rose Red), `das` (Emerald Green), `die Plural` (Purple).
- **Từ điển 800+ danh từ** + Kế thừa giống của từ ghép (*Komposita*: *Hauptbahnhof* ➔ *der Bahnhof*).
- **Quy tắc hình thái học hậu tố**: Nhận diện tự động `-ung`, `-heit`, `-keit`, `-chen`, `-ismus`.
- **Phân tích cú pháp Satzbau**: Xác định Subjekt, Verb V2, Động từ tách (*Trennbare Verben* như *anrufen*), Đảo ngữ Inversion.

### 5. 📜 Kịch Bản Tương Tác & Bản Dịch Song Ngữ
- **Chế độ làm mờ chống spoiler (Anti-Spoiler Blur)**: Tự động hết mờ và hiện bản dịch song ngữ Đức - Việt khi hoàn thành câu.
- **Tra từ điển 1 chạm**: Click vào từ để xem phiên âm IPA, từ loại, nghĩa tiếng Việt, và lưu vào Sổ tay từ vựng.
- **Nút Reset (Làm lại bài từ đầu)**: Cho phép ôn luyện lại video từ câu 1 kèm xác nhận an toàn.

### 6. 🏆 Gamification & Xây Dựng Thói Quen (Pillar 4)
- **Streak Tracker 🔥**: Theo dõi số ngày học liên tục và lịch 7 ngày hoạt động.
- **Mục tiêu câu hàng ngày 🎯**: Chọn 5, 10 hoặc 20 câu/ngày kèm thanh tiến độ.
- **Điểm kinh nghiệm (XP) & 10 Cấp bậc CEFR**: Thăng hạng từ `A1 Explorer` lên `C2 Polyglot Legend`.
- **8 Huy hiệu thành tích 🏆** & Thông báo Toast chúc mừng nổi bật.

---

## ⌨️ Phím Tắt Tiện Lợi (Hotkeys)

| Phím tắt | Thao tác |
|---|---|
| `Space` | Phát / Tạm dừng câu hiện tại |
| `Ctrl + Space` | Nghe lại với tốc độ chậm (0.75x) |
| `Enter` | Nộp bài kiểm tra chính tả |
| `Tab` hoặc `Ctrl + ➔` | Chuyển sang câu tiếp theo |
| `Ctrl + ⬅️` | Quay lại câu trước đó |
| `L` | Bật / Tắt chế độ lặp câu liên tục |

---

## 🚀 Hướng Dẫn Cài Đặt & Vận Hành

```bash
# 1. Cài đặt dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Chạy đồng thời Backend (5001) và Frontend (3000)
npm run dev

# 3. Chạy 4 bộ kiểm thử tự động
npm test

# 4. Build sản phẩm tối ưu
npm run build
```

---

## 📁 Cấu Trúc Dự Án

```
german_shadowing/
├── package.json
├── DOCUMENTATION.md                # Tài liệu tổng quan toàn bộ hệ thống
├── README.md                       # Trang giới thiệu nhanh
├── server/                         # Backend Express API (Port 5001)
└── client/                         # Frontend React + Vite + Tailwind (Port 3000)
```
# german-shadowing-app
