# TÀI LIỆU TỔNG QUAN HỆ THỐNG & TÍNH NĂNG: POLYGLOT STUDIO 🎧🇩🇪🇬🇧

**Dự án**: PolyGlot Studio – Nền tảng học Tiếng Đức & Tiếng Anh chuyên sâu qua video YouTube  
**Phiên bản**: v1.2.0 (UI/UX Pro Max Edition)  
**Ngày cập nhật**: 25/10/2026  
**Ngôn ngữ hỗ trợ**: Tiếng Đức (`de-DE`), Tiếng Anh (`en-US`), Bản dịch phụ trợ Tiếng Việt (`vi-VN`)

---

## 1. TỔNG QUAN DỰ ÁN (EXECUTIVE OVERVIEW)

**PolyGlot Studio** là ứng dụng web học ngoại ngữ hiện đại, kết hợp sức mạnh của kho nội dung video YouTube phong phú với 2 phương pháp sư phạm phản xạ ngôn ngữ hiệu quả nhất:
1. **Nghe chép chính tả (Dictation)**: Luyện mài sắc thính giác, độ nhạy âm vần, ngữ pháp và độ chính xác chính tả tới từng ký tự.
2. **Nói đuổi (Shadowing)**: Chu trình 3 bước luyện ngữ điệu, trọng âm, khẩu hình miệng và tốc độ phản xạ tự nhiên như người bản ngữ.

Ứng dụng được thiết kế theo phong cách giao diện **Dark Glassmorphism** (UI/UX Pro Max), đảm bảo độ tương phản cao, phông chữ tối thiểu 12px thân thiện cho mắt, và trải nghiệm không độ trễ (zero-latency).

---

## 2. KIẾN TRÚC HỆ THỐNG & NGĂN XẾP CÔNG NGHỆ (TECH STACK)

### 2.1. Cấu trúc Tổng thể
- **Client**: Single Page Application (SPA) xây dựng bằng **React 18** và bundler **Vite 5**. Styling bằng **Tailwind CSS** kết hợp icon vector **Lucide React**.
- **Server**: REST API xây dựng bằng **Node.js** & **Express**, hoạt động độc lập tại cổng 5001.
- **YouTube Caption Engine**: Cơ chế 2 tầng: Tầng 1 cào trực tiếp từ Google TimedText endpoint; Tầng 2 dự phòng tự động chuyển qua Python 3 `yt-dlp` khi video bật chống bot (`exp=xpe`).
- **Web APIs tích hợp**:
  - `Web Speech API` (`SpeechRecognition` / `webkitSpeechRecognition`): Nhận diện giọng nói thời gian thực.
  - `MediaRecorder API` + `AudioContext`: Ghi âm và xử lý âm thanh 2 kênh để đối chiếu phát âm.
  - `YouTube IFrame Player API`: Điều khiển tua, dừng, lặp phân đoạn câu chính xác theo mili-giây.

