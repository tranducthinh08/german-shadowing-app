---
name: polyglot-ui
description: Kích hoạt khi thiết kế, tạo mới hoặc refactor giao diện người dùng (UI Components) cho PolyGlot Studio. Đảm bảo tuân thủ chuẩn Dark Glassmorphism, bộ icon Lucide duy nhất, và hệ thống quy ước màu sắc mạo từ/giống tiếng Đức.
---
# PolyGlot Studio UI & Design System Protocol

Chuyên gia thiết kế và lập trình giao diện Frontend React + Tailwind CSS cho PolyGlot Studio.

## 1. Triết lý thiết kế: Dark Glassmorphism
- **Background chính**: `bg-slate-950` hoặc `bg-slate-900`.
- **Card / Panel**: Nền bán trong suốt `bg-slate-900/60` hoặc `bg-slate-800/50`, kèm hiệu ứng làm mờ `backdrop-blur-md` hoặc `backdrop-blur-lg`.
- **Border**: Viền mờ tinh tế `border border-white/10` hoặc `border-slate-700/50`.
- **Shadow**: `shadow-xl shadow-black/20`.

## 2. Quy chuẩn màu sắc giống danh từ tiếng Đức (Noun Gender Palette)
Mọi component hiển thị từ vựng, flashcard, phân tích ngữ pháp tiếng Đức PHẢI tuân thủ bảng màu chuẩn sau:
- **Giống đực (`der`)**: Màu Xanh lam (`text-blue-400`, `bg-blue-500/10`, `border-blue-500/30`).
- **Giống cái (`die`)**: Màu Hồng/Đỏ hồng (`text-rose-400`, `bg-rose-500/10`, `border-rose-500/30`).
- **Giống trung (`das`)**: Màu Vàng hổ phách (`text-amber-400`, `bg-amber-500/10`, `border-amber-500/30`).
- **Số nhiều (Plural `die`)**: Màu Xanh lục (`text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/30`).

## 3. Quy chuẩn Thư viện Icon & Asset
- **Thư viện duy nhất**: Chỉ sử dụng `lucide-react` (ví dụ: `Volume2`, `Play`, `Check`, `RotateCcw`, `Sparkles`, `BookOpen`, `Flame`).
- **Nghiêm cấm**: Cài đặt thêm FontAwesome, React Icons, Material Icons, hoặc dùng SVG raw tùy tiện khi icon tương đương đã có trong `lucide-react`.

## 4. Cấu trúc Component & State
- **Naming**: `PascalCase` cho file và tên component (ví dụ: `DictationWorkspace.jsx`, `GenderBadge.jsx`).
- **Handler & Props**:
  - Hàm nội bộ: `handle...` (ví dụ: `handlePlayAudio`, `handleSelectOption`).
  - Props truyền từ cha: `on...` (ví dụ: `onNextSegment`, `onSelectWord`).
- **Tương tác Player**:
  - Dùng `forwardRef` và `useImperativeHandle` khi giao tiếp với `YouTubePlayer.jsx`.
  - Tuyệt đối không setState liên tục dưới 100ms lên Root State (`App.jsx`) chỉ để đồng bộ thanh progress bar của video.
