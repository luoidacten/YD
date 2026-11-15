# CODEX_04 — Đưa bộ art v0.4 vào gameplay (nhân vật, quái, vũ khí, phép, HUD)

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex.
**Thứ tự:** sau CODEX_01. Có thể làm cùng CODEX_02 (nếu làm cùng thì nhập chung vào bảng `weapons` và danh sách quái). Phần HUD dựa vào CODEX_03.

## Asset đã giao (đừng sửa file PNG; cần sửa hình thì báo giám đốc mĩ thuật)
Xem `art/SHOWCASE-v04.png`. Mọi frame nằm ở `dist/assets/frames/yd/`, nạp đúng cách cũ của `painter.image(name)` (`assets/frames/${name}.png`). Không cần đổi loader.

| Nhóm | Tên sprite (giá trị `sprite`/`art`) | Frame | Khổ |
|---|---|---|---|
| Nhân vật | `yd/chars/paladin`, `dark_knight`, `frost_mage`, `pyromancer`, `assassin`, `berserker`, `goblin_king`, `skeleton_king` | `_idle_anim_f0..3`, `_run_anim_f0..3`, phần lớn có `_hit_anim_f0` | 16×28 (goblin_king 16×16, skeleton_king 16×20), chân ở hàng dưới cùng |
| Quái | `yd/monsters/ghost`, `bat`, `fire_elemental`, `eyeball`, `mushroom`, `spider`, `rock_golem`, `cube_slime` | `_idle_anim_f0..3`, `_run_anim_f0..3` | khoảng 16×18 |
| Vũ khí | `yd/weapons/weapon_crossbow`, `weapon_scythe`, `weapon_trident`, `weapon_flail`, `weapon_bone_wand`, `weapon_crystal_staff`, `weapon_scimitar`, `weapon_war_pick` | 1 frame, mũi hướng lên | 9–14 × 17–26 |
| Phép | `yd/fx/fx_fireball`, `fx_frost`, `fx_lightning`, `fx_heal`, `fx_poison`, `fx_shield`, `fx_curse`, `fx_holy` | `_anim_f0..3` | 16×16 |
| HUD | `assets/ui/hud/*.png` (14 file) | — | 16×16 |

## Nhiệm vụ

### A. Nhân vật mới
Mỗi id dưới đây dùng đúng **một** loài hiện có làm nền chỉ số, và có kit lấy từ catalog sẵn có. Không tạo hệ thống mới.
| id | Phe | Ý tưởng | Nền gợi ý |
|---|---|---|---|
| `paladin` | hero (wave ≥3) | Tank và hồi máu nhẹ, bảo vệ người yếu | knight + priest |
| `assassin` | hero (wave ≥2) | Đột kích, ưu tiên mục tiêu yếu, ẩn thân (status `stealth` có sẵn) | rogue |
| `frost_mage` | hero | Tầm xa, làm chậm (`slow`) | mage |
| `pyromancer` | hero | Tầm xa, bỏng (`burn`) | mage |
| `berserker` | hero | Cận chiến, sát thương tăng khi HP thấp. Chỉ làm nếu có passive phù hợp sẵn; nếu không thì dùng passive gần nhất | knight |
| `dark_knight` | quái / hợp đồng | Vệ binh phòng boss, `slots:2` | warden |
| `goblin_king` | quái (boss nhỏ) | Chỉ huy, trí khôn cao, buff goblin cùng phòng qua leader system | goblin |
| `skeleton_king` | quái (boss nhỏ) | Phòng `grave`, hồi sinh skeleton theo cơ chế nghĩa địa | skeleton |

- `hit_anim_f0`: renderer hiện frame này khoảng 0,15 s khi nhận sát thương, chỉ áp dụng cho loài có file đó.
- Hai "vua" là quái hiếm: thuê hoặc hợp đồng giá cao, hoặc chỉ ra từ gói.

### B. Tám quái mới (Gemini)
Thêm vào `NEW_MONSTERS` (hoặc file mới `bestiary-data.js` theo đúng mẫu đó):
- **Bay** (ghost, bat, fire_elemental, eyeball): **không** được bay qua tường hay vực. Chỉ là hình ảnh; vẫn giữ confinement phòng.
- **ghost:** yếu cận chiến, khó thấy (stealth).
- **bat:** nhanh, HP thấp, `slots:1`.
- **fire_elemental:** đòn gây burn.
- **eyeball:** trinh sát, tầm nhìn xa (truesight), sát thương thấp.
- **mushroom:** đòn gây poison, hợp `poisonpool`.
- **spider:** làm chậm, hợp `webnest`.
- **rock_golem:** tank chậm, `slots:2`.
- **cube_slime:** HP cao, chậm; nếu có cơ chế tách thì không bắt buộc.
- Mỗi con có contract card, đúng mẫu vòng lặp `for(const[id,d]of Object.entries(NEW_MONSTERS))`.

