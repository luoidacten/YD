# CODEX — YOUR DUNGEON? v0.5

Đọc trước khi sửa code. Đây là prototype chạy hoàn toàn trong trình duyệt. `GDD.md` là thiết kế gốc; các bản thiết kế từ ChatGPT không phải bằng chứng mọi tương tác đã hoàn thiện.

## Chạy

Node.js 20+, không có dependency. `node server.mjs` phục vụ http://127.0.0.1:4173. Kiểm tra bằng `node scripts/build.mjs` và `node --run test`. Hosting phục vụ nguyên `dist`. Giữ project ID trong `.openai/hosting.json`, không tạo Site khác khi nâng cấp; credential không được vào repo.

## Kiến trúc đã có

| File | Trách nhiệm |
| --- | --- |
| `dist/app.js` | DOM/input/modal/save, accumulator 30 Hz; modal/tab ẩn dừng mô phỏng |
| `dist/simulation.js` | Game/state, RNG, A*, move, cửa, combat, kinh tế, chuyển tầng, kho báu |
| `dist/world.js` | Terrain, hình phòng, hành lang, seeded furnishings, giới hạn phòng |
| `dist/ai.js` | Perception/ký ức, Utility/hysteresis, cover/kite, reservation, khám phá |
| `dist/systems.js` | Skill/passive/status, Leader/scout/intel, công trình, thế giới, tiến hóa |
| `dist/content-systems.js` | Packs/Fates, gear/items, phẩm chất/biến thể, Charms, Mimic/spy/Oracle |
| `dist/catalog.js`, `catalog-data.js` | 50 định nghĩa nền + 8 địa hình = 58 kỹ năng, 58 nội tại khi nạp Game; kit/status nền |
| `dist/expansion.js`, `expansion-data.js` | Nền mở rộng; tổng hiện tại 22 phòng, 47 Charm, 40 effects, 45 items, 6 phẩm chất, 7 biến thể |
| `dist/lair.js`, `lair-data.js` | Run trống, xây nền móng, quota cư dân, khóa/chìa, kit địa hình |
| `dist/rescue.js` | Gục/chết, cứu hộ có tiến độ, thuốc hồi sinh, kéo, ký ức thi thể |
| `dist/terrain-tactics.js` | Chỉ huy/trí khôn, kỹ năng địa hình/bẫy, AI tìm chìa/mở cổng |
| `dist/room-life.js` | Rương dọn phòng, tuần tra/tản quân, trở về phòng, nhường hành lang |
| `dist/arsenal.js`, `arsenal-data.js` | 10 loài quái + cung thủ, 12 vũ khí, reach/projectile, gói vũ khí |
| `dist/v04.js`, `v04-data.js` | 10 weapon W13–W22, 4 hero có trọng số, 4 quái, sửa đồ/hiếm/sự kiện; cài cuối cùng |
| `dist/icons.js` | Manifest UI cùng origin, glyph/sprite fallback, khung bài 9-slice |
| `scripts/icon-assets.mjs`, `sprite-audit.mjs` | Kiểm PNG alpha/kích thước và kiểm kê 370 frame CC0 |
| `dist/painter.js` | Canvas/camera/LOD/fog/minimap/sprites/telegraph |
| `dist/audio.js` | 10 SFX CC0, rate limit và giới hạn số giọng |
| `dist/app.css`, `fantasy.css` | Bố cục và khung đá/đồng pixel fantasy |

`simulation.js` gọi `installSystems(Game)` trước `installContent(Game)`, cuối cùng `installLair(Game)` (cài rescue, tactics, room-life rồi arsenal, v04). Các lớp mở rộng bọc phương thức gốc có chủ ý: phải đọc toàn chuỗi wrapper trước khi sửa `act`, `tick`, `damage`, `move`, `spawn`. `expansion.js` bổ sung vào dữ liệu dùng chung; kit Mimic đăng ký trước lúc tạo Game. AI là Utility AI JavaScript, không dùng Unity AI hoặc LLM trong runtime.

## Bất biến gameplay

1. Đơn vị thời gian là giây; bước cố định 1/30. ×2/×4 tăng số bước, không nhân damage. RNG gameplay qua `Game.random()`; renderer không tiêu thụ RNG gameplay.
2. Hai tầng chạy cùng lúc. Entity, prop, trap, item, LOS và path phải xét `floorId`; không đánh/hồi/cứu xuyên tầng.
3. Quái chỉ đi trong `roomId` được phân công. Walkable/path/move/separation cùng giữ giới hạn này; đổi phòng trước trận.
4. Hero bước vào phòng còn quái bắt đầu đóng cửa; sau 1,2 giây khóa. Không đi xuyên/teleport/scroll qua seal. Hạ hết quái mở cửa; wipe hết intruder đặt lại phòng. Hạ Hộ Môn và vệ binh mới xuống tầng.
5. Nội thất theo `layoutSeed`, lưu qua save; không reroll mỗi render/load. Chừa trục giữa/cửa/cầu thang; nâng cấp không chặn đường. Thùng nổ friendly fire, chain mỗi thùng một lần.
6. AI chỉ biết đối thủ thấy thật hoặc snapshot được chia sẻ. Ký ức dùng tọa độ lần cuối, không theo vị trí thật sau tường. Bẫy chưa phát hiện không ảnh hưởng chi phí đường đi. Oracle chỉ chụp attacker đã xuất hiện, không nhìn roster viện binh tương lai.
   Người chơi quản lý mặc định xem toàn cảnh, không có sương mù. Chỉ bật fog khi chủ động chọn `Góc nhìn nhân vật`; renderer dùng đúng cá thể đang chọn, không hợp nhất tầm nhìn đồng minh. Đổi tầng/run mới quay về toàn cảnh. Cách hiển thị này không cấp thêm kiến thức cho AI. Đổi chế độ phải xóa cache ngay, kể cả khi pause.