```
german_shadowing/
├── package.json                    # Root scripts (concurrently dev, test, build)
├── DOCUMENTATION.md                # Tài liệu tổng quan toàn bộ hệ thống
├── README.md                       # Hướng dẫn nhanh & Giới thiệu
├── server/                         # Backend Express (Port 5001)
│   ├── src/
│   │   ├── index.js                # Express Server entry point
│   │   ├── routes/
│   │   │   ├── youtube.routes.js   # Endpoint trích xuất subtitle & metadata video
│   │   │   └── dict.routes.js      # Endpoint tra từ điển & dịch tự động tiếng Việt
│   │   ├── services/
│   │   │   ├── youtube.service.js  # Tách caption 2 tầng (Timedtext + yt-dlp)
│   │   │   └── dict.service.js     # Tích hợp Wiktionary / Google Translate
│   │   └── data/mockData.js        # Kho bài học mẫu có sẵn
├── client/                         # Frontend React + Vite (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Header, SampleLessonsModal, ShortcutsModal
│   │   │   ├── user/               # UserProfileModal (Đa tài khoản & Onboarding)
│   │   │   ├── gamification/       # GamificationModal, GamificationToast
│   │   │   ├── grammar/            # GrammarAnalysisModal (Phân tích cú pháp câu)
│   │   │   ├── history/            # StudyHistoryModal (Lịch sử học & Reset bài)
│   │   │   ├── player/             # YouTubePlayer IFrame
│   │   │   ├── dictation/          # DictationWorkspace, GermanKeys, Diff breakdown
│   │   │   ├── shadowing/          # ShadowingWorkspace, AudioRecorder, Dual-Playback
│   │   │   ├── transcript/         # TranscriptList (Danh sách câu tương tác)
│   │   │   └── vocab/              # WordPopover, VocabNotebookModal
│   │   ├── utils/
│   │   │   ├── userStorage.js      # Quản lý hồ sơ & lưu trữ cách ly theo người dùng
│   │   │   ├── gamification.js     # Engine tính XP, Streak, Badges & CEFR Levels
│   │   │   ├── germanGrammar.js    # 800+ từ điển giống danh từ, Komposita, Suffixes
│   │   │   ├── sentenceAnalyzer.js # Phân tích ngữ pháp câu (Satzbau, Subjekt, Verb V2)
│   │   │   ├── properNouns.js      # Nhận diện & gợi ý tên riêng trong câu
│   │   │   ├── textDiff.js         # Thuật toán so khớp ký tự & chấm điểm
│   │   │   └── timeFormat.js       # Định dạng mốc thời gian phụ đề
│   │   └── App.jsx                 # Bộ điều phối trung tâm (Central State Orchestrator)
└── test/                           # 4 bộ kiểm thử tự động toàn diện (100% Pass)
    ├── test_core.js                # Test URL regex, subtitle parsing, text diff
    ├── test_grammar.js             # Test giống danh từ, từ ghép, trật tự từ Satzbau
    ├── test_gamification.js        # Test công thức XP, cấp độ CEFR, huy hiệu
    └── test_user_storage.js        # Test cách ly dữ liệu đa người dùng
```

---

## 3. CHI TIẾT CÁC TÍNH NĂNG NỔI BẬT

### 3.1. Hệ thống Hồ sơ Người dùng & Lưu trữ Cách ly (Multi-User Profile)
- **Tự động Onboarding**: Người dùng mới truy cập lần đầu sẽ được mở modal chọn tên hiển thị và lựa chọn 1 trong 12 Emoji Avatar sinh động.
- **Cách ly tuyệt đối (Data Isolation)**: Mọi dữ liệu và tùy chọn cấu hình được lưu theo tiền tố `polyglot_user_${username}_...`:
  - **Tùy chọn bật/tắt (Toggles)**: Trạng thái che mờ kịch bản (`isBlurScript`), bật màu sắc giống danh từ (`showGenderColors`), ngôn ngữ đang học (`selectedLang`), chế độ học (`activeMode`), mục tiêu số câu hàng ngày (`dailyTarget`).
  - **Tiến độ học theo bài**: Từng video lưu riêng danh sách các câu đã hoàn thành (`completedSentences_${videoId}`).
  - **Lịch sử học tập (Study History)**: Nhật ký các bài đã học, số câu hoàn thành, lần học cuối.
  - **Sổ tay từ vựng (Vocabulary Notebook)**: Các từ vựng người dùng đó đã bấm lưu kèm câu ngữ cảnh.
  - **Gamification**: Số ngày chuỗi Streak 🔥, điểm kinh nghiệm XP, Level CEFR, và các Huy hiệu đã mở khóa.
- **Chuyển đổi tài khoản nhanh**: Có thể chuyển đổi tức thì giữa các người dùng ngay tại thanh Header mà không lo bị đè dữ liệu của nhau.

---

