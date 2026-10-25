# BẢN ĐẶC TẢ GIAO DIỆN & BỘ PROMPT GOOGLE STITCH CHO POLYGLOT STUDIO 🎨🚀

Tài liệu này được tối ưu riêng để bạn copy-paste trực tiếp vào **Google Stitch** (`stitch.withgoogle.com`) để AI của Google tạo ra giao diện web hiện đại, chuẩn UI/UX Pro Max cho ứng dụng học ngoại ngữ **PolyGlot Studio**.

---

## PHẦN 1: MASTER PROMPT CHUẨN ĐỂ COPY VÀO GOOGLE STITCH

> [!TIP]
> **Cách dùng**: Hãy sao chép toàn bộ khối lệnh dưới đây và dán vào thanh nhập Prompt của Google Stitch. Prompt được viết bằng tiếng Anh chuẩn UI/UX design tokens giúp Google Stitch sinh layout chuẩn xác nhất.

```markdown
Create a high-end, responsive web application UI for "PolyGlot Studio", a specialized YouTube-based language learning platform (German 🇩🇪 & English 🇬🇧) focused on Dictation (listening transcription) and Shadowing (speech mimicry).

### Design Style & Aesthetic (UI/UX Pro Max):
- **Theme**: Premium Dark Glassmorphism & Cyber-clean aesthetic.
- **Color Palette**:
  - Background: Deep obsidian dark `#070b14` with subtle radial gradients (`#0f172a` and `#1e1b4b`).
  - Surface & Cards: Semi-transparent backdrop-blur dark slate (`rgba(15, 23, 42, 0.75)` with `border border-slate-800/80` and soft neon glows).
  - Primary Accent: Electric Indigo / Cyan (`#6366f1` / `#06b6d4`).
  - Streak Flame: Fiery Orange (`#f97316`).
  - XP & Gamification: Warm Amber (`#f59e0b`).
  - German Noun Gender Color System:
    - Der (Masculine): Sky Blue `#38bdf8`
    - Die (Feminine): Rose Pink `#fb7185`
    - Das (Neuter): Emerald Green `#34d399`
    - Die Plural: Royal Purple `#c084fc`
- **Typography & Accessibility**: Inter or Plus Jakarta Sans. Clean hierarchy, strictly minimum 12px text floor for readability. Rounded corners (`rounded-2xl` and `rounded-3xl`). Apple-style segmented toggle pills.

---

### Key Layout & Screen Structure:

#### 1. Top Navigation Bar (Header)
- **Left**: Brand logo "PolyGlot Studio" with a neon headphone icon 🎧 and language badge (`🇩🇪 German` / `🇬🇧 English` switcher).
- **Center**: Smart YouTube URL Input bar with:
  - Video link input field with subtle glow.
  - Quick "📋 Dán link" (Paste from clipboard) button.
  - "Tải video" (Load) primary button.
  - "📚 Bài mẫu" (Sample lessons catalog) button.
- **Right Action Bar**:
  - Gamification pill showing: `🔥 5 Ngày Streak` | `🎯 8/10 Câu` | `⚡ Level 3 (B1)` with glowing amber border.
  - "📖 Sổ từ vựng" (Saved Vocabulary Notebook) button with counter badge.
  - "🕒 Lịch sử" (Study History) button.
  - User Profile pill: Emoji avatar (e.g. 🦊), username "Alex", and a dropdown arrow for multi-user switching.

---

#### 2. Main Studio Workspace (2-Column Desktop Grid)

##### Column A (Left - 50% width): Video Player & Media Controls
- 16:9 embedded video container with dark rounded corners, glowing active frame, and video title.
- Playback toolbar underneath:
  - Play/Pause toggle (Space).
  - Slow replay button `0.75x` (Ctrl+Space).
  - A-B Sentence repeat loop switch (Loop L).
  - Current sentence timestamp: `01:24 - 01:28` with progress scrubber.
  - Quick Hotkeys cheat-sheet tooltip.

##### Column B (Right - 50% width): Interactive Learning Studio
Tabs segmented control at the top: `[ ✍️ Nghe chép chính tả (Dictation) ]` and `[ 🎙️ Luyện nói đuổi (Shadowing) ]`.

**When Dictation Tab is active:**
- **Proper Nouns Hint Bar**: Floating pill chips for detected names (e.g., `💡 Gợi ý tên riêng: [Nico] [Lisa] [München]`).
- **German Special Character Virtual Keys**: Quick-insert buttons (`ä`, `ö`, `ü`, `ß`, `Ä`, `Ö`, `Ü`) directly above input.
- **Transcription Textarea**: Large glassmorphism typing box with placeholder "Nghe và gõ lại chính xác câu bạn nghe được... (Bấm Enter để nộp)".
- **Control Bar**:
  - "💡 Gợi ý chữ đầu" (Hint first letters: `H____! I__ b__...`)
  - "👁️ Hiện đáp án" (Show Answer)
  - "🚀 Nộp bài kiểm tra (Enter)" glowing button.
