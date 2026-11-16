# DESIGN_06 — Tầng Chủ (chọn 1 trong 3 boss), họ Xương, Kẻ Chiêu Hồn, ba mạo hiểm giả mới

**Người viết:** Claude (quản lý + giám đốc mĩ thuật). **Ngày:** 2026-11-16. **Brief code:** `docs/briefs/CODEX_06_tang-chu-va-xuong.md`.

## 0. Hiện trạng (đã đọc code)
- Có 2 boss cứng: `warden` (Golem Hộ Môn, phòng `boss` tầng 0, sprite `ogre`) và `inferno` (Chúa Tể, phòng `treasure` tầng 1, thuê qua `hire('lord')`).
- `simulation.js bossTick`: 3 giai đoạn theo % HP (60%/30%), mỗi lần hồi chiêu thì phóng **một** chiêu telegraph `line|circle`; giai đoạn 2 gọi 2 vệ binh.
- Thiếu: lựa chọn boss, buff tầng, nhiều chiêu, lối đánh khác nhau, model riêng. Đợt này lấp cả 4.

## 1. Tầng Chủ: luật chọn
- **Khi nào chọn:**
  - Lần đầu đặt phòng `boss` ở tầng 0 (đầu game).
  - Lần đầu đặt phòng `treasure` ở tầng 1 (lên tầng mới).
  - Tầng thêm sau này dùng cùng luật: phòng chủ của tầng.
- **Cách rút:** rút 3 ứng viên khác nhau từ `BOSS_POOL` bằng `Game.random()`, nên seed giống nhau thì 3 ứng viên giống nhau.
  - Mỗi ứng viên chỉ xuất hiện ở tầng mà nó cho phép (`floors`).
  - Một boss đã chọn ở tầng khác không được rút lại.
- **Màn chọn:** 3 thẻ boss. Mỗi thẻ có:
  - chân dung (frame idle_f0 phóng to);
  - tên, lối đánh, 4 chiêu và giá thuê;
  - **Ấn Tầng** (buff), kèm số lượng.
- **Đổi bộ bài:** 1 lần mỗi tầng, giá 50 vàng, rút 3 boss mới.
  - Không được bỏ chọn: tầng nào cũng phải có Tầng Chủ.
  - Phase chuẩn bị không thể bắt đầu wave khi còn thẻ chưa chọn.
- **Ấn Tầng:**
  - Áp cho mọi phòng, quái, bẫy có `floorId` = tầng của boss.
  - Còn hiệu lực khi boss còn `active`. Boss gục thì Ấn tắt, log "Ấn Tầng vỡ".
  - Boss mạnh hơn ban ít Ấn hơn (1–3).
- **Save:** lưu `floorBoss[floorId] = {species, offered:[3 id], rerolled:bool}`. Save cũ thiếu field thì tự gán boss cũ (`warden` tầng 0, `inferno` tầng 1) và không bật màn chọn.

## 2. BOSS_POOL (8 boss, mỗi con model riêng)
| id | Tên | Model | Tầng | Lối đánh (`style`) | Ấn Tầng |
|---|---|---|---|---|---|
| warden | **Titan** (trước là Golem Hộ Môn) | `ogre` của 0x72, giữ nguyên (32×36) | 0,1 | **juggernaut**: tiến thẳng, ăn đòn, chặn cửa | 1: công trình và quái tầng +15% HP |
| inferno | **Ác Ma** (trước là Chúa Tể/Dungeon Lord) | `big_demon` của 0x72, giữ nguyên (32×36) | 1 | **zoner**: giữ giữa phòng, rải vùng lửa | 2: bẫy tầng gây burn; quái tầng giảm 50% thời gian burn |
| necro_lord | **Kẻ Chiêu Hồn** | `yd/monsters/necro_lord` | 0,1 | **summoner**: giữ khoảng cách 6 ô, gọi xương, dịch chuyển khi bị áp sát | 2: quái họ Xương hồi sinh 1 lần (50% HP, sau 8 s); hero gục trên tầng cho soul ×1,5 |
| spider_queen | Nữ Hoàng Nhện | `yd/monsters/spider_queen` | 0,1 | **ambusher**: nấp (không lộ trong fog) tới khi hero vào phòng, rồi vồ hàng sau | 2: hero qua cửa phòng lần đầu bị tơ làm chậm 30% trong 3 s; quái loài nhện +20% tốc độ |
| frost_witch | Phù Thủy Băng Giá | `yd/monsters/frost_witch` | 0,1 | **controller**: giữ 5 ô, khống chế, bảo vệ đồng minh | 3: hero trên tầng −10% tốc độ; mỗi quái có khiên băng 15 HP đầu trận; bẫy tầng làm chậm thêm 1 s |
| orc_warlord | Đại Tướng Orc | `yd/monsters/orc_warlord` | 0,1 | **commander**: ở tuyến đầu, buff hào quang, thách đấu hero mạnh nhất | 1: quái tầng +10% sát thương, và orc/goblin không bỏ chạy (morale khóa) |
| death_knight | Hắc Kỵ Sĩ Tử Thần | `yd/monsters/death_knight` | 1 | **duelist**: khóa một hero, kết liễu kẻ yếu | 1: quái tầng hút máu 10% sát thương gây ra |
| bone_king | Vua Xương | `yd/monsters/bone_king` | 0,1 | **warlord-summoner**: đứng sau đội quân xương, ra lệnh | 2: thuê quái họ Xương trên tầng −25% giá; quái họ Xương +3 giáp |

