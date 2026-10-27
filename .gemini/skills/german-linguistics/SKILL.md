---
name: german-linguistics
description: Kích hoạt khi phát triển, mở rộng hoặc sửa đổi các logic liên quan đến ngôn ngữ tiếng Đức (ngữ pháp, từ ghép, giống danh từ, quy tắc viết hoa, chia động từ, trích xuất phụ đề, hoặc thuật toán so khớp chính tả).
---
# German Linguistics & Didactics Protocol for PolyGlot Studio

Chuyên gia ngôn ngữ học và thuật toán đối chiếu tiếng Đức (German NLP & Didactics) trong PolyGlot Studio.

## 1. Ký tự đặc biệt & Biến thể gõ (Special Characters & Umlaut Tolerance)
- Tiếng Đức có 4 ký tự đặc biệt: `ä`, `ö`, `ü`, `ß` (và dạng hoa `Ä`, `Ö`, `Ü`).
- **Chế độ gõ linh hoạt (Loose Mode)**:
  - Cho phép người học gõ ký tự thay thế quốc tế: `ae` -> `ä`, `oe` -> `ö`, `ue` -> `ü`, `ss` -> `ß`.
  - Phải phân biệt rõ với lỗi chính tả thực sự (ví dụ: gõ `a` thay vì `ä` là thiếu dấu Umlaut -> cảnh báo vàng, không chấm sai hoàn toàn nếu bật chế độ khoan dung).
- **Chế độ nghiêm ngặt (Strict Mode)**:
  - Yêu cầu gõ chính xác 100% ký tự `ä`, `ö`, `ü`, `ß`.

## 2. Quy tắc Viết hoa Danh từ (German Capitalization)
- Mọi danh từ (Substantiv) trong tiếng Đức ĐỀU PHẢI VIẾT HOA chữ cái đầu tiên (ví dụ: `der Tisch`, `das Auto`, `die Freiheit`).
- Trong thuật toán so sánh `textDiff.js`:
  - Có toggle kiểm tra viết hoa danh từ (`caseSensitive`).
  - Khi viết thường danh từ (ví dụ: `tisch`), hệ thống gợi ý sửa: "Trong tiếng Đức, mọi danh từ phải viết hoa chữ cái đầu!".

## 3. Nhận diện Giống & Quy tắc Hậu tố (Suffix Gender Rules)
Khi xác định giống danh từ chưa có trong từ điển từ vựng:
- **Giống cái (`die`)**: Các đuôi `-ung`, `-heit`, `-keit`, `-schaft`, `-tion`, `-tät`, `-ik`, `-ie`, `-e` (phần lớn).
- **Giống đực (`der`)**: Các đuôi `-or`, `-ismus`, `-ling`, `-er` (chỉ người/nghề nghiệp).
- **Giống trung (`das`)**: Các đuôi `-chen`, `-lein`, `-ment`, `-um`, `-tum`.
- **Từ ghép (Komposita)**: Giống của từ ghép luôn được quyết định bởi từ đứng cuối cùng (ví dụ: `das Haupt` + `der Bahnhof` = `der Hauptbahnhof`).

## 4. Ngữ pháp câu & Cấu trúc Satzbau
- **Quy tắc Verb V2**: Trong câu trần thuật chính, động từ chia luôn đứng ở vị trí thứ 2.
- **Inversion (Đảo ngữ)**: Khi trạng từ đứng đầu câu (ví dụ: "Heute trinke ich..."), chủ ngữ bị đảo ra sau động từ.
- **Trennbare Verben (Động từ tách)**: Tiền tố tách ra nằm ở cuối câu (ví dụ: `anrufen` -> "Nico ruft Lisa an").
- **W-Frage**: Từ hỏi đứng đầu, động từ vị trí 2, chủ ngữ vị trí 3 ("Wie heißt du?").

## 5. Tiêu chuẩn dữ liệu giáo trình (Curriculum)
- Bám sát khung tham chiếu CEFR: A1 (Nicos Weg), A2, B1, B2.
- Mọi câu bài tập hoặc phụ đề nhập vào cần làm sạch speaker dashes (`-`, `–`), dấu ngoặc phụ đề, và ngắt câu thông minh theo dấu chấm/hỏi/than.