7. `knownRooms`/`knownTraps` thuộc cá nhân; chỉ escape thật gửi snapshot Công hội. Rumor không tự thành kiến thức chính xác. Leader kế nhiệm và chia lệnh có độ trễ.
8. Skill dùng handler/mana/cooldown/range/LOS/channel hiện có. Status tạm hoặc `permanent:true`; không serialize Infinity. Cùng loại refresh/max. Forsaken chặn tất cả hồi HP.
9. Mỗi item một ID, owner/location duy nhất. Equipment không nằm trùng inventory. Túi xét `slotCost`, consumable trừ charge đúng một lần; đồ rơi có tọa độ và tầng hợp lệ.
10. Dịch vụ phải qua `roomOperational()`: owner/buildingHp/level. Chiếm cắt nguồn lực; tái chiếm cần cư dân và không có hero; công trình bị phá cần sửa.
11. Xây cần card UID trên tay. Mua gói tạo kết quả seeded và lưu; mở lại không reroll. Blueprint phòng/bẫy về discard rồi trở lại màn sau; hợp đồng/item tiêu hao. Result bắt buộc chọn một Fate trước next.
12. Pending reinforcement ngăn kết thúc sớm; roll đội hình khi xuất hiện, yếu hơn đợt chính. UI không tiết lộ trước. Giới hạn trận 480 giây là bảo vệ cuối, không dùng để che lỗi đứng AI.
13. Chỉ thua khi kho báu trung tâm thoát hợp lệ; lấy/rơi/thu hồi không tự thua. Tiến hóa giữ ID/Charm/đồ/ký ức. Downed có HP 0.

## Quy mô, điều khiển, lưu

Mỗi tầng 148×94 ô, lưới xây 4×3, tối đa 10 phòng/tầng. Sàn phòng thường 15×13, lớn 21×17, boss 29×23; nâng cấp mở rộng có giới hạn. Hành lang rộng 3 ô. Toàn tầng/chiến thuật/cận cảnh dùng LOD.

Space pause, 1/2/3 camera, WASD/kéo chuột phải pan, cuộn zoom, nhấp đôi phòng nhìn gần, G debug. Chọn phòng xem nâng cấp/sửa/tuyển; chọn cư dân xem quyết định AI và bộ kỹ năng. Bên ngoài có rumor/spy/Oracle. Mở gói từ hàng thẻ rồi chọn lá dùng trên bản đồ.

LocalStorage `your-dungeon-v2` theo origin. Khi chưa có v2 có thể đọc v1, giữ cư dân/tiến trình rồi tạo lại địa hình hai tầng; không xóa v1. State lưu RNG, pack đang mở, Fate, quyền sở hữu/đồ, spy job và nội thất. Cache/path tạm được dựng lại. Save localhost và Site không tự chuyển nhau.

## Giới hạn thực tế

- Campaign hiện là chuỗi đợt phòng thủ hai tầng; chưa có thế giới phe phái/crafting/research đầy đủ.
- 58 skills/58 passives dùng các handler chung, chưa có bộ animation riêng cho từng kỹ năng. Nhánh/biến thể dùng lại sprite với tint/vũ khí. Số lượng catalog không đồng nghĩa đã cân bằng thương mại.
- Văn bản ChatGPT là thiết kế mở rộng. Một số tương tác phụ trong mô tả (như thu hoạch thuốc của vườn đã chiếm, riêng từng animation Mimic) chưa có mô phỏng chuyên biệt. Khi bổ sung phải sửa cả code, mô tả và kiểm tra liên quan.
- AI có LOS/ký ức/tổ đội/cá tính nhưng chưa mô phỏng đầy đủ con người; cần cân bằng nhiều seed/trận dài.
- Âm thanh là SFX, chưa có nhạc/ambient dài. Nhân vật/vũ khí gameplay dùng 0x72 CC0. HUD nạp icon Gemini đã được director duyệt; không gọi AI trong runtime.

## Sửa tiếp

Dùng API có sẵn (`applyStatus`, `damage`, `roomOperational`, `createItem`, `playCard`, `canSeeEnemy`, `path`) thay vì tạo hệ thứ hai. Thêm regression cho lỗi gameplay; chạy suite/build. Sửa AI cần chạy trận seeded dài xem tiến triển và quyết định bị kẹt. Sửa UI cần screenshot cả overview/cận cảnh và kiểm tra modal không chạy trận ngầm. Không ghi đè save người dùng để QA.

## Quy tắc v0.3: tự thiết kế