Hai boss cũ giữ nguyên hình theo yêu cầu của người dùng: Titan là `ogre`, Ác Ma là `big_demon`. Hai sprite này chỉ boss dùng, nên vẫn là model riêng. Chỉ đổi tên hiển thị; id `warden`/`inferno` giữ nguyên để không vỡ save.

## 3. Chiêu boss (mỗi boss 4 chiêu, mở dần theo giai đoạn)
Dữ liệu chung: `{id, name, kind, phase, cd, windup, radius|width|range, damage, effect}`.
- `kind ∈ circle | line | cone | summon | blink | leap | beam | aura | taunt`.
- Chiêu sát thương **luôn** có telegraph (`s.telegraphs`) để giữ cảm giác né được như hiện tại.
- `phase` = giai đoạn tối thiểu để chiêu được dùng (0 / 1 / 2).

| Boss | Chiêu 1 (gđ 0) | Chiêu 2 (gđ 0) | Chiêu 3 (gđ 1) | Chiêu 4 (gđ 2) |
|---|---|---|---|---|
| Titan | Đập Đất: circle r4, 32 sát thương | Quét Ngang: line w1.5, 28 | Ném Tảng: circle r2.5, đúng vị trí hero xa nhất | Thân Đá: tự giảm 40% sát thương nhận vào trong 4 s |
| Ác Ma | Mưa Lửa: 3 circle r2 rải quanh mục tiêu, burn | Vòng Lửa: circle r3.5 quanh mình, 28 | Triệu Imp: summon 2 `imp` | Bùng Nổ: circle r6, windup 1.8 s, 45 |
| **Kẻ Chiêu Hồn** | Triệu Hồi Xương: summon 2 quái họ Xương (ưu tiên vị trí hero/quái gục) | Hút Hồn: beam 6 ô, 3 s, 8/s, hồi 100% lượng hút | Lời Nguyền Suy Nhược: circle r3, curse (−25% sát thương 6 s) | Đại Lễ Chiêu Hồn: hồi sinh **mọi** quái họ Xương gục trên tầng với 50% HP, 1 lần mỗi trận |
| Nữ Hoàng Nhện | Phun Tơ: cone 60°/5 ô, chậm 40% 3 s | Nanh Độc: melee, poison mạnh | Đẻ Trứng: đặt 2 trứng (prop có HP 20), sau 4 s nở `spider` | Vồ Mồi: leap tới hero có HP thấp nhất trong 8 ô, circle r1.5, 30 |
| Phù Thủy Băng Giá | Mũi Băng: 3 projectile xòe 20° | Băng Trụ: line w1, root 1.5 s | Bão Tuyết: vùng r3 tồn tại 5 s, chậm 50%, 5/s | Giáp Băng: khiên 40 HP cho đồng minh yếu nhất trong phòng |
| Đại Tướng Orc | Rìu Xoáy: circle r2.5 quanh mình, 30 | Xung Phong: line 7 ô, đẩy lùi (không xuyên tường) | Hiệu Lệnh: aura phòng, đồng minh +20% sát thương 8 s | Thách Đấu: taunt hero DPS cao nhất 4 s, boss nhận −30% sát thương từ hero khác |
| Hắc Kỵ Sĩ Tử Thần | Chém Rune: cone 90°/3 ô, 30, chậm 30% 2 s | Xung Kích Bóng Tối: line 6 ô, lướt qua, 26 | Lá Chắn Tử Thần: khiên 60 HP 6 s | Hành Quyết: leap tới hero < 35% HP trong 8 ô, windup 1,2 s, 60 |
| Vua Xương | Gậy Triệu Tập: summon 2 (skeleton_guard + skeleton_archer) | Mệnh Lệnh Hoàng Gia: aura, quái họ Xương trong phòng +25% tốc độ và sát thương 6 s | Ngai Xương: summon 1 `bone_giant` (1 lần/trận) | Phán Quyết: circle r5, windup 1,6 s, 40, curse |

Kẻ Chiêu Hồn và Vua Xương đều gọi xương nhưng khác lối chơi. Kẻ Chiêu Hồn **hồi sinh và hút máu**, đứng xa, trốn. Vua Xương **ra lệnh cho đội quân**, buff đội hình và có đòn chốt diện rộng.

**AI boss (thay cho chọn chiêu cứng):**
- Mỗi lần hồi chiêu chung (gđ 0: 8,5 s; gđ 1: 7 s; gđ 2: 5,5 s, như cũ), boss chấm điểm các chiêu đủ điều kiện:
  - `điểm = giá trị (số hero trúng × sát thương, hoặc giá trị tiện ích) + bonus style − 0,1 × (lần dùng gần nhất)`;
  - hòa điểm thì chọn bằng `Game.random()`.
