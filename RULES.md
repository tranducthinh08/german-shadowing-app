# QUY TẮC PHÁT TRIỂN & HƯỚNG DẪN KIẾN TRÚC: POLYGLOT STUDIO

Tài liệu này quy chuẩn toàn bộ kiến trúc, tiêu chuẩn viết mã nguồn (Coding Guidelines) và quy tắc hiệu năng dành cho kỹ sư phần mềm và các trợ lý AI (AI Agents / Cursor / Antigravity).

---

## 1. TỔNG QUAN KIẾN TRÚC & TECH STACK

Dự án **PolyGlot Studio** được tổ chức theo mô hình **Hybrid Monorepo** gồm hai ứng dụng độc lập:

```
german_shadowing/
├── client/                     # Frontend SPA (React 18, Vite 5, Tailwind CSS 3.4)
│   ├── src/
│   │   ├── components/         # Giao diện chia theo từng domain chức năng
│   │   ├── utils/              # Thuật toán xử lý ngôn ngữ & Multi-user Storage
│   │   ├── services/           # Gọi REST API
│   │   └── data/               # Dữ liệu giáo trình có sẵn (Nicos Weg)
├── server/                     # Backend REST API (Node.js >= 20, Express 4)
│   └── src/
│       ├── routes/             # Định tuyến API (/api/youtube, /api/dict)
│       ├── services/           # Trích xuất phụ đề 2 tầng & từ điển
│       └── data/               # Mock data & curriculum
├── test/                       # 5 bộ Unit Test tự động (test_core, test_grammar, test_gamification, test_user_storage, test_playlist)
├── api/index.js & vercel.json  # Serverless adapter deploy Vercel
├── .cursorrules                # Quy tắc rút gọn cho AI Agent
└── RULES.md                    # Tài liệu quy tắc chuẩn cho toàn bộ dự án
```

### 1.1. Cổng Dịch Vụ & Môi Trường
- **Client (Frontend)**: Chạy trên cổng `3000` (`http://localhost:3000`). Tự động reverse proxy các request bắt đầu bằng `/api` sang cổng `5001`.
- **Server (Backend)**: Chạy trên cổng `5001` (`http://localhost:5001`).
- **Production / Vercel**: Vercel Serverless Function trỏ từ `/api/(.*)` vào `api/index.js`.

### 1.2. Thư viện & Công nghệ
- **Giao diện**: Tailwind CSS v3.4 với triết lý Dark Glassmorphism (`slate-900`, bảng điều khiển bán trong suốt với viền mờ).
- **Bộ icon duy nhất**: `lucide-react`. Nghiêm cấm cài đặt thêm thư viện icon khác.
- **Web Browser APIs**: Web Speech API (`SpeechRecognition`), MediaRecorder API, YouTube IFrame API.

---

## 2. QUY CHUẨN ĐẶT TÊN & TỔ CHỨC CODE (CODING GUIDELINES)

### 2.1. Đặt tên (Naming Conventions)
- **Component**: `PascalCase` (ví dụ: `DictationWorkspace.jsx`, `GrammarAnalysisModal.jsx`).
- **Hàm tiện ích & Services**: `camelCase` (ví dụ: `compareSentence`, `getUserSettings`).
- **Hằng số hệ thống**: `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_USER_SETTINGS`, `GERMAN_SPECIAL_CHARS`).
- **Sự kiện & Callback**:
  - Hàm xử lý bên trong component bắt đầu bằng `handle...` (ví dụ: `handleCheckAnswer`, `handleAdvance`).
  - Props truyền từ cha xuống con bắt đầu bằng `on...` (ví dụ: `onNextSegment`, `onCompleteSentence`).

### 2.2. Quản lý State & Lưu trữ Dữ liệu Đa Người Dùng
- **Không dùng Redux/Zustand khi chưa cần thiết**: State toàn cục của bài học được quản lý tập trung tại `client/src/App.jsx`.
- **Tuyệt đối không lưu trực tiếp vào LocalStorage**:
  - Mọi thao tác đọc/ghi dữ liệu người dùng PHẢI thông qua `client/src/utils/userStorage.js`.
  - Dữ liệu được cô lập theo tiền tố `polyglot_user_{username}_{key}` để đảm bảo nhiều người dùng trên cùng một trình duyệt không bị ghi đè tiến trình học.