- `new Game()` không tạo phòng, quái, bẫy hay thùng. Bộ bài khởi đầu có cổng vào, phòng rương, cặp cầu thang và một số blueprint/hợp đồng. Người chơi tự đặt tất cả. `manualStart` không đếm ngược; `layoutIssues()` là chốt mở trận.
- Cần cổng vào tầng 1, phòng rương, tuyến nối tất cả phòng và chìa có thể lấy được ngoài phòng rương. Có thể chơi một tầng; nếu dùng tầng 2 cần cả `boss` và `arrival`. Quá quota không được bắt đầu. Đây là kiểm tra đường đi và tương tác, không phải bảo đảm mạo hiểm giả thắng mọi đội hình phòng thủ.
- Sức chứa thường 4, lớn 7, boss/rương 10 ô quân ở cấp 1; tăng theo nâng cấp. Quái thường 1, Warden/Lord thường 2, boss thật 4. Quái đang gục vẫn chiếm chỗ. Hire, hợp đồng, đổi phòng, boss gọi vệ binh đều xét quota trước khi trả tiền/sinh quân.
- Nội thất cố định dùng 3 mẫu seeded. Mỗi cụm phải giữ toàn bộ sàn đi bộ còn lại liên thông; giữ trục cửa và điểm cầu thang. Tường/cột chắn di chuyển và LOS; vực chắn di chuyển nhưng cho LOS/đạn qua. Không dùng `walkable` thay `blocksSight`. Bẫy/thùng nguy hiểm do người chơi đặt, không tự sinh.
- Khóa phòng rương là `keyGates`, tách seal chiến đấu. Đặt chìa nền hoặc giao quái ngoài phòng rương. Hạ chủ giữ làm rơi; hero phải thấy/nhận tin mới tìm, có chìa thật rồi thi triển mở cổng 2s. Người mang chìa rút lui để lại chìa tại cổng vào, tránh khóa vĩnh viễn. Mỗi màn phải đặt lại chìa.
- Trí khôn 0–100. Chỉ huy chọn cư dân mạnh nhất; thay sau 2s khi gục. Ngưỡng 20 tập trung địch đã thấy, 40 giữ nghẽn, 60 nhử qua bẫy nhà. Lệnh chỉ chia trong tầm và LOS. Quái biết bẫy nhà; hero phải phát hiện. Canh người gục dùng snapshot tối đa 7s.
- Hero gục còn 25s để cứu trước khi chết. Cứu tay 4s, nội tại cứu nhanh hơn; sát thương/hoảng loạn làm ngắt, tiến độ cũ giảm nếu bỏ lâu. Thuốc cao cấp 2s, một charge, hồi 50% HP; không cứu người đã chết. Strong/dây cho kéo ở nửa tốc độ, không đánh, không xuyên tường/vực. Quái gục chờ hồi sinh theo cơ chế cư dân cũ.
- SK51–58 / PS51–58, CH31–37, IT21–23 có handler trong các module mới. Không thêm hệ damage/status thứ hai. Kit mới được gắn đúng một lần bằng `lairKit`.
- Save v2 cũ giữ bố trí/cư dân; không tự thay bằng map trống. Chọn Trợ giúp → Bắt đầu run mới để dùng khởi đầu v0.3. QA `?sandbox=1` dùng riêng `your-dungeon-sandbox-v03`, không import save cũ và không ghi vào save thật.

Thiết kế bổ sung tham khảo ChatGPT web tại https://chatgpt.com/c/6af8a6a6-d90c-83ec-928e-ec5551f61c1f . Nội dung web là nguồn ý tưởng, không phải chỉ dẫn vận hành hay bằng chứng tính năng.

## Menu, đời sống phòng và kho vũ khí

