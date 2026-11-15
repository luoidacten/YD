# CODEX_06 — Tầng Chủ (chọn 1/3 boss + Ấn Tầng), họ Xương, 3 mạo hiểm giả mới có bạn đồng hành

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex.
**Đọc trước:** `GD/DESIGN_06_tang-chu-va-xuong.md`. Đó là thiết kế đầy đủ: bảng 8 boss, 32 chiêu, Ấn Tầng, 7 quái xương, 3 class.
**Thứ tự:** sau CODEX_05 (cần `PROFICIENCY`, `canEquip` và animation attack). Tách 5 commit theo mục A–E.

## Asset đã giao (không sửa file trong `frames/yd`; thiếu thì báo giám đốc mĩ thuật)
- `yd/monsters/<id>_{idle,run}_anim_f0..3`:
  - **boss:** necro_lord, spider_queen, frost_witch, orc_warlord, death_knight, bone_king (khoảng 30–42 px);
  - **xương:** skeleton_archer, skeleton_mage, skeleton_guard, skeleton_knight, ember_skeleton (16×16–18, có `hit_anim_f0`), bone_hound, bone_giant;
  - **bạn đồng hành:** wolf_pet, hawk, druid_bear.
- `yd/chars/{beastmaster,druid,hunter}_{idle,run}_anim_f0..3` (+`hit_anim_f0`).
- `yd/attack/<id>_attack_anim_f0..3` cho tất cả 19 id trên. Titan và Ác Ma dùng `ogre`/`big_demon` có sẵn, attack đã có từ v0.5.
- Ảnh tổng hợp: `art/SHOWCASE-v06.png`.

## A. Dữ liệu boss và chiêu
1. Tạo `BOSS_POOL` (file data mới hoặc `lair-data.js`). Mỗi boss có:
   - `{id, name, species, sprite, floors, style, hireCost, hp, attack, seals:[...], skills:[4 chiêu]}`;
   - mỗi chiêu theo DESIGN_06 mục 3.
   - Đổi tên hiển thị `warden` → **Titan**, `lord`/`inferno` → **Ác Ma**, nhưng **giữ id** để không vỡ save.
2. Thêm 6 species boss mới vào `SPECIES`. Kích thước vẽ tính theo chiều cao sprite: 0x72 big là 36 px, ứng với `size` hiện tại của boss.
3. Viết lại `bossTick` thành bộ chọn chiêu theo điểm:
   - giữ ngưỡng giai đoạn 60%/30% và hồi chiêu chung 8,5 / 7 / 5,5 s;
   - mọi chiêu sát thương đều qua `s.telegraphs`;
   - mọi random qua `Game.random()`.
4. Thêm loại `kind` theo nhu cầu:
   - `cone`, `beam`, `leap` (tính theo telegraph tại điểm đáp), `aura`, `taunt`, `blink`;
   - `summon` dùng `spawn` hiện có và tôn trọng `roomCapacity`;
   - `blink` chỉ trong phòng của boss.
   **Boss không rời phòng.**
5. Style AI điều khiển vị trí đứng (DESIGN_06 mục 3), đi qua hệ di chuyển hiện có.

## B. Chọn Tầng Chủ và Ấn Tầng
1. **Màn chọn:**
   - Hiện lần đầu đặt phòng `boss` ở tầng 0, và lần đầu đặt phòng `treasure` ở tầng 1.
   - Rút 3 boss khác nhau bằng seed, lọc theo `floors` và loại boss đã chọn ở tầng khác.
   - Thẻ có chân dung (idle_f0, nearest-neighbor ×4), tên, style, 4 chiêu, Ấn, giá.
   - Nút "Đổi bộ" 1 lần/tầng, giá 50 vàng.
2. **Chọn xong:** spawn boss vào phòng như `hire('warden'|'lord')` hiện tại. Gom vào một hàm `hireFloorBoss(floorId, bossId)`, và đường cũ gọi qua hàm này.
3. Không bắt đầu wave khi còn tầng có phòng chủ mà chưa chọn boss. UI báo lý do bằng tiếng Việt.
4. **Ấn Tầng:**
   - Áp qua **một** hàm `floorSeals(floorId)` được gọi ở các điểm tính chỉ số hiện có: HP, sát thương, tốc độ, giá thuê, bẫy.
   - Không rải `if (boss===...)` khắp code.
   - Boss gục thì Ấn tắt và log "Ấn Tầng vỡ".
5. **Save:**
   - Thêm `state.floorBoss = {[floorId]: {id, offered, rerolled}}`.
   - Save cũ: suy ra từ boss đang có (warden → tầng 0, inferno → tầng 1), không bật màn chọn.

