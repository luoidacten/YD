# DESIGN_05 — Vũ khí có yêu cầu, thông thạo, kỹ thuật và class mạo hiểm giả mới

Tác giả: Claude (quản lý + giám đốc mĩ thuật), 2026-11-15. Đây là thiết kế; phần code giao cho Codex trong `CODEX_05`.

## 1. Bốn trục của một vũ khí

| Trục | Trường dữ liệu | Ý nghĩa |
|---|---|---|
| **Độ thông minh cần** | `req.brain` (0–100, dùng chỉ số `brain`/Trí khôn có sẵn) | Dưới ngưỡng: **không trang bị** nếu `strict:true` (súng, nỏ liên châu, thánh thư); ngược lại vẫn dùng được nhưng bị phạt *vụng* |
| **Khả năng dùng** (thông thạo) | `family` + bảng `PROFICIENCY[class][family]` = 0..3 | 0 không dùng được · 1 vụng (−30% sát thương, −20% tốc đánh, súng/bom có tỉ lệ hỏng) · 2 thạo · 3 bậc thầy (+10% và mở kỹ thuật) |
| **Kỹ thuật dùng** | `technique` (id skill có sẵn trong catalog, hoặc handler chung) | Chỉ dùng khi thông thạo ≥ 2 **và** `brain ≥ req.technique`. AI Utility chấm điểm kỹ thuật như skill thường (mana/cooldown/LOS) |
| **Độ hợp class** | `PROFICIENCY` + `affinity` | Hợp class thì AI ưu tiên nhặt/giữ; trái class thì AI bỏ đồ, hoặc chỉ giữ để bán |

Quy tắc chung:
- `hands`: 1 hoặc 2. **Khiên** chiếm slot mới `offhand`; không dùng cùng vũ khí 2 tay.
- Điểm AI chọn vũ khí: `power × hệ số thông thạo (0/0.7/1/1.1) × (đủ brain ? 1 : 0.6) + bonus kỹ thuật`. Chỉ đổi khi lợi hơn 15% (hysteresis, chống đổi liên tục).
- Quái có `brain` thấp (zombie 16, slime) không được cấp súng/nỏ liên châu/thánh thư; UI báo "Không đủ trí khôn".
- Súng: phát rất ồn. Âm thanh lan theo `hearing` có sẵn, đánh thức kẻ thù trong 18 ô. Sau mỗi phát phải **nạp đạn** (channel; sát thương làm ngắt). Ai *vụng* thì bị **kẹt đạn** với xác suất seeded qua `Game.random()`.
- Bom: consumable có `charges`, nổ dùng API thùng nổ có sẵn (friendly fire, chain 1 lần). `brain < 35` thì có 25% ném lệch 1–2 ô.

## 2. Họ vũ khí (family) và kỹ thuật

| family | Kỹ thuật (khi thạo) | Ghi chú |
|---|---|---|
| `blade` (kiếm) | Phản đòn: đỡ 1 đòn cận chiến trong 0,4 s | |
| `katana` | Rút đao chém: đòn đầu tiên ×1,5 khi ra khỏi ẩn thân hoặc mới vào phòng | Riêng ninja/samurai |
| `axe` | Bổ giáp: armorPierce +0,15 trong 3 s | |
| `blunt` (chùy, búa) | Choáng 0,4 s | |
| `polearm` (giáo, kích, đinh ba) | Giữ khoảng cách: đẩy lùi 1 ô (không xuyên tường/vực) | Đánh từ hàng hai |
| `bow` | Ngắm: đứng yên 1 s thì phát kế tiếp chí mạng | |
| `crossbow` | Bắn xuyên 2 mục tiêu trên một đường thẳng | Nạp chậm |
| `gun` | Bắn chính xác (đứng yên) / Bắn tán (blunderbuss: hình nón 3 ô) | req.brain cao |
| `thrown` (phi tiêu, kunai, chakram) | Ném liên hoàn 3 phát | Hồi lại sau trận |
| `bomb` | Ném vòng cung qua đầu đồng đội | |
| `shield` | Giơ khiên: chặn đạn từ phía trước, che đồng đội phía sau | offhand |
| `staff` / `wand` | Phép theo trượng (fire/frost/curse) | Cần mana |
| `holy` (thánh thư, trượng thánh) | Ban phước: hồi hoặc khiên nhỏ cho đồng minh trong 3 ô; **không hồi Forsaken** | |
| `exotic` (roi, quạt chiến, côn nhị khúc, lưỡi liềm) | Roi kéo mục tiêu 1 ô / quạt thổi lùi / côn đánh nhanh 2 hit | req.brain trung bình |