- **Instant Result & Diff Card (Appears after submission)**:
  - Accuracy Score Ring (e.g. `95% - Rất tốt!`).
  - Word-level Diff Breakdown:
    - 🟢 Green highlight for exact matches.
    - 🟡 Yellow highlight for capitalization or missing umlaut.
    - 🔴 Red strikethrough for omitted words.
    - ⚪ Gray tag for extra words.
- **Auto-expanding Grammar Analysis Card**:
  - Satzbau structure breakdown: Subjekt (`Ich`), Verb V2 (`bin`), Trennbare Verben (`anrufen`).
  - Bilingual German - Vietnamese sentence explanation.

**When Shadowing Tab is active:**
- **3-Step Pedagogical Stepper**:
  - `Step 1: Nghe người bản ngữ` (Waveform audio play).
  - `Step 2: Thu âm nhại giọng` (Big glowing pulsating microphone button with live recording timer).
  - `Step 3: Đối chiếu 2 chiều` (Dual player button: `[🎧 Mẫu bản ngữ] ➔ [🎙️ Giọng của bạn]`).
- Real-time speech recognition transcription text with accuracy score meter (e.g., `88% Tương đồng`).

---

#### 3. Interactive Transcript & Bilingual Subtitle Panel (Bottom or Side Drawer)
- Header with sentence counter (`Câu 4 / 28`), progress bar (`45%`), and controls:
  - "👁️ Làm mờ kịch bản (Chống spoiler)" toggle switch.
  - "🎨 Tô màu giống danh từ (der/die/das)" toggle switch.
  - "🔄 Làm lại bài từ đầu (Reset)" button with caution styling.
- List of interactive sentence cards:
  - **Completed Sentences**: Unblurred, highlighted in subtle cyan tint, showing the full German transcript with color-coded nouns (`der Tisch` in blue, `die Frau` in pink, `das Auto` in green). Beneath it: Full Vietnamese translation in soft gray-blue text.
  - **Current Active Sentence**: Glowing border with play/replay indicator.
  - **Upcoming Sentences**: Blurred with a frosted-glass overlay when anti-spoiler mode is active.
  - **Click-to-lookup on any word**: Clicking a word triggers an instant dictionary popover showing IPA, Part of Speech, noun gender, Vietnamese definition, audio speaker icon, and a "⭐ Lưu từ" button.

---

#### 4. Overlay Modals & Dashboards

- **Modal 1: User Profile & Multi-User Switcher**:
  - Welcome banner, username text input, 12 emoji avatar picker grid (`🦊`, `🐼`, `🦁`, `🚀`, `🦉`, `🐯`, `💎`, `⚡`, `🍀`, `🎯`, `🔥`, `⭐`).
  - List of existing saved user profiles with active indicator and 1-click switch.
- **Modal 2: Gamification & Habit Hub**:
  - Tab 1: Streak Calendar (7-day activity checkmarks with flame icon).
  - Tab 2: Daily Sentence Goal selector (`5 câu / ngày`, `10 câu / ngày`, `20 câu / ngày`) with circular percentage ring.
  - Tab 3: 8 Achievement Badges showcase (Unlocked badges glowing with badges like `🌟 Bước Chân Đầu Tiên`, `⚡ Bút Gỗ Siêu Tốc`, `🎯 Mắt Cú Tinh Anh`, `🎙️ Bản Sao Bản Xứ`).
- **Modal 3: Study History & Lesson Management**:
  - Cards for previously studied YouTube videos with thumbnail, title, last studied date, progress bar (`14/20 câu`), and action buttons ("Tiếp tục học" & "Làm lại từ đầu").
```

---

## PHẦN 2: THÔNG SỐ THIẾT KẾ CHI TIẾT (DESIGN SPEC SHEET)

Khi làm việc trong Google Stitch, bạn có thể gửi thêm các thông số kỹ thuật (Design Tokens) này để giao diện đồng bộ chính xác:

### 1. Bảng màu (Color Tokens)

| Thành phần | Mã màu Hex | Tác dụng |
|:---|:---|:---|
| **Background Dark** | `#070b14` | Nền tổng thể toàn trang |
| **Card Surface** | `#0f172a` (opacity 80%) | Nền các khối thẻ card kính mờ |
| **Border Slate** | `#1e293b` / `#334155` | Viền khung tinh tế |
| **Primary Violet/Indigo** | `#6366f1` | Nút chính, chỉ báo active |
| **Primary Cyan Accent** | `#06b6d4` | Điểm nhấn công nghệ, câu đang phát |
| **Streak Flame** | `#f97316` | Biểu tượng ngọn lửa chuỗi ngày học |
| **XP Gold/Amber** | `#f59e0b` | Huy hiệu kinh nghiệm, level CEFR |
| **German Der (Đực)** | `#38bdf8` (`sky-400`) | Nhãn & viền từ danh từ giống Đực |
| **German Die (Cái)** | `#fb7185` (`rose-400`) | Nhãn & viền từ danh từ giống Cái |
| **German Das (Trung)** | `#34d399` (`emerald-400`) | Nhãn & viền từ danh từ giống Trung |
| **German Die Plural** | `#c084fc` (`purple-400`) | Nhãn & viền từ danh từ số Nhiều |
| **Diff Correct** | `#22c55e` | Màu xanh lá chữ gõ đúng |
| **Diff Case/Umlaut** | `#eab308` | Màu vàng chữ sai hoa/thường |
| **Diff Missing** | `#ef4444` | Màu đỏ từ bị gõ thiếu |

