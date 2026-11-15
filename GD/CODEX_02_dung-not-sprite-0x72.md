# CODEX_02 — Đưa các sprite 0x72 còn bỏ không vào game

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex. **Làm sau:** CODEX_01.

## Bối cảnh
Cả 370 frame 0x72 đã được chép vào `dist/assets/frames/`, nhưng code chưa dùng nhiều frame trong số đó. Đây là hình CC0 cùng bộ, đồng nhất 100% với game, nên phải dùng hết chúng trước khi vẽ thêm bằng AI. Tờ tham chiếu ở `art/reference/sheet_heroes.png` và `sheet_weapons.png`.

API có sẵn: bảng `weapons` trong `dist/arsenal-data.js` (mẫu W01–W12), `NEW_MONSTERS` (mẫu 10 quái), `SPECIES` và `KITS`, `CARDS`, `PACKS.armory`. Đội hero chọn loài trong `simulation.js` qua `types=['knight','rogue','mage','priest']`, và `archer` được thêm sau đó.

## Nhiệm vụ

### A. 10 vũ khí mới, W13–W22
Thêm vào `arsenal-data.js` theo đúng cấu trúc mảng `weapons`. Mỗi vũ khí phải có một vai trò riêng, không được chỉ là bản đổi số của vũ khí cũ:

| ID | Tên | Frame | Vai trò đề xuất (Codex cân chỉnh nhỏ được) |
|---|---|---|---|
| W13 | Kiếm Gỉ | `weapon_rusty_sword` | Rẻ, hàng cấp thấp: power −0.1, `hitEffect:'weaken'` nếu status đó đã có |
| W14 | Kiếm Thường | `weapon_regular_sword` | Chuẩn mốc: không mod, reach 1.5 |
| W15 | Song Kiếm | `weapon_duel_sword` | attackSpeed +0.3, power −0.15 |
| W16 | Rìu Tay | `weapon_axe` | power +0.15, armorPierce 0.1 |
| W17 | Đại Rìu Chiến | `weapon_waraxe` | reach 1.9, power +0.3, attackSpeed −0.25 |
| W18 | Chùy | `weapon_mace` | stun ngắn 0.4 s với xác suất seeded 15%, dùng status có sẵn |
| W19 | Dao Phay | `weapon_cleaver` | bleed như W11 nhưng ngắn hơn, attackSpeed +0.1 |
| W20 | Mã Tấu | `weapon_machete` | Thưởng sát thương khi mục tiêu đang chậm hoặc vướng (dùng status sẵn có) |
| W21 | Kiếm Hoa Lệ | `weapon_lavish_sword` | Hiếm: power +0.2, tăng vàng rơi qua `transfer` |
| W22 | Kiếm Thần Tốc | `weapon_anime_sword` | Hiếm: reach 2.2, attackSpeed +0.1 |

- W21 và W22 chỉ ra từ rương cấp IV–V hoặc `PACKS.armory` với tỉ lệ thấp. Không có trong bộ khởi đầu.
- Nếu một hiệu ứng cần status chưa tồn tại: **không** tạo hệ status mới. Chọn hiệu ứng khác có sẵn và ghi lại trong báo cáo.
- Renderer phải vẽ đúng frame vũ khí khi trang bị, giống cách đang vẽ W01–W12.

### B. Bốn loài hero mới
Thêm vào luồng chọn loài của đoàn chính và viện binh, có trọng số. Các loài mới xuất hiện từ wave 2:
| species | Sprite | Vai trò |
|---|---|---|
| `shieldmaiden` | `knight_f` | Tank bảo vệ người yếu, dùng logic bảo vệ đồng đội đã có |
| `dwarfMiner` | `dwarf_m` | Phát hiện và gỡ bẫy giỏi; có thể đào qua `wall_hole`… **chỉ** nếu có API, nếu không thì bỏ phần đào |
| `dwarfSmith` | `dwarf_f` | Sửa và nâng trang bị đồng đội khi nghỉ; ưu tiên cướp phòng `forge` |
| `angelHerald` | `angel` | Hỗ trợ hiếm (≤1 mỗi đoàn, từ wave 3): cứu nhanh hơn, không hồi được Forsaken |

Mỗi loài có `KITS` (4 skill và 2 passive lấy từ catalog sẵn có), Charm mặc định và vũ khí mặc định. Hit frame `*_hit_anim_f0` dùng khi bị đánh, nếu renderer đã hỗ trợ hit frame.

### C. Bốn quái mới (hợp đồng và thuê)
Thêm vào `NEW_MONSTERS` theo mẫu có sẵn:
| id | Sprite | Ý tưởng |
|---|---|---|
| `iceZombie` | `ice_zombie` | Chậm, đòn làm chậm; hợp phòng `grave` |
| `muddy` | `muddy` | Tank bùn, hấp thụ đòn, `slots:1` |
| `swampy` | `swampy` | Đòn độc (poison có sẵn), hợp `poisonpool` |
| `pumpkin` | `pumpkin_dude` | Quái hiếm sự kiện: nổ khi chết như thùng nổ (dùng API barrel), một lần |

Lưu ý: `ice_zombie`, `muddy`, `swampy` chỉ có `*_anim_f0..3` (không chia idle/run). Renderer phải dùng chuỗi đó cho cả idle lẫn run.

### D. Trang trí và HUD có sẵn
- `wall_goo` và `wall_goo_base`, `wall_hole_1/2`: đưa vào bộ nội thất seeded của `world.js` cho phòng `poisonpool`/`grave` (goo) và phòng đã bị phá (hole). Giữ bất biến 5: nội thất theo `layoutSeed`, không chặn trục cửa.
- `lever_left/right`, `button_*`: hiện ở cổng chìa (`keyGates`). Gạt hoặc nhấn khi mở cổng. Chỉ là hình ảnh.
- `ui_heart_full/half/empty`: thanh máu dạng tim cho cư dân đang chọn trong inspector, mỗi tim 20% HP. Chỉ đổi UI, không đổi logic.

## Tiêu chí nghiệm thu
- [ ] `npm test` xanh. Có test mới: mỗi W13–W22 tạo được item, trang bị được, `Game.range(e)` trả đúng reach.
- [ ] Test: 4 hero mới spawn được, có kit, không xuất hiện ở wave 1; `angelHerald` ≤ 1 mỗi đoàn.
- [ ] Test: 4 quái mới thuê được qua hợp đồng và đúng quota `slots`.
- [ ] Soak (CODEX_01) seed 1–50: không phát sinh lỗi kẹt mới.
- [ ] Script đếm sprite: frame trong `dist/assets/frames` mà không được code tham chiếu (kể cả qua template) chỉ còn những frame được liệt kê lý do trong `CODEX.md`.
- [ ] Ảnh chụp cận cảnh (zoom 3): 1 hero mới, 1 quái mới, 3 vũ khí mới đang cầm. Lưu vào `screenshots/v04-*.jpg`.
- [ ] Cập nhật `CODEX.md`, README (con số catalog) và `ASSET-LICENSES.md`: các frame mới vẫn là 0x72 CC0.

## Không làm
- Không vẽ hoặc tạo hình mới. Hình AI thuộc CODEX_03 và do giám đốc mĩ thuật cung cấp.
- Không tint quái mới thành "biến thể" để tăng số lượng.