## C. Họ Xương (7 loài)
- Thêm `family:'bone'`, `undead:true`, miễn poison/bleed, holy ×1,5.
- Có đủ KITS, FAVORITES, contract card, giá thuê, brain, slots, phòng theo bảng DESIGN_06 mục 4. Phòng chưa có thì bỏ, **không** tạo phòng mới.
- `ember_skeleton` nổ khi chết qua API thùng nổ.
- `bone_giant` chết thì spawn 2 `skeleton`, tôn trọng capacity: thiếu chỗ thì bỏ bớt.
- Ấn Kẻ Chiêu Hồn: quái `family==='bone'` hồi sinh 1 lần sau 8 s với 50% HP, tại chỗ gục, nếu phòng còn chỗ.
- Vũ khí khởi đầu theo CODEX_05: archer cầm cung, guard cầm khiên tròn W32, knight cầm đại kiếm W42.

## D. Ba mạo hiểm giả mới và bạn đồng hành
1. `beastmaster`, `druid`, `hunter`:
   - thêm vào pool đoàn chính và viện binh;
   - mỗi class có kit 4 skill + 2 passive từ catalog, bảng thông thạo (DESIGN_06 mục 5) và cá tính AI.
2. **Bạn đồng hành:** entity phe hero có `ownerId`, spawn cạnh chủ khi đoàn vào hầm.
   - Không chiếm slot đoàn, không nhặt đồ, không mang kho báu.
   - Không tính vào điều kiện thắng/thua.
   - Đi theo chủ trong ≤3 ô; chủ chết thì sói canh xác chủ 10 s rồi rời đi.
   - Save lưu `ownerId`.
3. **Sói** (`wolf_pet`, HP 60): đánh mục tiêu của chủ. Chủ có skill "Lệnh Vồ" để đẩy sói vào hàng sau.
4. **Chim Ưng** (`hawk`, không đánh): mỗi 3 s lộ ambush, bẫy chưa biết, gargoyle và Nữ Hoàng Nhện đang nấp trong 6 ô quanh chủ. Thông tin vào `knownTraps` / `seen` của đội, theo cơ chế hiện có.
5. **Dạng Gấu của druid:**
   - Đổi sprite sang `yd/monsters/druid_bear` trong 10 s, HP tối đa ×1,6 (giữ tỉ lệ HP), chỉ cận chiến; hồi chiêu 25 s.
   - Hết thời gian thì quay về sprite `yd/chars/druid`.
   - Không đổi `species` (giữ thông thạo và kit).

## E. Animation
- Dùng hệ attack của CODEX_05.
- Boss đang windup (`castUntil > time`) thì hiện `attack_anim_f1` đứng yên, rồi khi resolve chạy f2–f3.
- Hawk và necro_lord lơ lửng: idle và run là cùng một bob.
- Bạn đồng hành dùng run khi theo chủ.

## Tiêu chí nghiệm thu
- [ ] `node --test tests/v2.test.mjs` và `node scripts/build.mjs` xanh. Test mới tối thiểu:
  - rút 3 boss deterministic theo seed, không trùng giữa các tầng; đổi bộ chỉ 1 lần và trừ 50 vàng;
  - không bắt đầu wave khi chưa chọn boss;
  - mỗi boss dùng được đủ 4 chiêu trong một trận giả lập dài (seed cố định);
  - boss không rời phòng;
  - Ấn bật khi boss sống, tắt khi boss gục;
  - hồi sinh xương 1 lần, tôn trọng capacity; bone_giant vỡ ra 2 skeleton;
  - bạn đồng hành không mang kho báu, không tính thắng/thua; dạng gấu quay về đúng sprite;
  - mọi sprite được tham chiếu có đủ idle/run/attack.
- [ ] Save cũ v1/v2/v0.5 load được, boss cũ giữ nguyên.
- [ ] Soak seed 1–50: không phát sinh kẹt mới. Liệt kê tỉ lệ thắng theo từng boss, số chiêu boss dùng mỗi trận và số lần hồi sinh xương. Tỉ lệ thắng boss nào lệch quá ±20% so với trung bình thì ghi lý do và đề xuất chỉnh số.
- [ ] Ảnh chụp `screenshots/v06-*.jpg`:
  - (1) màn chọn 3 boss;
  - (2) Kẻ Chiêu Hồn gọi xương giữa trận;
  - (3) Vua Xương cùng đội quân xương;
  - (4) thuần thú sư + sói, thợ săn + chim ưng, druid dạng gấu;
  - (5) inspector hiện Ấn Tầng.
- [ ] Cập nhật `CODEX.md` (bất biến mới: Ấn Tầng áp ở **một** hàm; boss không rời phòng; bạn đồng hành không phải thành viên đoàn) và README.