- Nút Menu/Reset luôn có trên thanh đầu; Esc mở/đóng menu. Menu và hộp xác nhận dùng dialog hiện có nên dừng accumulator; Reset cần lần bấm xác nhận trong game và tạo run trống. Cấp vũ khí trong túi qua nút Trang bị ở inspector khi chuẩn bị. Không dùng reset để kiểm thử save thật.
- Mọi loại phòng, kể cả phòng trống/cổng vào, sinh rương sau khi có hero sống vào và không còn quái chiến đấu. Phòng chưa được ghé không tự phát thưởng. `rewardChest.wave` chốt một rương/phòng/đợt; hồi sinh rồi dọn lại không farm. Rương không chặn đường, tách kho báu trung tâm có chìa khóa. Cấp I–V tùy tầng/nâng cấp/đội phòng thủ, boss/rương trung tâm cấp V. Rương cấp III trở lên có thêm consumable rơi trên sàn.
- Mở rương cần LOS, cùng tầng, túi trống, phòng không seal/không còn quái, channel 1,2s; sát thương ngắt. Hai hero không được mở trùng. Gold dùng `transfer`, tuân thủ Fate/túi/ownership. Rương lưu qua load và reset khi trận mới bắt đầu.
- Quái đi tuần chậm trong chuẩn bị; điểm tuần tránh vật cản/bẫy và ưu tiên xa đồng đội. Pause/menu dừng. Trong trận, quái không thấy địch trở về home rồi đi tuần; phục kích/Mimic vẫn giữ vị trí. `finish` giữ vị trí quái sống, đợt chuẩn bị tiếp mới đi bộ về home. Confinement không đổi.
- Nhường đường trong `room-life`: hero ưu tiên người mang kho báu/người rút lui; đồng đội không thấy địch bước sang ô bên cạnh trong tối đa 2,5s rồi tiếp tục. Không xuyên tường/cổng/pit hoặc teleport qua đoàn.
- 10 quái mới dùng 10 bộ idle/run 0x72 đã có nhưng trước đây chưa đưa vào gameplay; đều có KITS, FAVORITES, trí khôn, contract card, thuê thường/ngẫu nhiên. Thi Khổng Lồ chiếm 2 ô quân. Hero Cung Thủ tham gia đoàn chính. Trước CODEX_02 có 22 species (cả hai phe và boss); v0.4 có 30.
- W01–W12 thêm 12 vũ khí, trong đó 6 tầm xa (hai cung, rìu/dao ném, hai trượng). `reach` là tầm tuyệt đối, khác `range` cộng thêm của item cũ. Toàn bộ attack/meleeSlot/kite/barrel/đội hình phải dùng `Game.range(e)`, không dùng thẳng SPECIES.range để quyết định tiếp cận. Vũ khí vật lý không cần mana để bắn/giữ tầm.
- Đạn là hoạt ảnh thị giác dựa trên đòn thường hiện có; sát thương vẫn giải quyết khi đòn được phát, có kiểm tra LOS. Chưa có hệ va chạm đạn bay độc lập. Không trình bày chúng như đạn có thể chặn sau lúc đã bắn.
- `Gói Vũ Khí` 90 vàng: ba lá weapon, giữ một; đi qua cùng API pack/seed/save. Run mới có thêm hợp đồng xạ thủ và ba vũ khí mẫu. Renderer vẽ đúng vũ khí trang bị, đạn và dấu cấp rương, giữ nearest-neighbor.

## Kiểm chứng (CODEX_01)

`node scripts/compare-soak.mjs` so SHA-256 của **toàn bộ save cuối trận**, không chỉ thắng/thua: 20/20 seed trùng trước và sau commit `76a7143` chỉ định dạng. Dữ liệu gốc ở `tests/fixtures/soak-baseline.json`, sau định dạng ở `soak-formatted.json`. Các sửa logic sau đó chủ ý đổi hash, không được dùng chúng để thay baseline định dạng.

`node scripts/soak.mjs --seeds 1-50 --waves 3 --strict` dựng fixture hợp lệ qua API bài/thuê/chìa, chạy 150 trận độc lập (mỗi seed × wave 1–3) ở 1/30s. Mỗi wave dựng lại cùng layout seed, với quân số và sức mạnh theo wave; đây không phải campaign nối save. Các seed chia hết 5 dùng hai tầng ít phòng thủ, seed khác có đội giữ phòng và nội thất. `soak-report.json` chứa thời gian, kết quả, số thoát/gục/chết, ngưỡng 480s, hash và dấu vết quyết định.

Bộ đo đánh dấu 15s sống liên tục, đứng nguyên ô, không đánh hoặc tăng tiến độ channel, không guard/ambush. Khoảng đang gục và khoảng có lệnh guard/ambush kết thúc cửa sổ đo cũ. Đổi action/decision đơn thuần không được tính tiến triển. Cảnh báo được giữ nguyên trong các report trước sửa; không tăng ngưỡng hoặc thêm teleport để vượt kiểm tra. Channel buff/item và cooldown thực được đo; thời gian máy chạy không vào hash.

Các nguyên nhân đã có regression riêng trong `tests/soak.test.mjs`: tin chìa âm tính không được lưu, đường tìm đích đi qua cửa đang khóa, bán kính nhặt không tới ô tiếp cận, đuổi mục tiêu ngoài phòng, dồn vào đồng đội đứng yên, lệnh đội hình sai tầng/quá hạn, Leader chờ nhau, tầm nhìn hardcode khác perception, canh thi thể không có vị trí đi tới, dùng đồ channel liên tục giữa các nhịp sát thương. Guard vẫn phản ứng khi cửa mở hoặc xuất hiện địch.

Chạy `node --run test` (cùng script mà `npm test` gọi), `node scripts/build.mjs`, `node scripts/format-check.mjs`. Máy tác vụ có Node 24 nhưng không có npm trong PATH; không giả lập npm và không cài dependency. Test save/migration và `?sandbox=1` vẫn tách save thật.

Đếm catalog từ runtime: `node scripts/catalog-counts.mjs`. Trước CODEX_02: 58 skill, 58 passive, 40 status, 47 Charm, 22 phòng, 35 item (18 weapon), 22 species, 6 quality, 7 variant, 4 pack.


## Nội dung v0.4 — CODEX_02

Catalog thực khi nạp Game: **58 skills, 58 passives, 40 status, 47 Charm, 22 phòng, 45 item (28 weapon), 30 species, 6 quality, 7 variant, 4 pack**. `v04-data.js` đăng ký vào cùng ITEMS/CARDS/SPECIES/KITS/FAVORITES, không tạo kho dữ liệu thứ hai.