## 3. Danh sách vũ khí

**Đã có trong game:** W01–W12 (cung, đoản cung, rìu ném, dao phi, 2 trượng, song rìu, katana, chùy gai, giáo, kiếm răng cưa, búa). CODEX_02 thêm W13–W22, CODEX_04 thêm W23–W30. Các món cũ cần gán `family/req/technique` theo bảng mục 2.

**Mới trong đợt này: W31–W53.** Sprite ở `dist/assets/frames/yd/weapons/`.
| ID | Tên | sprite | family | hands | req.brain | req.technique | Hợp class |
|---|---|---|---|---|---|---|---|
| W31 | Cung Ma Thuật | weapon_magic_bow | bow | 2 | 55 | 65 | cung thủ ma thuật |
| W32 | Khiên Tròn | weapon_shield_round | shield | off | 10 | 30 | hiệp sĩ, cuồng chiến binh |
| W33 | Khiên Tháp | weapon_shield_tower | shield | off | 20 | 40 | thánh kỵ sĩ, hiệp sĩ |
| W34 | Kích | weapon_halberd | polearm | 2 | 30 | 50 | hiệp sĩ |
| W35 | Bom Đen | bomb_f0 (0x72) | bomb | 1 | 25 | 45 | nỏ thủ, đạo tặc |
| W36 | Bom Lửa | weapon_fire_bomb | bomb | 1 | 35 | 55 | pháp sư lửa, nỏ thủ |
| W37 | Phi Tiêu Sao | weapon_shuriken | thrown | 1 | 40 | 60 | ninja |
| W38 | Kunai | weapon_kunai | thrown | 1 | 35 | 55 | ninja, sát thủ |
| W39 | Súng Hỏa Mai Ngắn | weapon_pistol | gun | 1 | 50 | 65 | nỏ thủ |
| W40 | Súng Trường Hỏa Mai | weapon_musket | gun | 2 | 60 | 75 | nỏ thủ |
| W41 | Súng Loa Kèn | weapon_blunderbuss | gun | 2 | 45 | 60 | cuồng chiến binh (vụng), nỏ thủ |
| W42 | Đại Pháo Tay | weapon_hand_cannon | gun | 2 | 55 | 70 | người lùn |
| W43 | Đại Kiếm | weapon_greatsword | blade | 2 | 20 | 40 | cuồng chiến binh, hiệp sĩ |
| W44 | Kiếm Liễu | weapon_rapier | blade | 1 | 45 | 60 | sát thủ, hiệp sĩ |
| W45 | Lưỡi Liềm | weapon_kama | exotic | 1 | 35 | 55 | ninja |
| W46 | Vòng Phi | weapon_chakram | thrown | 1 | 50 | 65 | cung thủ ma thuật, ninja |
| W47 | Roi Da | weapon_whip | exotic | 1 | 40 | 60 | đạo tặc |
| W48 | Thánh Thư | weapon_holy_tome | holy | 1 | 60 | 70 | nữ tư tế, nữ tu (**strict**) |
| W49 | Trượng Thánh | weapon_holy_staff | holy | 2 | 45 | 60 | nữ tư tế, thánh kỵ sĩ |
| W50 | Quạt Chiến | weapon_war_fan | exotic | 1 | 55 | 70 | ninja, nữ tu |
| W51 | Côn Nhị Khúc | weapon_nunchaku | exotic | 1 | 45 | 65 | nữ tu, ninja |
| W52 | Nỏ Liên Châu | weapon_repeating_crossbow | crossbow | 2 | 55 | 70 | nỏ thủ (**strict**) |
| W53 | Chùy Thánh | weapon_holy_mace | blunt | 1 | 25 | 45 | thánh kỵ sĩ, nữ tu |