### 3.2. Nhập Video & Thuật toán Phân đoạn Thông minh (Smart Subtitle Segmentation)
- **Hỗ trợ định dạng link đa dạng**: Nhận diện chuẩn xác mọi liên kết YouTube (dạng URL chuẩn, `youtu.be/`, YouTube Shorts).
- **Phân đoạn câu thông minh (Segmentation)**:
  - Tự động lọc sạch các chú thích tạp âm: `[Musik]`, `[Applause]`, `[Lachen]`.
  - Hợp nhất các mẩu phụ đề phân mảnh rời rạc của YouTube thành câu thoại trọn vẹn dựa trên dấu ngắt câu (`.`, `!`, `?`, `:`) và khoảng nghỉ tự nhiên.
  - Tích hợp sẵn **Kho bài mẫu phong phú**: DW Nicos Weg (A1/A2), Easy German, Hội thoại tiếng Anh hàng ngày để người dùng trải nghiệm ngay không cần tìm video.

---

### 3.3. Phòng Nghe Chép Chính Tả (Dictation Workspace)
- **A-B Looper & Auto-Pause**: Video tự động dừng ở cuối mỗi câu và lặp lại cho đến khi người học gõ xong.
- **Gợi ý Tên riêng (Proper Nouns Chips)**: Tự động trích xuất các danh từ riêng trong câu (tên người, địa danh, tên riêng viết hoa không có trong từ điển chung) và hiển thị dạng nhãn gợi ý để người học không bị mất điểm oan.
- **Bàn phím Ký tự Tiếng Đức chuyên dụng**: Các nút bấm nhanh `ä, ö, ü, ß, Ä, Ö, Ü` chèn trực tiếp tại vị trí con trỏ bàn phím.
- **Bộ máy So khớp Văn bản & Chấm điểm (Text Diff Engine)**:
  - 🟢 **Xanh lá**: Từ gõ hoàn toàn chính xác.
  - 🟡 **Vàng**: Đúng từ nhưng sai ký tự viết hoa/thường hoặc thiếu dấu biến âm (*Umlaut* `ä/ö/ü`).
  - 🔴 **Đỏ**: Từ bị bỏ sót.
  - ⚪ **Xám**: Từ thừa hoặc gõ sai hoàn toàn.
  - Điểm chính xác được tính theo tỷ lệ 0 – 100%.
- **Chế độ Gợi ý Thích ứng**:
  - Gợi ý chữ cái đầu: Hiện khung từ dạng `H____! I__ b__...` để gợi mở tư duy nghe.
  - Xem đáp án hoàn chỉnh khi gặp câu quá khó.
- **Tự động mở thẻ Phân tích Ngữ pháp**: Ngay khi nộp bài và hoàn thành câu, một thẻ tóm tắt ngữ pháp và cú pháp câu lập tức hiện ra giúp người học hiểu sâu cấu trúc câu vừa viết.

---

### 3.4. Phòng Luyện Nói Đuổi (Shadowing Workspace)
Được xây dựng chuẩn theo quy trình sư phạm 3 bước:
1. **Bước 1 – Nghe mẫu bản xứ**: Nghe câu gốc của video để thẩm thấu ngữ điệu, trọng âm từ và nhịp điệu.
2. **Bước 2 – Thu âm nhại giọng**: Bấm nút Micro phát sáng (`MediaRecorder API`) để nói đuổi đồng thời theo người bản xứ.
3. **Bước 3 – Nghe đối chiếu 2 chiều [Bản xứ] ➔ [Bạn]**: Phát tuần tự bản thu của người bản ngữ và bản thu âm của bạn để tai bạn tự nhận diện những điểm lệch về cao độ, phát âm phụ âm cuối và trọng âm.
- **AI Đánh giá Phát âm**: Tích hợp `Web Speech API` nhận diện giọng nói tiếng Đức (`de-DE`) hoặc tiếng Anh (`en-US`), so sánh câu nói thực tế với phụ đề và chấm điểm độ tương đồng.