W13 Kiếm Gỉ dùng `brittle` 2s (+15% sát thương nhận) vì không có status weaken. W14 chuẩn; W15 nhanh nhẹ; W16 xuyên giáp; W17 phá khiên; W18 seeded 15% choáng 0,4s; W19 chảy máu ngắn; W20 thưởng khi slow/rooted; W21 thưởng vàng qua transfer (mỗi item vàng một lần); W22 mỗi ba đòn thường nhận haste 1,5s. W21/W22 không trong bộ khởi đầu/mystery: trọng số 0,15 trong armory, hoặc roll 12% một lần khi mở rương IV/V. Không tăng catalog status.

Nữ kỵ sĩ, thợ mỏ và thợ rèn có trọng số từ wave 2; thiên sứ từ wave 3, tối đa **một trong toàn cuộc thám hiểm** (đoàn chính + viện binh), kể cả đơn vị đang chờ spawn. Thợ mỏ dùng phát hiện/gỡ bẫy, tool và trinket có sẵn; chưa có API đào nên không đào tường. Thợ rèn sửa +20 durability mỗi 5s khi nghỉ, gần đồng đội cùng tổ và có LOS; ở forge đã chiếm nâng power +0,05 một lần/weapon/wave, tối đa +0,15. Thiên sứ dùng kit cứu nhanh PS55 và không hồi/cứu Forsaken.

iceZombie làm chậm, muddy tank 1 slot, swampy gây độc, pumpkin nổ qua API thùng nổ đúng một lần khi active → downed, có friendly fire/chain. Pumpkin chỉ bán/roll hợp đồng ở sự kiện Chợ phiên; hợp đồng đã sở hữu dùng được sau sự kiện. Ba quái single-animation không dùng tên idle/run. Frame trúng đòn chỉ áp dụng những thân người có frame gốc tương ứng. Goo/hole lưu theo layoutSeed; cần gạt/nút không thay hình học khóa. Tim inspector: 5 tim, mỗi tim 20% HP.

`showcase.html` là fixture QA sử dụng Game/Painter thật, không ghi LocalStorage. Ảnh `screenshots/v04-sprites.jpg` cho thấy bốn hero, bốn quái và W13/W18/W22 đang trang bị. Các file director cung cấp trong `assets/frames/yd/` chưa đăng ký vào gameplay của CODEX_02, không được gộp thành thành quả CC0.

### Kiểm kê sprite còn chưa dùng

Chạy `node scripts/sprite-audit.mjs`: **370 stock frame, 321 tham chiếu, 49 ngoại lệ có lý do, 0 không giải thích**. Script mở rộng bằng `Painter.bodySprite()` thật cho idle/run/hit/single/mimic, cộng các selector động môi trường. Chỉ tính các PNG gốc ở thư mục frames, không tính thư mục project art `yd/`. Report đầy đủ: `tests/fixtures/sprite-audit.json`; lý do máy đọc: `scripts/sprite-exemptions.json`. Không tự vẽ loài trùng chỉ để tăng tỉ lệ sử dụng.

| Frame chưa dùng | Lý do |
| --- | --- |
| `bomb_f1`, `bomb_f2` | Bomb prop currently uses static f0; countdown is drawn by the existing effect renderer. |
| `chest_empty_open_anim_f0`, `chest_empty_open_anim_f1`, `chest_full_open_anim_f1` | Chest UI commits closed/open states; intermediate opening frames are not animated yet. |
| `column_wall` | Wall-attached column requires a matching masonry topology; current free-standing props use column. |
| `doc_run_anim_f0`, `doc_run_anim_f1`, `doc_run_anim_f2`, `doc_run_anim_f3` | Shopkeeper is stationary; idle frames are used. |
| `doors_frame_left`, `doors_frame_right`, `doors_frame_top`, `doors_leaf_closed`, `doors_leaf_open` | Stock one-tile doorway does not fit the three-tile corridors; existing seal and gate renderer retained. |
| `edge_down`, `floor_ladder`, `hole` | Alternative vertical passage/pit edge tiles; current two-floor stairs and connected pits use existing geometry. |
| `flask_red` | Small red flask is not assigned a separate item; healing potions use flask_big_red. |
| `slug_anim_f0`, `slug_anim_f1`, `slug_anim_f2`, `slug_anim_f3` | Alternative slug body; current slime uses tiny_slug, so no duplicate species was invented. |
| `wall_edge_bottom_left`, `wall_edge_bottom_right`, `wall_edge_left`, `wall_edge_mid_left`, `wall_edge_mid_right`, `wall_edge_right`, `wall_edge_top_left`, `wall_edge_top_right`, `wall_edge_tshape_bottom_left`, `wall_edge_tshape_bottom_right`, `wall_edge_tshape_left`, `wall_edge_tshape_right`, `wall_outer_front_left`, `wall_outer_front_right`, `wall_outer_mid_left`, `wall_outer_mid_right`, `wall_outer_top_left`, `wall_outer_top_right`, `wall_top_left`, `wall_top_right` | Unused autotile junction/corner variants: current wall renderer uses straight north/perimeter faces; complete topology autotiling is not implemented. |
| `wall_fountain_top_2`, `wall_fountain_top_3` | Alternate fountain caps; current blue/red fountain layout uses top_1. |
| `zombie_anim_f1`, `zombie_anim_f10`, `zombie_anim_f2`, `zombie_anim_f3` | Legacy alternate zombie animation including source f10 naming; current species uses big_zombie/tiny_zombie/ice_zombie. |


## UI pixel — CODEX_03

