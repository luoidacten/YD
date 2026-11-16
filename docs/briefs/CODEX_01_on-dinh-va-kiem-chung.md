# CODEX_01 — Ổn định, kiểm chứng, dọn lịch sử

**Người giao:** Claude (quản lý). **Người làm:** Codex. **Ưu tiên:** CAO, làm trước mọi đề bài khác.

## Bối cảnh
- Dự án: `your-dungeon` v0.3, JS thuần trong `dist/`, chạy bằng Node 20, không có dependency. Đọc `AGENTS.md` và `CODEX.md` trước khi bắt đầu.
- Kết quả kiểm tra của quản lý (2026-11-15):
  - Git có 6 commit, đều tên "Update Site source". Không có tag. Các phiên bản thật đang nằm trong file tar.gz ở thư mục cha `YD/`.
  - Nhiều dòng code dài hơn 1.600 ký tự, các phương thức bọc nhau nhiều lớp. Không review được theo diff.
  - Tài liệu lệch nhau: bảng kiến trúc trong `CODEX.md` ghi "50 kỹ năng, 50 nội tại", còn README và phần v0.3 ghi 58/58.
  - Chưa có test chạy trận dài, nên không phát hiện được AI bị kẹt hoặc trận chỉ dừng nhờ giới hạn 480 s.

## Nhiệm vụ

### 1. Định dạng lại code, giữ nguyên hành vi
- Ngắt dòng các file `dist/*.js`: mỗi câu lệnh hoặc mỗi thuộc tính object dài một dòng, thụt lề 1 space như file hiện có. Không đổi tên, không đổi logic, không đổi thứ tự cài wrapper.
- Không thêm dependency. Nếu cần formatter, viết `scripts/format-check.mjs` chỉ để kiểm tra; không dùng Prettier.
- **Bằng chứng giữ nguyên hành vi:** trước khi định dạng, chạy `scripts/soak.mjs` (mục 3) với seed 1..20 và lưu hash kết quả vào `tests/fixtures/soak-baseline.json`. Định dạng xong chạy lại, hash phải trùng 100%.
- Commit riêng: `chore: format dist JS (no behavior change)`.

### 2. Làm sạch lịch sử phiên bản
- Tạo tag cho commit hiện tại: `v0.3.0-room-life`.
- Thêm `.gitignore`: `*.tar.gz`, `node_modules/`, `art/gemini-raw/`.
- **Không** xóa các file tar.gz ở `YD/`. Quản lý sẽ hỏi người dùng sau.
- Từ nay mỗi commit một việc, message theo dạng `feat:`, `fix:`, `art:`, `docs:`, `test:`.

### 3. Soak test: chạy nhiều trận seeded không cần trình duyệt
Tạo `scripts/soak.mjs`, chạy bằng `node scripts/soak.mjs --seeds 1-50 --waves 3`:
- Với mỗi seed, dựng một hầm ngục mẫu hợp lệ qua API có sẵn (`addRoom`, `playCard`, đặt chìa…), giống fixture trong `tests/lair.test.mjs`. `layoutIssues()` phải trả về rỗng.
- Mô phỏng trận ở bước 1/30 cho đến khi trận kết thúc. Không dùng DOM hay renderer.
- Ghi cho mỗi trận: kết quả, thời gian trận, số hero thoát/gục/chết, số quái gục, có chạm giới hạn 480 s hay không.
- **Phát hiện kẹt:** một entity còn sống mà 15 s mô phỏng không đổi ô, không tấn công, không channel, đang ở pha battle và không có lệnh guard/ambush. In ra seed, entity, ô, hành động AI cuối cùng.
- Xuất `soak-report.json` và một bảng tóm tắt ra console: tỉ lệ thắng, trung vị thời gian trận, số trận chạm 480 s, số lần kẹt.
- Thêm `tests/soak.test.mjs` chạy nhanh với seed 1–5 và 1 wave. Yêu cầu: 0 trận chạm 480 s và 0 lần kẹt. Nếu ngay lúc đầu đã fail, **ghi lại** trong report và sửa ở mục 4, không nới tiêu chí.

### 4. Sửa các lỗi soak tìm ra
- Mỗi kiểu kẹt có một regression test riêng. Sửa đúng nguyên nhân trong module tương ứng (`ai.js`, `room-life.js`, `terrain-tactics.js`…), không thêm teleport hay timeout "cứu cháy".
- Tôn trọng 13 bất biến trong `CODEX.md`.

### 5. Tài liệu
- Sửa bảng kiến trúc `CODEX.md` cho khớp con số thật. Lấy số từ code: đếm key của `SKILLS`, `PASSIVES`, `ITEMS`… rồi in ra bằng `node -e`, không chép từ README.
- Thêm vào `CODEX.md` mục "Kiểm chứng" mô tả soak và cách đọc report.

## Tiêu chí nghiệm thu (quản lý sẽ kiểm)
- [ ] `npm test` xanh, gồm cả `soak.test.mjs`.
- [ ] `node scripts/build.mjs` xanh.
- [ ] Hash soak baseline trước và sau khi định dạng trùng nhau.
- [ ] Không dòng nào trong `dist/*.js` dài quá 220 ký tự, trừ chuỗi dữ liệu catalog.
- [ ] `soak-report.json` với seed 1–50: không trận nào kẹt. Các trận chạm 480 s được liệt kê kèm lý do.
- [ ] Save `your-dungeon-v2` cũ vẫn load được. Mở `?sandbox=1` không ghi đè save thật.
- [ ] Mỗi mục trên là một commit riêng.

## Không làm
- Không thêm nội dung mới (quái, vũ khí, phòng).
- Không đổi cân bằng số liệu, trừ khi đó là nguyên nhân gây kẹt (ghi rõ lý do).
- Không deploy Site trong đề bài này.