Katana, giáo, rìu và cung đã có sẵn (W08, W10, W03/W07/W16/W17, W01/W02). Đợt này bổ sung bản kích, magic bow và bộ ném để mỗi họ vũ khí đều có lựa chọn.

## 4. Class mạo hiểm giả

Thang thông thạo: 0 không dùng · 1 vụng · 2 thạo · 3 bậc thầy. Các họ vũ khí không ghi trong bảng = 1.
| class (species id) | Sprite | Brain nền | Thạo (2) | Bậc thầy (3) | Không dùng (0) | Vai trò AI |
|---|---|---|---|---|---|---|
| Ninja `ninja` | yd/chars/ninja | 70 | blade, exotic | katana, thrown | gun, holy, shield | Ẩn thân, đánh người yếu, rút lui sớm |
| Thánh kỵ sĩ `paladin` | yd/chars/paladin | 55 | blade, blunt | shield, holy | gun, thrown | Tank và hồi máu; đứng chắn trước healer |
| Nữ tư tế `priestess` | yd/chars/priestess | 75 | staff | holy | blade, axe, gun, bomb | Hồi máu, hồi sinh nhanh, giữ hàng sau |
| Nữ tu `nun` | yd/chars/nun | 60 | holy, blunt | exotic (côn, quạt) | gun, bomb | Võ tăng: cận chiến bằng tay hoặc côn, kháng `panic` |
| Cuồng chiến binh `berserker` | yd/chars/berserker | 30 | blade, shield | axe, blunt | bow, crossbow, holy, staff | Lao vào giữa, không rút lui khi HP thấp |
| Hiệp sĩ `knight` (đã có) | knight_m (0x72) | 50 | polearm, blunt | blade, shield | gun | Giữ cửa; giữ id cũ, chỉ thêm bảng thông thạo |
| Cung thủ ma thuật `arcaneArcher` | yd/chars/arcane_archer | 72 | thrown, staff | bow | blunt, axe, shield | Kite tầm xa, đạn phép (fx_frost/fx_curse) |
| Nỏ thủ `crossbowman` | yd/chars/crossbowman | 62 | gun, bomb | crossbow | holy, staff | Đứng sau khiên đồng đội, bắn xuyên |

- Mỗi class nhận 4 skill và 2 passive **từ catalog có sẵn**, đúng mẫu `KITS`. Không tạo hệ thống skill mới.
- Có thể tái dùng sprite đã làm: assassin, dark_knight, frost_mage, pyromancer (CODEX_04).

## 5. Animation tấn công (bổ sung cho mọi sprite)
- Mọi sprite có gameplay đều có thêm `*_attack_anim_f0..3` (giám đốc mĩ thuật đã làm, nằm ở `dist/assets/frames/yd/attack/<tên-gốc>_attack_anim_fN.png`):
  - **melee:** f0 lấy đà (lùi 1 px, nén) → f1 lao tới 2 px → f2 giữ → f3 về.
  - **cast:** nhún lên kèm tia sáng trên đầu.
  - **shoot:** giật lùi 1 px ở f1.
- Renderer: khi entity phát đòn (thời điểm damage được giải quyết hiện nay), chạy attack anim 0,3 s (4 frame × 75 ms). Vũ khí vẽ theo pose: melee vung từ −60° đến +60°, súng/nỏ giữ ngang, bom bay theo vòng cung. Hướng trái thì mirror như cũ.
- Animation chỉ là hình ảnh: không đổi thời điểm sát thương, không tiêu thụ RNG gameplay.

## 6. Chủng loài quái mới
Xem `art/showcase/SHOWCASE-v05.png` khi đã giao. Mỗi loài cần: KITS, FAVORITES phòng, contract card, quota `slots`, attack anim.