---

### 3.5. Trụ cột Ngữ pháp & Màu sắc Giống Danh từ Tiếng Đức (Pillar 2: Grammar & Gender)
- **Hệ thống Mã màu Nhận diện Giống Danh từ (Noun Gender Color Coding)**:
  - 🟦 **Der** (Giống đực - Maskulin): Xanh dương sáng (`#38bdf8` / `sky-400`).
  - 🟥 **Die** (Giống cái - Feminin): Đỏ hồng (`#fb7185` / `rose-400`).
  - 🟩 **Das** (Giống trung - Neutral): Xanh ngọc lục bảo (`#34d399` / `emerald-400`).
  - 🟪 **Die Plural** (Số nhiều): Tím thạch anh (`#c084fc` / `purple-400`).
- **Từ điển 800+ Danh từ & Kế thừa Từ ghép (*Komposita*)**:
  - Tự động nhận diện giống của các từ ghép tiếng Đức dựa trên danh từ gốc cuối cùng (Ví dụ: *der Bahnhof* ➔ *der Hauptbahnhof*; *das Haus* ➔ *das Krankenhaus*).
- **Quy tắc Hình thái học Hậu tố (*Suffix Morphology*)**:
  - Tự động suy luận giống khi từ có đuôi đặc trưng: `-ung`, `-heit`, `-keit`, `-schaft`, `-tät`, `-ion` (luôn là `die`); `-chen`, `-lein`, `-ment` (luôn là `das`); `-ismus`, `-or`, `-ist` (luôn là `der`).
- **Phân tích Cú pháp Cấu trúc Câu (*Satzbau Analyzer*)**:
  - Xác định thành phần: Chủ ngữ (Subjekt), Vị ngữ (Prädikat - Verb V2), Tân ngữ (Objekt).
  - Tự động phát hiện **Động từ tách (*Trennbare Verben*)**: Ví dụ câu "*Nico ruft Lisa an.*" sẽ nhận diện tiền tố "*an-*" ở cuối câu và ghép lại thành động từ nguyên thể "*anrufen*".
  - Nhận diện các mẫu câu chuẩn: Câu khẳng định, Câu hỏi từ để hỏi (*W-Frage*), Câu hỏi đảo (*Ja/Nein Frage*), Đảo ngữ sau trạng từ thời gian/nơi chốn (*Inversion*).
- **Modal Thanh tra Ngữ pháp Chi tiết**: Nút icon sách ngữ pháp bên cạnh mỗi câu cho phép mở modal giải thích tường tận từng từ loại và cấu trúc câu.

---

### 3.6. Danh sách Phụ đề Tương tác & Bản dịch Song ngữ Đức - Việt
- **Chế độ Làm mờ Chống Spoiler (Anti-Spoiler Blur)**:
  - Khi bật, toàn bộ các câu chưa học sẽ được làm mờ để người học tập trung hoàn toàn vào kỹ năng nghe.
  - **Tự động mở khóa (Hết mờ)**: Khi hoàn thành Dictation câu nào, câu đó sẽ tự động sáng rõ, hiển thị cả câu gốc lẫn bản dịch nghĩa Tiếng Việt hoàn chỉnh bên dưới.
  - Có công tắc bật/tắt làm mờ độc lập ở thanh tiêu đề danh sách kịch bản (được lưu theo từng user).
- **Tra cứu Từ điển 1 Chạm (Click-to-Lookup)**:
  - Bấm vào bất kỳ từ nào trên kịch bản để mở popover tra nghĩa nhanh: Phiên âm IPA, từ loại, giống danh từ, định nghĩa tiếng Việt, phát âm mẫu giọng đọc, và link tra sâu Duden/LEO/Cambridge.
  - Nút **"Lưu từ vựng"** lưu trực tiếp vào Sổ tay của người dùng.

---

