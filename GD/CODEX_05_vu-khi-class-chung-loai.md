# CODEX_05 — Hệ vũ khí có yêu cầu, 8 class mạo hiểm giả, 16 chủng loài và animation tấn công

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex.
**Đọc trước:** `GD/DESIGN_05_vu-khi-va-class.md`. Đó là thiết kế đầy đủ: bảng W31–W53, bảng thông thạo, kỹ thuật.
**Thứ tự:** sau CODEX_01 và CODEX_04 (CODEX_04 thêm `fxSprite` và nhân vật v0.4). Nên tách 4 commit theo mục A–D.

## Asset đã giao
Tất cả nằm trong `dist/assets/frames/yd/`, nạp bằng `painter.image(name)` như cũ. Ảnh tổng hợp: `art/SHOWCASE-v05.png`.
- `yd/weapons/weapon_<id>.png`: 30 vũ khí (8 của v0.4 và 22 mới).
- `yd/chars/<id>_{idle,run}_anim_f0..3` (+`hit_anim_f0`): ninja, priestess, nun, arcane_archer, crossbowman, knight_errant, cùng 8 nhân vật v0.4.
- `yd/monsters/<id>_{idle,run}_anim_f0..3`: 24 loài (8 của v0.4 và 16 mới). Loài lớn khoảng 30×32: werewolf, gnoll, minotaur, troll, treant, gargoyle.
- `yd/attack/<tên>_attack_anim_f0..3`: **67 bộ tấn công**. Có cho mọi sprite 0x72 đang dùng (knight_m, goblin, big_demon…) và mọi sprite yd. `<tên>` là tên frame gốc không có hậu tố, ví dụ `knight_m`, `goblin`, `ninja`, `minotaur`.

## A. Hệ vũ khí: req / thông thạo / kỹ thuật / hợp class
1. Mở rộng item vũ khí với các trường `family`, `hands`, `req:{brain,technique}`, `strict`, `technique` theo DESIGN_05 mục 1–2. Gán các trường này cho **cả** W01–W30 đã có.
2. Tạo bảng `PROFICIENCY[species][family]` (0–3). Mặc định 1. Quái dùng bảng theo `role` (tank/skirmisher/ranged/support) cộng ngoại lệ.
3. `canEquip(e,item)`: thông thạo 0 thì không trang bị được; `strict` mà `brain < req.brain` thì không trang bị được. UI hiện lý do bằng tiếng Việt.
4. `weaponFactor(e,item)` = hệ số thông thạo × phạt thiếu brain. Áp vào damage và tốc đánh **ở đúng một chỗ** trong chuỗi wrapper `damage`/`act` (đọc toàn chuỗi wrapper trước khi sửa, xem CODEX.md).
5. Kỹ thuật = một skill trong catalog, hoặc handler chung mới **chỉ khi** không skill nào tương đương. Chỉ được chọn khi thông thạo ≥ 2 và `brain ≥ req.technique`. Utility AI chấm điểm như skill thường.
6. Slot `offhand` cho khiên: lưu vào save (giữ save cũ: thiếu field thì bằng null). Khiên chặn đạn phía trước dựa vào hướng nhìn hiện có; không dùng cùng vũ khí `hands:2`.
7. **Súng:**
   - Mỗi phát kèm channel nạp đạn (sát thương làm ngắt).
   - Phát âm thanh qua `hearing`.
   - Người dùng vụng bị kẹt đạn với xác suất qua `Game.random()`.
   - Đạn là projectile `'bullet'`, giải quyết như đòn tầm xa hiện có (có LOS).
8. **Bom:** consumable có `charges`, nổ bằng API thùng nổ (friendly fire, chain 1 lần). `brain < 35` ném lệch theo seed.
9. AI đổi vũ khí theo điểm ở DESIGN_05, có hysteresis 15%. Nhặt đồ trái class thì để trong túi, không trang bị.

## B. Tám class mạo hiểm giả
Theo bảng DESIGN_05 mục 4: `ninja`, `paladin`, `priestess`, `nun`, `berserker`, `knight` (đã có, chỉ thêm thông thạo; tùy chọn dùng sprite `yd/chars/knight_errant` cho elite), `arcaneArcher`, `crossbowman`.
- Thêm vào pool đoàn chính và viện binh, có trọng số. Class mạnh xuất hiện từ wave 2–3.
- Mỗi class có kit 4 skill và 2 passive từ catalog, Charm mặc định, vũ khí khởi đầu hợp class (ví dụ ninja: W37+W08, nỏ thủ: W52 hoặc W39, nữ tư tế: W49).
- Cá tính AI: ninja rút lui sớm và tấn công người yếu; berserker không rút lui; priestess giữ hàng sau; crossbowman tìm khiên đồng đội để đứng sau.