### C. Tám vũ khí mới (W23–W30)
Thêm vào mảng `weapons` của `arsenal-data.js`:
| ID | Tên | art | Gợi ý chỉ số |
|---|---|---|---|
| W23 | Nỏ | `yd/weapons/weapon_crossbow` | reach 6, power +0.2, attackSpeed −0.3, projectile `'arrow'` |
| W24 | Lưỡi Hái | `yd/weapons/weapon_scythe` | reach 2.2, power +0.2, có `bleed` |
| W25 | Đinh Ba | `yd/weapons/weapon_trident` | reach 2.6, như giáo, thêm làm chậm nhẹ |
| W26 | Chùy Xích | `yd/weapons/weapon_flail` | armorPierce 0.2, attackSpeed −0.2 |
| W27 | Đũa Xương | `yd/weapons/weapon_bone_wand` | reach 5, projectile `'curse'` (fx mới), có `weaken`/`mark` nếu có sẵn |
| W28 | Trượng Pha Lê | `yd/weapons/weapon_crystal_staff` | reach 6, projectile `'frost'` dùng fx_frost |
| W29 | Mã Tấu Cong | `yd/weapons/weapon_scimitar` | attackSpeed +0.2, reach 1.6 |
| W30 | Cuốc Chiến | `yd/weapons/weapon_war_pick` | armorPierce 0.3, power +0.1 |

### D. Hiệu ứng phép
- Viết `fxSprite(kind)` trong `painter.js`, trả về chuỗi 4 frame `yd/fx/fx_<kind>_anim_f{0..3}`. Lặp 8 frame/giây theo **thời gian thực của renderer**, không tiêu thụ `Game.random()` (bất biến 1).
- **Đạn:** `fire→fx_fireball`, `frost→fx_frost`, `curse→fx_curse`. Arrow, axe, knife giữ như cũ.
- **Hiệu ứng khi trúng hoặc khi cast:** heal → `fx_heal` (0,5 s trên đầu mục tiêu), `shield` → `fx_shield` (bao quanh lúc status còn hiệu lực), poison → `fx_poison`, holy/revive → `fx_holy`, stun → `fx_lightning`. Tối đa 40 hiệu ứng đồng thời; vượt quá thì bỏ cái cũ nhất.
- Ở LOD toàn tầng (dưới 10 px/ô) không vẽ fx, chỉ giữ màu như hiện tại.

### E. HUD
Nếu CODEX_03 đã xong: 14 icon trong `ui/hud` hiện tự động qua manifest (`art/ICON-MANIFEST.json`, status `done`). Nếu chưa xong: làm CODEX_03 trước.

## Quy tắc
- Vẽ nearest-neighbor, toạ độ nguyên. Không scale lẻ, không tint lại các sprite yd (chúng đã đúng palette).
- Không đổi file trong `dist/assets/frames/` gốc 0x72 hay trong `yd/`.
- Giữ các bất biến 1–13 của `CODEX.md`. Chỉ số trên là gợi ý; cân bằng bằng soak (CODEX_01), ghi lại mọi thay đổi.

## Tiêu chí nghiệm thu
- [ ] `npm test` xanh. Có test mới: mỗi sprite yd được tham chiếu đều tồn tại đủ frame; mỗi W23–W30 trang bị được và `Game.range` trả đúng reach; 8 quái thuê được và đúng quota.
- [ ] Script (thêm vào build): mọi file trong `frames/yd` đều được code tham chiếu ít nhất một lần.
- [ ] Soak seed 1–50: không có lỗi kẹt mới; tỉ lệ thắng thay đổi ít hơn ±15% so với baseline, nếu vượt thì ghi lý do.
- [ ] Ảnh chụp cận cảnh lưu vào `screenshots/v04-*.jpg`: (1) đoàn hero có paladin/assassin/pyromancer; (2) phòng có ghost/spider/rock_golem; (3) một fireball đang bay và fx_heal; (4) thanh HUD có icon mới.
- [ ] Không có request ngoài, không font web. Fx không làm tụt FPS: 60 entity + 40 fx vẫn đạt ≥ 50 FPS trên máy dev.
- [ ] Cập nhật `CODEX.md` (bảng file, giới hạn), README (con số catalog). **Không** sửa mục license của art (đã có).