### 3.7. Trụ cột Gamification & Thói quen Học tập (Pillar 4: Gamification)
- **Chuỗi ngày học liên tục (Streak Tracker 🔥)**:
  - Tự động theo dõi số ngày học liên tục.
  - Bảng lịch hoạt động 7 ngày gần nhất với dấu tích trực quan.
- **Mục tiêu Câu Hàng Ngày (Daily Sentence Goals 🎯)**:
  - Cho phép người học chọn mục tiêu: 5 câu (Khởi động), 10 câu (Tiêu chuẩn), 20 câu (Cường độ cao).
  - Thanh tiến độ hiển thị phần trăm mục tiêu đạt được trong ngày.
- **Hệ thống Điểm Kinh nghiệm (XP) & 10 Cấp bậc CEFR**:
  - Hoàn thành 1 câu Dictation: `+10 XP`.
  - Hoàn thành 1 câu Shadowing: `+15 XP`.
  - Đạt điểm chính xác tuyệt đối (100%): Thưởng thêm `+5 XP`.
  - Thăng hạng qua 10 cấp bậc từ `A1 Explorer` lên đến `C2 Polyglot Legend`.
- **Hệ thống 8 Huy hiệu Thành tích (Achievement Badges 🏆)**:
  1. 🌟 *Bước Chân Đầu Tiên* (Hoàn thành câu đầu tiên)
  2. ⚡ *Bút Gỗ Siêu Tốc* (Chép 10 câu Dictation)
  3. 🎯 *Mắt Cú Tinh Anh* (Đạt độ chính xác 100%)
  4. 🎙️ *Bản Sao Bản Xứ* (Hoàn thành 5 câu Shadowing)
  5. 📚 *Thủ Thư Từ Vựng* (Lưu 5 từ vựng)
  6. 🔥 *Ngọn Lửa Bất Diệt* (Duy trì streak 3 ngày)
  7. 🏅 *Chiến Binh Chăm Chỉ* (Hoàn thành mục tiêu ngày)
  8. 👑 *Bậc Thầy Ngôn Ngữ* (Đạt cấp độ C1 trở lên)
- **Gamification Toasts**: Hiệu ứng thông báo bay nổi bật mỗi khi nhận thưởng XP, thăng cấp hoặc mở khóa huy hiệu.

---

### 3.8. Lịch sử Bài học & Nút Reset Làm lại Bài
- **Trang Lưu trữ Lịch sử Học (Study History Modal)**:
  - Hiển thị danh sách tất cả các video đã từng học.
  - Chi tiết ngày học gần nhất, số câu đã hoàn thành / tổng số câu trong video, thanh tiến độ phần trăm.
  - Nút tiếp tục học chuyển ngay về bài học đó.
- **Chức năng Reset (Làm lại bài từ đầu)**:
  - Nút bấm trực tiếp tại danh sách bài học và thanh công cụ.
  - Hộp thoại cảnh báo xác nhận trước khi reset để tránh bấm nhầm.
  - Khi xác nhận: Tiến độ câu hoàn thành của video đó được đặt về 0, chuyển ngay về câu đầu tiên, các câu kịch bản được làm mờ lại để người học thử thách lại từ đầu.

---

## 4. BẢNG PHÍM TẮT TIỆN LỢI (HOTKEYS)

| Phím tắt | Thao tác | Mô tả |
|:---|:---|:---|
| `Space` | **Phát / Dừng** | Bật hoặc tạm dừng câu hiện tại |
| `Ctrl + Space` | **Nghe chậm 0.75x** | Phát lại câu hiện tại ở tốc độ chậm để nghe rõ phụ âm |
| `Enter` | **Nộp bài** | Nộp câu trả lời trong ô Dictation để chấm điểm |
| `Tab` hoặc `Ctrl + ➔` | **Câu tiếp theo** | Chuyển sang câu kế tiếp trong bài |
| `Ctrl + ⬅️` | **Câu trước đó** | Quay lại câu vừa học |
| `L` | **Lặp câu (Loop)** | Bật / Tắt chế độ lặp câu liên tục |
| `Alt + 1 / 2 / 3` | **Chuyển chế độ** | Chuyển nhanh giữa Dictation, Shadowing, và Lịch sử |