### 2. Kích thước & Quy chuẩn (Layout Tokens)
- **Bo góc**: Thẻ chính dùng `rounded-2xl` (16px), các nút bấm và nhãn tag dùng `rounded-xl` (12px) hoặc `rounded-full` (dạng viên thuốc pill).
- **Độ mờ kính (Backdrop Blur)**: `backdrop-blur-md` (12px) hoặc `backdrop-blur-lg` (16px).
- **Cỡ chữ tối thiểu**: Tuyệt đối không dùng chữ nhỏ hơn `12px` (`text-xs`). Tiêu đề từ `18px` đến `24px` (`text-lg` - `text-2xl`).

---

## PHẦN 3: CÁC PROMPT TINH CHỈNH TỪNG MÀN HÌNH (SUB-PROMPTS)

Nếu bạn muốn tạo riêng từng màn hình cụ thể trong Google Stitch hoặc bảo AI vẽ thêm các view chi tiết, hãy dùng các prompt con sau:

### Prompt A: Màn hình Chép chính tả (Dictation Focus View)
```markdown
Design the Dictation Workspace for PolyGlot Studio in dark glassmorphism:
- Top: Sentence progress "Câu 3 / 15", audio speed toggle (0.75x, 1x).
- Proper Noun chips: "Gợi ý tên riêng: Nico, Emma".
- German virtual keyboard buttons: ä, ö, ü, ß, Ä, Ö, Ü.
- Central input box with clean typography and glowing cyan focus state.
- Submit button with keyboard shortcut badge (Enter).
- Diff verification panel below: Accuracy score (92%), green/yellow/red diff chips, and collapsible syntactic grammar card showing Subject (Subjekt), Verb V2, and Separable Prefix.
```

### Prompt B: Màn hình Nói đuổi (Shadowing 3-Step Studio)
```markdown
Design the 3-Step Shadowing Studio view for PolyGlot Studio:
- Step 1: Card with Native Speaker waveform and Play button.
- Step 2: Giant glowing circular microphone button in the center with soundwave animation and live timer (00:04).
- Step 3: Dual-player comparison card with button "Play Native ➔ Yours" sequentially.
- Score badge at the bottom: "85% - Phát âm tốt" with phoneme suggestions.
```

### Prompt C: Modal Hồ sơ Người dùng & Đổi Tài khoản (User Profile Onboarding)
```markdown
Design an elegant dark modal for User Onboarding & Multi-User Profile switching:
- Header: "Chào mừng đến với PolyGlot Studio".
- User Name input field with clean glass border.
- 12 Emoji Avatar Selector grid (3x4) with glowing selection ring.
- Saved Profiles section: Horizontal pills for switching between profiles ("🦊 Alex", "🐼 Linh", "🦁 David").
- Save Profile action button.
```

### Prompt D: Modal Gamification & Huy Hiệu (Habit & Badges)
```markdown
Design a 3-tab Gamification Modal for a language learning app:
- Tab 1 (Streak): 7-day calendar row with flame 🔥 badges on completed days.
- Tab 2 (Mục tiêu ngày): Segmented cards for Daily Sentence Target: 5 sentences (Khởi động), 10 sentences (Tiêu chuẩn), 20 sentences (Cường độ cao) with circular progress bar.
- Tab 3 (Huy hiệu 🏆): 4x2 grid of 8 unlockable badges with glowing icon, badge name, description, and locked/unlocked state.
```

### Prompt E: Popover Tra Từ Điển 1 Chạm & Phân Tích Cú Pháp (Grammar & Dictionary Popover)
```markdown
Design a compact glassmorphism dictionary & grammar popover that opens when clicking a German word:
- Header: Word title "das Krankenhaus" with gender badge (das - Neutral in emerald green) and audio pronunciation speaker icon.
- Sub-header: IPA phonetic transcript "/ˈkʁaŋkn̩ˌhaʊ̯s/".
- Definition: Vietnamese meaning "Bệnh viện, cơ sở khám chữa bệnh".
- Grammar note: Compound noun breakdown (Kranken + das Haus ➔ inherits neuter gender das).
- Button: "⭐ Lưu vào sổ từ vựng".
```