- Style quyết định vị trí đứng:
  - juggernaut: tiến tới hero gần nhất;
  - zoner: giữ tâm phòng;
  - summoner và controller: lùi giữ khoảng cách 6 hoặc 5 ô, không ra khỏi phòng;
  - ambusher: đứng yên ẩn cho tới khi có hero trong phòng;
  - commander: tiến tới hero, nhưng ở trong tầm hào quang của quái;
  - duelist: bám hero đang bị taunt hoặc có HP thấp nhất;
  - warlord-summoner: đứng sau quái của mình 3 ô.
- Boss **không bao giờ rời phòng của mình** (room confinement giữ nguyên).

## 4. Họ Xương (`family: 'bone'`, `undead: true`)
Mọi con đều miễn poison/bleed, sợ holy (×1,5) và ăn Ấn của Kẻ Chiêu Hồn.

| id | Tên | Model | Cỡ/slots | brain | Vai trò | Gợi ý cơ chế | Phòng |
|---|---|---|---|---|---|---|---|
| skeleton_archer | Cung Thủ Xương | `yd/monsters/skeleton_archer` | nhỏ/1 | 30 | ranged | Cung W-bow, đứng sau tank | grave, guard |
| skeleton_mage | Pháp Sư Xương | `yd/monsters/skeleton_mage` | nhỏ/1 | 55 | support | Phép băng (chậm), curse nhẹ | grave, darkaltar |
| skeleton_guard | Vệ Binh Xương | `yd/monsters/skeleton_guard` | nhỏ/1 | 25 | tank | Khiên tròn, chặn đạn phía trước | guard, barracks |
| skeleton_knight | Kỵ Sĩ Xương | `yd/monsters/skeleton_knight` | nhỏ/2 | 40 | tank | Giáp cao, kiếm 2 tay, elite | guard, boss |
| ember_skeleton | Xương Lửa | `yd/monsters/ember_skeleton` | nhỏ/1 | 15 | skirmisher | Chạy vào hero, chết thì nổ (API thùng nổ, burn, friendly fire) | forge |
| bone_hound | Chó Săn Xương | `yd/monsters/bone_hound` | nhỏ/1 | 20 | skirmisher | Nhanh, bầy đàn, cắn chảy máu | grave |
| bone_giant | Khổng Lồ Xương | `yd/monsters/bone_giant` | lớn/3 | 15 | tank | Đập đất; chết thì vỡ ra 2 `skeleton` | grave, boss |

## 5. Ba mạo hiểm giả mới (mỗi class model riêng, kitbash giữ animation 0x72)
| id | Tên | Model | Thông thạo 3 | Thông thạo 2 | Bạn đồng hành | Cá tính AI |
|---|---|---|---|---|---|---|
| beastmaster | Thuần Thú Sư | `yd/chars/beastmaster` (dwarf + mũ đầu sói) | whip | spear, axe | **Sói** `yd/monsters/wolf_pet`: entity hero riêng, HP 60, theo chủ ≤3 ô; chủ gục thì sói canh xác chủ | Ra lệnh sói vồ mục tiêu mình đang đánh; rút lui khi sói chết |
| druid | Druid | `yd/chars/druid` (elf_f, gạc hươu) | staff, sickle | — | **Dạng Gấu** `yd/monsters/druid_bear`: biến hình 10 s (HP ×1,6, cận chiến, không dùng phép), hồi 25 s | Đứng giữa đội; hồi máu theo thời gian, rễ cây trói (root 2 s); sợ phòng lửa |
| hunter | Thợ Săn | `yd/chars/hunter` (elf_m, mũ lông chim) | bow, crossbow | dagger, thrown | **Chim Ưng** `yd/monsters/hawk`: bay, không đánh; trinh sát lộ ambush/bẫy/gargoyle/Nữ Hoàng Nhện trong 6 ô | Đánh dấu con mồi (+20% sát thương cả đội vào mục tiêu), đặt bẫy trói cho đội |

Bạn đồng hành là entity phe hero (`ownerId`). Nó không chiếm slot đoàn, không nhặt đồ, không mang kho báu, và gục cùng lúc với chủ hoặc khi hết HP.
- Ẩn trong fog như hero thường.
- Không tính là "hero sống sót" khi tính thắng/thua.

## 6. Art (đã vẽ xong, xem `art/showcase/SHOWCASE-v06.png`)
- Boss khoảng 40 px của Gemini được lấy mẫu kiểu mode từ lưới khoảng 5 px. Sau đó nâng vùng đen trong thân lên tông đọc được, sửa màu lệch và vẽ lại viền #222 (`art/tools/finish_bosses.py`).
- Họ Xương và 3 class: kitbash 0x72 (`art/tools/kitbash_v06.py`), giữ nguyên animation gốc.
- Animation:
  - mọi model mới có idle/run 4 frame và attack 4 frame (`yd/attack/<id>_attack_anim_f0..3`);
  - boss có thêm frame `cast` khi đang windup (dùng `attack` loại cast);
  - chim ưng và Kẻ Chiêu Hồn lơ lửng.