---

## 5. BẢO ĐẢM CHẤT LƯỢNG & KIỂM THỬ (TEST SUITES)

Dự án duy trì tỷ lệ kiểm thử thành công **100% trên cả 4 bộ test tự động**:

```bash
npm test
```

1. **`test/test_core.js`**:
   - Kiểm tra trích xuất Video ID từ 6 định dạng link YouTube khác nhau.
   - Kiểm tra bộ phân đoạn phụ đề thông minh (lọc tạp âm `[Musik]`, gộp mẩu câu theo dấu câu).
   - Kiểm tra thuật toán Diff chấm điểm, nhận diện Umlaut tiếng Đức và thiếu từ.
2. **`test/test_grammar.js`**:
   - Kiểm tra nhận diện giống danh từ cho từ đơn (`der Tisch`, `die Frau`, `das Kind`).
   - Kiểm tra kế thừa giống từ ghép *Komposita* (`der Hauptbahnhof`, `das Krankenhaus`).
   - Kiểm tra luật hình thái học hậu tố (`-ung`, `-chen`, `-ismus`).
   - Kiểm tra phân tích cấu trúc cú pháp Satzbau (Subjekt, Verb V2, Động từ tách `anrufen`, Inversion).
3. **`test/test_gamification.js`**:
   - Kiểm tra công thức lũy tiến tính XP theo Level từ 1 đến 10.
   - Kiểm tra tính toàn vẹn của 8 huy hiệu thành tích và điều kiện mở khóa.
4. **`test/test_user_storage.js`**:
   - Kiểm tra đăng ký người dùng và chuyển đổi profile.
   - Kiểm tra tính cách ly tuyệt đối của cài đặt toggles người dùng (`isBlurScript`, `showGenderColors`).
   - Kiểm tra cách ly tiến độ câu hoàn thành per-video giữa các user.
   - Kiểm tra cách ly chỉ số Gamification (XP, Streak, Badges) và Sổ tay từ vựng.

---

## 6. HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ (Dự án có sẵn script vá tương thích `patch-crypto.cjs` cho môi trường Node 16 cũ).
- **npm**: Phiên bản 8+.
- **Python 3** (Tùy chọn, đi kèm `yt-dlp` cho cơ chế trích xuất phụ đề tầng 2).

### Các lệnh điều hành

```bash
# 1. Cài đặt toàn bộ dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# 2. Khởi chạy đồng thời cả Backend (5001) và Frontend (3000)
npm run dev

# 3. Chạy kiểm thử tự động toàn diện
npm test

# 4. Build sản phẩm tối ưu cho Production
npm run build
```

---

## 7. ĐỊNH HƯỚNG PHÁT TRIỂN TIẾP THEO (ROADMAP)

1. **Thuật toán Ôn tập Lặp lại Ngắt quãng (SRS - Spaced Repetition System)**:
   - Ứng dụng thuật toán SM-2 (tương tự Anki) cho Sổ tay từ vựng cá nhân để nhắc nhở học viên ôn từ sau 1 ngày, 3 ngày, 7 ngày.
2. **Xuất Thẻ Flashcards**:
   - Xuất danh sách từ vựng kèm ngữ cảnh câu ra định dạng Anki `.apkg` hoặc PDF có màu giống danh từ.
3. **Mở rộng Từ điển Tiếng Đức**:
   - Nâng cấp kho từ vựng từ 800+ lên hơn 3.000 danh từ phổ thông theo khung chuẩn Goethe/Telc A1-B2.
4. **Offline Voice Synthesis (TTS)**:
   - Tích hợp giọng đọc nhân tạo Offline khi video không có audio rõ ràng.
