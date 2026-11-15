# Bàn giao CODEX_01–03 — v0.4.0

Chỉ commit/tag local để Claude kiểm, chưa deploy hoặc push. Save v2 giữ nguyên schema 2; QA browser dùng sandbox riêng. Không xóa tar.gz hoặc thay artwork director trong yd/. Các file GD/art/yd đang untracked có sẵn do director cung cấp, không nằm trong các commit gameplay này.

## Commit và tag

- `v0.3.0-room-life` → `58b8de6`: bản nhận việc.
- `730af99`, `c947a1b`: soak + baseline 20 seed trước định dạng.
- `76a7143` **chore: format dist JS (no behavior change)**: commit chỉ định dạng; full save SHA-256 20/20 trùng.
- `45c2bd6`, `1074d28`; tag `v0.3.1-stable`: sửa các deadlock, cập nhật số catalog runtime. Report CODEX_01: `tests/fixtures/soak-code01.json` (150 trận, 0 kẹt, 0 limit).
- `bf20e6f`: sửa vị trí cận chiến lệch tâm ô phát hiện sau nội dung mới; regression riêng. Report trước sửa giữ nguyên.
- `92cb36d`: CODEX_02 — 10 weapon, 4 hero + 4 quái, decor/hearts và kiểm kê sprite.
- `1f68f8d`: CODEX_03 — manifest, 14 HUD icon đã duyệt, fallback, canvas status, 9-slice, PNG validator.
- Tag `v0.4.0` tại commit bàn giao tài liệu và kết quả cuối.

## Bằng chứng cuối

| Kiểm tra | Kết quả |
| --- | --- |
| `node --run test` | **114/114 pass**; log: `tests/fixtures/test-results.txt` |
| `node scripts/build.mjs` | Pass: module, animation, âm thanh, icon PNG và sprite audit |
| `node scripts/format-check.mjs` | Mọi dòng dist/*.js ≤220 ký tự |
| `node scripts/compare-soak.mjs` | Full-save SHA-256 trước/sau định dạng: **20/20 trùng** |
| `node scripts/soak.mjs --seeds 1-50 --waves 3 --strict` | **150 trận, 0 kẹt, 0 chạm 480s**; trung vị **147,8s**, hầm ngục thắng 8/150 |
| `node scripts/sprite-audit.mjs` | **370 frame: 321 tham chiếu, 49 ngoại lệ có lý do, 0 không giải thích** |
| Catalog runtime | **58 skill / 58 passive / 40 effect / 47 Charm / 22 room / 45 item (28 weapon) / 30 species** |
| Fallback HUD | 1280×720, **0 pixel đổi**, hai JPEG byte-identical; SHA ở `hud-fallback-proof.json` |
| Browser | Menu → reset → hủy giữ run; sprite idle/run/single; không có console error/warn trong trang showcase |

Máy có Node 24, không có npm trong PATH. `node --run test` gọi đúng cùng script khai báo cho `npm test`; không cài dependency hoặc giả lệnh npm.

Soak dùng **150 trận độc lập** trên fixture hợp lệ; không phải campaign liên tục. Tỉ lệ thắng trên fixture ít phòng thủ không phải cam kết cân bằng. Detector giữ ngưỡng 15s, bỏ cửa sổ gục/guard/ambush, không xem đổi action đơn thuần là tiến triển. Root `soak-report.json` khớp `tests/fixtures/soak-v04.json`. Baseline định dạng không bị thay bởi kết quả sửa logic.

## Điểm cần đọc khi review

- Chuỗi wrapper: simulation → systems → content → lair (rescue, tactics, room-life, arsenal, **v04 cuối**).
- `dist/v04-data.js` đăng ký chung vào catalog; `v04.js` xử lý weighted spawn, rare/event gating, passive weapon procs, smith, angel/Forsaken và pumpkin one-shot friendly-fire burst.
- W13 dùng brittle có sẵn vì không có weaken. Thợ mỏ không đào vì chưa có API. Pumpkin chỉ bán/roll ở Chợ phiên. Angel ≤1 cả expedition, gồm viện binh.
- `scripts/sprite-exemptions.json` + bảng CODEX.md liệt kê đủ 49 frame chưa dùng (autotile/cửa hẹp/animation trung gian/biến thể thân trùng). Không báo sai rằng 370 frame đều đã render.
- `art/ICON-MANIFEST.json` giữ nội dung director cung cấp. Chỉ `done` được build; hiện 14 HUD, chưa có status/room/card done. Chưa có ảnh giữ glyph/sprite/CSS; không đổi bố cục hoặc gọi mạng ngoài.
- Ảnh: `screenshots/v04-sprites.jpg` (W13/W18/W22 đang cầm, 4 hero +4 quái), `v04-hud-icons.jpg`, `v04-hud-before.jpg`, `v04-hud-fallback.jpg`.
- Projectile vẫn là hoạt ảnh thị giác, sát thương tính lúc phát đòn theo cơ chế hiện có. Chưa có va chạm đạn bay độc lập; artwork mới trong yd/ chưa kích hoạt.

Đọc CODEX.md cho toàn bộ bất biến/save/migration và giới hạn. Đề bài gốc trong GD/ được giữ nguyên cho quản lý.