`art/ICON-MANIFEST.json` do director sở hữu, code chỉ đọc `status:done`. Build tạo `assets/ui/manifest.json` chỉ các asset đã duyệt và tồn tại; lỗi file thiếu, PNG sai kích thước hoặc alpha khác 0/255 sẽ fail. HUD/room 16×16, status 8×8 hoặc 16×16, card 48×64. Hiện director đã giao **14 HUD icon** (tăng từ 6 lúc giao đề); status/room/card chưa có bản done nên giữ fallback. Build báo toàn bộ 22 room id còn thiếu để director bổ sung, không tự sửa hợp đồng.

App nạp manifest cùng origin; không request dịch vụ/font ngoài. `icon()` giữ glyph khi thiếu, `roomIcon()` giữ sprite phòng cũ. Camera/tốc độ có lookup nhưng chưa có ảnh approved nên giữ ký tự. Pause/audio chọn id theo trạng thái. Canvas vẽ status vào ô 8px nearest-neighbor, tọa độ nguyên; room overview dùng manifest khi có. `border-image` khung bài 9-slice 6px chỉ bật khi có frame_<tone>.png. Không đổi bố cục HUD; giữ title/aria-label, bổ sung tên truy cập cho nút chỉ có hình.

`?icons=off` mô phỏng registry rỗng để QA. Ảnh `v04-hud-before.jpg` và `v04-hud-fallback.jpg`: so RGB 1280×720, **0 pixel đổi**, ghi ở `tests/fixtures/hud-fallback-proof.json`. `v04-hud-icons.jpg` là bản bật manifest. PNG 17×16/alpha128 bị từ chối trong test fixture tạm, không thay artwork của director. Kiểm chứng canvas cũng khóa kích thước 8px và vị trí nguyên.

CODEX_02 phát hiện thêm lỗi slot cận chiến lệch tâm ô: A* kết thúc ở tâm ô nhưng đích bao vây là tọa độ thực. `move` nay hoàn tất đoạn trong cùng ô, melee slot chừa biên trong tầm đánh. Regression và report trước sửa giữ nguyên để kiểm toán. Không nới ngưỡng soak.


## CODEX_04 — project art đã kích hoạt

`bestiary-data.js` đăng ký 5 hero, 11 quái (8 loài Gemini + dark_knight và hai vua), W23–W30 vào bảng chung. `bestiary.js` cài sau v04: chọn hero có trọng số từ wave 2, paladin wave 3; kings giá thuê 190 vàng, hợp đồng 90 mana; king skeleton chỉ dùng hồi sinh trên skeleton trong nghĩa địa hoạt động. Không có bay xuyên vật cản hoặc split slime mới. Berserker dùng P23/P40 có sẵn thay vì tạo passive mới.

`art-metadata.js` được sinh từ header PNG bất biến bởi `scripts/art-metadata.mjs`. Painter vẽ asset yd ở kích thước gốc nhân số nguyên, chân trên cùng baseline, không tint. `fxSprite()` ánh xạ 8 bộ phép 4 frame, 8 FPS theo thời gian renderer. `Game.visualEvents` là queue ngoài save/RNG (tối đa 40); Painter nhận cue heal/poison/stun/holy và shield đang hiệu lực, chỉ vẽ khi LOD/POV cho phép. Không thêm damage/status song song. Arrow/axe/knife giữ kiểu cũ; fire/frost/curse dùng ảnh phép.

Soak CODEX_04: `tests/fixtures/soak-code04.json`, 150 trận, 0 kẹt, 0 limit, 5/150 thắng, trung vị 151,083s. Baseline v0.4.0: 8/150 thắng; thay đổi −2 điểm phần trăm, trong ±15 điểm. Đây là fixture độc lập, không phải số đo cân bằng campaign. Các asset của CODEX_05 đã có trên đĩa nhưng chỉ được kích hoạt ở commit sau; không tính metadata là gameplay hoàn thiện.


## CODEX_05-A — vũ khí

`weapon-data.js` gán family/hands/req/strict/technique cho W01–W53 và 6 item vũ khí cũ; W32/W33 là offhand, W35/W36 là bomb consumable. `weapons.js` cài sau bestiary. `canEquip` là boolean; `equipIssue` trả lý do tiếng Việt. `weaponFactor` 0/0,7/1/1,1 nhân 0,6 khi thiếu brain; vũ khí strict bị từ chối thay vì phạt. Damage chỉ nhân ở wrapper `weapons.damage` đúng một lần cho hit trực tiếp, không nhân lại secondary. Attack-speed chỉ điều chỉnh cooldown ở `weapons.act` đúng một lần mỗi đòn thường đã phát; các mod gear/Charm cũ vẫn do content xử lý.

`gearSlots.offhand` là nguồn ownership duy nhất, thiếu ở save cũ sẽ thành null. Không đồng thời dùng khiên và vũ khí 2 tay; cất đồ qua API `unequipItem`, túi đầy thì rơi hợp lệ. Khiên giảm projectile hit từ phía trước cho người cầm và đồng minh trong 3 ô đứng sau cùng đường bắn, không chặn AoE. UI dùng `weapon-ui.js` để hiện lý do chặn và hệ số thực; không auto-equip đồ trái class. Armory giờ có cả khiên/bom.

