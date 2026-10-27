---
name: polyglot-qa
description: Kích hoạt khi kiểm tra chất lượng mã nguồn, chạy kiểm thử hồi quy (regression tests) và xác thực tính toàn vẹn của các thuật toán lõi, cơ chế lưu trữ đa người dùng (multi-user storage) và gamification trong PolyGlot Studio.
---
# PolyGlot Studio Quality Assurance & Verification Protocol

Kỹ sư kiểm thử phần mềm chuyên biệt cho PolyGlot Studio. Chịu trách nhiệm bảo đảm 100% các bộ kiểm thử tự động luôn pass trước khi hoàn tất bất kỳ thay đổi nào.

## 1. Khi nào kích hoạt Skill này?
- Sau khi thêm, sửa hoặc tối ưu bất kỳ file nào trong `client/src/utils/` hoặc `server/src/services/`.
- Trước khi tạo Pull Request, commit, hoặc hoàn tất một yêu cầu tính năng từ người dùng.
- Khi người dùng yêu cầu kiểm tra tình trạng sức khỏe (health check) hoặc test hồi quy hệ thống.

## 2. Quy trình kiểm thử bắt buộc (Mandatory Checklist)
1. **Chạy bộ kiểm thử tự động**:
   Chạy lệnh:
   ```bash
   node .gemini/skills/polyglot-qa/scripts/verify.js
   ```
   hoặc:
   ```bash
   npm test
   ```
2. **Xác nhận 6 bộ Unit Test cốt lõi**:
   - `test/test_core.js`: YouTube URL parsing, subtitle segmentation, textDiff algorithm, tolerance dấu nháy (`'s` vs `’s`), real-time live typing check (`computeLiveStream`).
   - `test/test_grammar.js`: Nhận diện mạo từ/giống danh từ (`der/die/das`), từ ghép (`Krankenhaus`), đuôi từ (`-ung`, `-chen`, `-ismus`), phân tích cấu trúc câu (V2, Trennbare Verben, Inversion, W-Frage).
   - `test/test_gamification.js`: Tính toán Level, XP, Streak, và điều kiện mở khóa danh hiệu (Badges).
   - `test/test_user_storage.js`: Cô lập dữ liệu LocalStorage theo tiền tố `polyglot_user_{username}_{key}`, đảm bảo không đè state giữa các profile.
   - `test/test_playlist.js`: Toàn vẹn giáo trình Nicos Weg A1 (80 tập, 2428 câu).
   - `test/test_alphabet.js`: Bảng chữ cái tiếng Đức, cụm âm khó (V, W, Z, Umlaute, EI vs IE), bộ tạo câu hỏi ôn tập hàng ngày.

3. **Nguyên tắc xử lý lỗi**:
   - Nếu có bất kỳ test nào fail: KHÔNG ĐƯỢC kết thúc task. Phải phân tích chính xác test case bị lỗi và sửa ngay.
   - Không được sửa file `test/*.js` để "lách" qua bài test, trừ khi có yêu cầu thay đổi nghiệp vụ cụ thể từ người dùng.
