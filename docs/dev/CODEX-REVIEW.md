# Bàn giao / tiến độ CODEX

## Đã kiểm chứng tới v0.5

- CODEX_01: hash định dạng 20/20 trùng, tag v0.3.0-room-life và v0.3.1-stable giữ nguyên.
- CODEX_02–03: tag v0.4.0; baseline soak 150 trận 0 kẹt/limit.
- CODEX_04: bestiary/project weapons/spell art, commit f734897; 150 trận 0 kẹt/limit, 5/150 thắng.
- CODEX_05-A: weapon/proficiency/technique/offhand/gun/bomb, bc8a533.
- CODEX_05-B: class và đội hình, 5c4fbcb.
- CODEX_05-C: 16 chủng loài, 364ce11 (được director commit trong lúc cộng tác), docs 86adba0.
- CODEX_05-D: attack renderer c0660b0 và commit kiểm chứng tiếp theo.

Lệnh: `node --run test`, `node scripts/build.mjs`, `node scripts/format-check.mjs`, `node scripts/project-art-audit.mjs`, `node scripts/compare-soak.mjs`.

144/144 test pass. Build/format pass. Phạm vi art v0.4–v0.5: 646/646 PNG được dùng, hash nguồn 409eb1c không đổi. Catalog: 58 skill, 58 passive, 40 effect, 47 Charm, 22 room, 76 item (55 main-hand weapon, 2 shield, 2 bomb), 67 species.

`tests/fixtures/soak/soak-code05.json`: 150 trận độc lập, 0 kẹt, 0 limit, 9/150 thắng, trung vị 150,25s. 897 kỹ thuật / 7696 đòn = 11,66%; 17 phát súng, 0 jam (người thạo). Test riêng unskilled jam chạy 100 lần và lặp cùng hash seed. Root soak-report khớp bản archive.

## Chưa đánh dấu đạt

- Benchmark 60 entity +40 FX có GPU readback: trước cache 24,5 frame/s, sau cache 36,7. Đây là render-only, không gồm AI; chưa đạt tiêu chí 50 FPS của CODEX_04 hoặc 55 FPS của CODEX_08. Report: tests/fixtures/render-benchmark-v05.json.
- IAB có throttle nền và giới hạn screenshot/viewport; ảnh art-review là fixture QA, không save người chơi. Cần hoàn thiện bộ ảnh sau HUD mới; không coi có file ảnh là nghiệm thu hình ảnh đã xong.
- Font/kit/biome và art v0.6+ đã được director thêm nhưng chưa tự kích hoạt ngoài CODEX_04–05. Không sửa PNG nguồn hoặc license art.

## Hàng việc người dùng mới giao

Thực hiện theo thứ tự **CODEX_06 → 07 → 08 → 09 → 10**, đọc brief trong docs/briefs/ cùng DESIGN_06 và DESIGN_08. CODEX.md giữ bất biến và chuỗi wrapper. Người dùng đã yêu cầu commit và đẩy lên https://github.com/luoidacten/YD.git; remote tên github, không force push, không deploy Site khi đang bàn giao cho Claude.

Tách commit từng mục trong brief; không nhảy sang art v0.6 trong registry cũ mà không có cơ chế đi kèm. Sau mỗi gameplay change chạy regression và soak phù hợp, giữ hash baseline UI/FX riêng. Máy có Node 24, npm chưa có trong PATH; node --run test gọi đúng package script.