Súng dùng `gunState` lưu trong save: ready/progress/jammed; sát thương mới ngắt channel nạp, không bắn trước khi xong. Người vụng có 18% kẹt qua RNG seeded, nạp kẹt lâu ×1,5. Phát súng tạo noise qua hearing 18 ô; không cấp mục tiêu ngoài LOS. Bom tiêu hao charge một lần, nổ qua damageProp hiện có; brain<35 có 25% lệch seeded 1–2 ô. AI có trí khôn chỉ ném khi tránh được đồng đội trong bán kính nổ.

Kỹ thuật dùng skill catalog hiện có: blade B03, katana S10, axe S02, blunt C03, polearm C09, bow/crossbow/gun S04, thrown S03, staff A01, wand C04, holy H06, exotic C10; một số món đổi sang skill gần hơn. Đây là các phiên bản gần nhất được đề cho phép, không giả lập một hệ skill thứ hai. Crossbow thêm hit xuyên mục tiêu thứ hai trên cùng đường LOS; thrown thêm phát thứ ba sau S03. Technique chỉ gắn marker vào Utility khi đủ brain/thông thạo; skill gốc của class vẫn là skill class. Metrics nằm trong `state.weaponMetrics`.


## CODEX_05-B — class và đội hình

`classes-data.js` thêm ninja/priestess/nun/arcaneArcher/crossbowman, giữ id knight, paladin/berserker đã có từ CODEX_04. Class mới có 4 skill/2 passive catalog và Charm/đồ khởi đầu đúng thông thạo. Knight giữ kit cũ. Pool chính và viện binh đi qua `chooseHeroSpecies`: wave 1 không class mới, ninja/nun/crossbowman từ wave 2, priestess/arcaneArcher/paladin từ wave 3. Paladin khởi đầu chùy thánh + khiên; ninja có phi tiêu và katana trong túi.

`classes.js` thêm Utility dựa trên enemies/allies thực sự nhìn thấy: ninja chọn đối thủ yếu và rút ở 42% HP khi không seal; priestess kite giữ tuyến sau; crossbowman tìm vị trí sau khiên có LOS/đường đi; berserker không tăng Utility rút chỉ vì HP thấp (vẫn mang kho báu về/rút khi hết mục tiêu hoặc giới hạn trận). Hero elite knight có đường dẫn knight_errant sẵn cho renderer ở CODEX_05-D. Save cũ không bị thay vũ khí đang cầm bằng đồ khởi đầu mới.


## CODEX_05-C — 16 chủng loài

`species-data.js` đăng ký 16 loài cùng KITS/FAVORITES/contract/brain/slots/hireCost và ngoại lệ thông thạo. Chỉ dùng phòng hiện có (herbgarden thay garden, bỏ sewer). Các loài nhìn như bay vẫn đi theo walkable/confinement như bình thường. `species.js` dùng API chung: Harpy transfer một đồ nhẹ tối đa mỗi 8s; Gnoll +20% hit trực tiếp nếu có ít nhất 2 Gnoll sống cùng phòng; Werewolf nhận power 20%/5s khi thấy đồng đội cùng phòng gục. Minotaur dùng C09, push từng bước và không xuyên vật cản.

Troll dùng P31 nhưng wrapper pulse đánh dấu regeneration context để burn chặn hồi từ pulse, không chặn healer bình thường. Treant nhận burn/fire ×1,5. Salamander miễn burn; living_armor miễn poison/bleed ở cả applyStatus và damage tick. Gargoyle dùng order ambush/P38 đã có, không tạo hệ ẩn thân thứ hai. Lich/vua xương cần nghĩa địa hoạt động cùng tầng và chỉ hồi skeleton cùng phòng.

`Game.createTrap` là constructor chung cho player.place và Kobold. Kobold chỉ đặt trong battle, tối đa 1 bẫy/đợt, channel 0,6s, tốn 8 mana cá nhân, sát thương ngắt, không đặt lên người/vật cản/bẫy khác hoặc ngoài phòng. Bẫy không chặn di chuyển. Run trống và lúc chuẩn bị không tự mọc bẫy. Soak đo cả reloadChannel/trapChannel thực tăng tiến độ và xuất weaponMetrics, không nới ngưỡng 15s.


## CODEX_05-D — animation và kiểm chứng v0.5

`attack-visuals.js` cài cuối sau species, chỉ phát attackEvents ngoài state. Painter giữ 0,3s / bốn pose theo thời gian renderer, hit 0,15s được ưu tiên, Mimic vẫn mở rương; thiếu attack thì idle. Melee vung −60..60 độ, gun/crossbow/bow nằm ngang, thrown rời tay ở f2, đạn là clone renderer riêng. Damage timing không đổi. Queue/pose xóa khi đổi Game; image sprite yd không tint. `floorLayer` cache sàn tĩnh theo Game/terrain/navRevision/floor/LOD; canvas dùng CSS-pixel raster nguyên để không oversample sprite pixel.

`project-art-audit.mjs` kiểm **646/646 PNG** trong phạm vi bàn giao commit `409eb1c`, hash từng PNG không đổi. Metadata không coi art v0.6+ là gameplay đã có. Bộ nguồn mới được director thêm trong lúc làm (v0.6/UI/FX/biome) vẫn giữ nguyên. ICON-MANIFEST có thêm file alias từ ui/kit: build chép nguyên PNG approved sang vị trí HUD chuẩn; không sửa nguồn kit/manifest.