- **Cơ chế Gamification**:
  - Mọi hành vi cộng điểm kinh nghiệm (XP), chuỗi ngày học (Streak), và mở khóa danh hiệu (Badges) phải thông qua hàm `recordLearningAction()` trong `client/src/utils/gamification.js`.

### 2.3. Quy tắc Ngôn ngữ Tiếng Đức
- **Ký tự đặc biệt**: Hỗ trợ đầy đủ `ä, ö, ü, ß, Ä, Ö, Ü`. Khi chế độ nghiêm ngặt tắt, cho phép người dùng gõ thay thế (`ae -> ä`, `oe -> ö`, `ue -> ü`, `ss -> ß`).
- **Viết hoa danh từ**: Trong tiếng Đức, tất cả danh từ phải viết hoa. Quy tắc so khớp trong `textDiff.js` phải giữ toggle kiểm tra viết hoa chuẩn.
- **Quy chuẩn màu sắc giống danh từ (Gender Color Scheme)**:
  - Giống đực (`der`): Màu Xanh lam (`blue`)
  - Giống cái (`die`): Màu Hồng/Đỏ hồng (`rose`/`pink`)
  - Giống trung (`das`): Màu Vàng hổ phách (`amber`/`yellow`)
  - Số nhiều: Màu Xanh ngọc lục bảo (`emerald`/`green`)

### 2.4. Điều khiển Player & Media
- Thành phần `YouTubePlayer.jsx` sử dụng `forwardRef` và `useImperativeHandle` để expose các hàm gọi trực tiếp: `seekTo(seconds)`, `play()`, `pause()`, `replaySegment()`, `setSpeed(speed)`.
- Không cập nhật State React tần suất cao (dưới 100ms) lên Root State chỉ để đếm thời gian phát video.

### 2.5. Giới Hạn Kích Thước File (File Size Limit <= 400 Dòng)
- **Ngưỡng giới hạn cứng**: Mọi file mã nguồn logic (`.js`, `.jsx`, `.ts`, `.tsx`) trong `client/src` và `server/src` (components, utils, hooks, services, routes, test) **tuyệt đối không được vượt quá 400 dòng**.
- **Ngoại lệ duy nhất**: Các file dataset fixtures tĩnh trong `src/data/` (như kịch bản 80 tập Nicos Weg 18,000 dòng hoặc từ điển âm thanh tĩnh).
- **Chiến lược phân tách khi chạm ngưỡng 300 - 350 dòng**:
  - React Component $\rightarrow$ Tách sub-components cho các khối modal/card/toolbar hoặc tách Custom Hook (`src/hooks/`).
  - Logic/Utility $\rightarrow$ Tách dữ liệu/constants sang `src/data/` hoặc tách thuật toán phụ trợ sang helper module.
  - Backend Service $\rightarrow$ Tách các adapter/extractors con thành service modules riêng.
- **Kiểm tra tự động**: Chạy `npm run check:lines` trước khi commit.

---

## 3. QUY TẮC HIỆU NĂNG CHO AI AGENT (PERFORMANCE RULES)

1. **Quét file có định hướng (Targeted Scans)**:
   - Không thực hiện quét đệ quy toàn bộ dự án hoặc quét vào `node_modules/`, `client/dist/`, `.git/`.
   - Khi tìm hiểu chức năng cụ thể, đi thẳng vào thư mục domain tương ứng tại `client/src/components/<domain>/`.
2. **Đọc trọn vẹn file nhỏ/vừa**:
   - Các file tiện ích (`client/src/utils/`) và backend services (`server/src/services/`) đều được module hóa (< 300 dòng). Ưu tiên đọc toàn bộ file một lần thay vì đọc từng đoạn nhỏ để tiết kiệm token và ngữ cảnh.
3. **Bảo toàn chú thích & Tài liệu**:
   - Giữ nguyên các chú thích JSDoc, giải thích sư phạm và tài liệu hiện có trong code khi refactor.
4. **Quy trình Kiểm thử Tự động (Verification Protocol)**:
   - Sau khi thay đổi bất kỳ file nào trong `client/src/utils/` hoặc `server/src/services/`, AI Agent **bắt buộc** phải chạy lệnh:
     ```bash
     npm test
     ```
   - Tất cả 5 bộ kiểm thử (`test_core`, `test_grammar`, `test_gamification`, `test_user_storage`, `test_playlist`) phải PASS 100% trước khi kết thúc tác vụ.