## C. Mười sáu chủng loài mới
| id | sprite | Cỡ / slots | Gợi ý | Phòng hợp |
|---|---|---|---|---|
| werewolf | yd/monsters/werewolf | lớn / 2 | Nhanh, chảy máu, mạnh hơn khi đồng đội gục | barracks, grave |
| harpy | yd/monsters/harpy | nhỏ / 1, "bay" (chỉ hình ảnh) | Tầm gần, cướp đồ nhẹ khỏi túi hero (dùng `transfer`) | spyroom |
| kobold | yd/monsters/kobold | nhỏ / 1 | Rẻ, đặt bẫy nhanh; dùng giáo | forge, trap |
| gnoll | yd/monsters/gnoll | lớn / 2 | Bầy đàn: +sát thương khi ≥2 gnoll cùng phòng | barracks |
| minotaur | yd/monsters/minotaur | lớn / 3 | Húc (đẩy lùi, không xuyên tường), giữ cửa | boss, guard |
| wraith | yd/monsters/wraith | nhỏ / 1, bay | Ẩn thân, gây `panic` | grave, darkaltar |
| lich | yd/monsters/lich | nhỏ / 2 | Phép curse, hồi sinh skeleton theo cơ chế grave | darkaltar, boss |
| troll | yd/monsters/troll | lớn / 3 | Hồi máu (regen) trừ khi bị burn | barracks |
| treant | yd/monsters/treant | lớn / 3 | Tank chậm, sợ lửa (burn ×1,5), làm chậm | garden/poisonpool |
| salamander | yd/monsters/salamander | nhỏ / 1 | Đòn burn, miễn burn | forge |
| giant_rat | yd/monsters/giant_rat | nhỏ / 1 | Rất rẻ, bầy đông, poison nhẹ | grave, sewer |
| scorpion | yd/monsters/scorpion | nhỏ / 1 | Đòn poison mạnh, chậm | poisonpool |
| gargoyle | yd/monsters/gargoyle | lớn / 2 | Giả tượng: đứng yên thì không bị phát hiện (dùng cơ chế ambush/Mimic) | guard, boss |
| cultist | yd/monsters/cultist | nhỏ / 1 | Hỗ trợ: buff mana/curse | darkaltar |
| naga | yd/monsters/naga | nhỏ / 2 | Tầm vừa, làm chậm | mana, poisonpool |
| living_armor | yd/monsters/living_armor | nhỏ / 2 | Giáp cao, miễn poison/bleed | stonevault, guard |

Mỗi loài cần KITS, FAVORITES, contract card, giá thuê, `brain` (theo bảng trên: kobold 40, lich 85, troll 25…), và bảng thông thạo theo role. Phòng chưa tồn tại (garden, sewer) thì bỏ khỏi FAVORITES, **không** tạo phòng mới.

## D. Animation tấn công cho mọi sprite
- Renderer: khi entity phát đòn, tại thời điểm damage đang được giải quyết, chạy `yd/attack/<base>_attack_anim_f{0..3}` trong 0,3 s. `<base>` lấy từ tên sprite: 0x72 dùng chính tên (`knight_m`), yd dùng phần sau dấu `/` cuối cùng (`yd/chars/ninja` → `ninja`).
- Ba loại (giám đốc mĩ thuật đã vẽ đúng loại cho từng sprite): melee lao tới, cast có tia sáng, shoot giật lùi.
- Vũ khí vẽ theo pose:
  - Melee: góc vung từ −60° đến +60° qua 4 frame.
  - Súng và nỏ: giữ ngang, giật 1 px.
  - Ném (thrown, bom): tay đưa ra ở f1, đạn rời tay ở f2.
- Không có file attack thì dùng idle (không crash). Không đổi timing gameplay; animation không dùng RNG gameplay.
- Mimic (chest_mimic) giữ hoạt ảnh mở rương cũ.

## Tiêu chí nghiệm thu
- [ ] `npm test` xanh. Test mới tối thiểu:
  - `canEquip` đúng cho mỗi trường hợp (thông thạo 0, strict thiếu brain, đủ điều kiện).
  - `weaponFactor` đúng 0.7/1/1.1.
  - Khiên không đi cùng vũ khí 2 tay.
  - Súng kẹt đạn deterministic theo seed.
  - Bom friendly fire.
  - Mỗi class mới spawn được, có kit.
  - 16 loài thuê được, đúng quota.
  - Mọi sprite được tham chiếu đều có đủ idle/run/attack.
- [ ] Save v1/v2 cũ load được. Save mới lưu `offhand`.
- [ ] Soak seed 1–50: không phát sinh lỗi kẹt mới; tỉ lệ thắng thay đổi ít hơn ±15% (vượt thì ghi lý do). Liệt kê thêm: tỉ lệ dùng kỹ thuật và tỉ lệ kẹt súng.
- [ ] Ảnh chụp `screenshots/v05-*.jpg`:
  - (1) đoàn có ninja, priestess, crossbowman đang đánh;
  - (2) minotaur và troll trong phòng;
  - (3) inspector hiện "Không đủ trí khôn" khi cấp súng cho zombie;
  - (4) cận cảnh attack frame.
- [ ] Cập nhật `CODEX.md` (bất biến mới: vũ khí đổi sát thương ở **một** chỗ; offhand) và README. **Không** sửa file trong `frames/yd`; thiếu hình thì báo giám đốc mĩ thuật.