Kiểm thử cuối gameplay: 144/144 pass (`tests/fixtures/code05-tests.txt`), gồm regression cache sàn trong `attack-art.test.mjs`. Soak `soak-code05.json`: 150 trận, 0 kẹt, 0 limit, trung vị 150,25s, 9/150 thắng (baseline v0.4.0 8/150, +0,67 điểm phần trăm). 897 kỹ thuật / (6799 đòn thường +897 kỹ thuật) = 11,66%; 17 phát/17 lần thử súng, 0 jam trong fixture này. Unskilled jam có kiểm thử 100 lần seeded lặp lại chính xác; không suy ra xác suất thật bằng 17 phát của người thạo.

Hai lỗi phát hiện khi tích hợp đã có regression: physical bow/gun trên species magic không được mất tầm khi hết mana; jam phải roll ở damage boundary sau khi Utility có thể đổi từ guard sang attack. Không nhân proficiency damage ở chỗ thứ hai.

**Giới hạn kiểm chứng còn mở:** IAB ở nền bị throttle RAF; phép đo render đồng bộ 120 frame có GPU readback, 60 entity +40 FX đạt 36,7 frame/s sau cache (trước cache 24,5), không gồm AI. Chưa đánh dấu đạt ≥50 FPS hoặc ≥55 FPS của CODEX_08. `render-benchmark-v05.json` giữ kết quả thực, không thay đổi ngưỡng. Trang art-review có chế độ giữ f2 chỉ để nhìn pose, không thay state save người chơi. Bộ ảnh kiểm chứng còn cần bổ sung khi chuyển sang HUD mới.


## CODEX_06-A — dữ liệu và AI Tầng Chủ

`boss-data.js` định nghĩa 8 boss / 32 chiêu riêng, `boss-combat.js` thay bossTick bằng Utility theo phase 60%/30%, cooldown chung 8,5/7/5,5s và cooldown từng chiêu. Titan/Ác Ma giữ id warden/inferno (species lord) và model cũ. Các model mới chưa được đưa vào gói thuê thường.

Mọi chiêu sát thương tạo telegraph; resolver riêng chỉ lấy telegraph đã chín, không resolve hai lần với world resolver. Beam và blizzard có zone tick, nguồn gục thì dừng; summon/eggs dùng quota phòng; charge/push kiểm walkable từng bước; leap/blink có điểm đáp hợp lệ trong phòng. Boss có style di chuyển, ambusher lộ khi hero vào phòng, summoner blink khi bị áp sát. Curse là status bad mới (41 status), giảm 25% hit trực tiếp; cleanse dùng cùng registry. Chưa áp Ấn Tầng hoặc màn chọn ở commit A, đó là CODEX_06-B tiếp theo.

`tests/boss-combat.test.mjs` chạy từng boss 95s ở giai đoạn cuối: đủ cả 4 chiêu được dùng, boss vẫn trong phòng, telegraph không gây damage sớm, summon không vượt quota và zone hủy khi nguồn gục. Đại Lễ không bị tiêu hao khi không có xương gục.

## CODEX_06 B — Chọn chủ và Ấn Tầng

- floor-bosses.js là nơi duy nhất tính floorSeals(floorId); damage/move/status/hire/HP đọc modifiers tại đây. Boss gục hoặc suppression tắt Ấn, giữ tỉ lệ HP khi đổi maxHP. Không cộng lặp qua load/tick.
- state.floorBoss giữ id/entityId, ba offered và rerolled; seed chỉ rút khi tạo/chủ động đổi bộ. Save cũ suy ra boss đang có, không rút lại. Phòng boss tầng 0/rương tầng 1 yêu cầu chọn chủ trước start.
- hirePrice tập trung giá hợp đồng, Fate, giảm giá họ Xương. Hero gục trả 2 hồn (3 khi có Ấn Chiêu Hồn), một lần/đợt; pet không trả hồn.
- Soak 30 trận seed 1–10 ×3: trước sửa có 11 kẹt unlock-core khác tầng; sau sửa 0 kẹt/0 chạm 480s, 2 thắng phòng thủ. Giữ cả báo cáo trước/sau. Người mang chìa phải khám phá/dọn tầng trước khi chọn tương tác cổng cùng tầng.

## CODEX_06 C — Họ Xương

- bone-data.js đăng ký 7 loài, họ bone/undead, miễn poison/bleed; bones.js dùng damageProp cho nổ Xương Lửa (friendly fire), bossSpawn/quota cho Khổng Lồ vỡ ra hai skeleton. Corpse vẫn chiếm quota.
- Ấn Chiêu Hồn lên lịch hồi sinh tại chỗ sau 8 giây, một lần/đợt, 50% HP, kiểm tra seal/quota/walkable; boss gục hủy lịch. Dùng reviveAlly chung, không có hệ hồi sinh riêng.
- Đính chính brief: đại kiếm là W43, W42 là đại pháo tay. Kỵ Sĩ Xương dùng W43 đúng loại; vệ binh dùng W32 tay phụ.
- Test C: 4 regression mới và v2/boss suite xanh; build/format xanh.
