# CODEX — YOUR DUNGEON? v0.3

Đọc trước khi sửa code. Đây là prototype chạy hoàn toàn trong trình duyệt. `GDD.md` là thiết kế gốc; các bản thiết kế từ ChatGPT không phải bằng chứng mọi tương tác đã hoàn thiện.

## Chạy

Node.js 20+, không có dependency. `node server.mjs` phục vụ http://127.0.0.1:4173. Kiểm tra bằng `node scripts/build.mjs` và `node --test tests/v2.test.mjs tests/lair.test.mjs`. Hosting phục vụ nguyên `dist`. Giữ project ID trong `.openai/hosting.json`, không tạo Site khác khi nâng cấp; credential không được vào repo.

## Kiến trúc đã có

| File | Trách nhiệm |
| --- | --- |
| `dist/app.js` | DOM/input/modal/save, accumulator 30 Hz; modal/tab ẩn dừng mô phỏng |
| `dist/simulation.js` | Game/state, RNG, A*, move, cửa, combat, kinh tế, chuyển tầng, kho báu |
| `dist/world.js` | Terrain, hình phòng, hành lang, seeded furnishings, giới hạn phòng |
| `dist/ai.js` | Perception/ký ức, Utility/hysteresis, cover/kite, reservation, khám phá |
| `dist/systems.js` | Skill/passive/status, Leader/scout/intel, công trình, thế giới, tiến hóa |
| `dist/content-systems.js` | Packs/Fates, gear/items, phẩm chất/biến thể, Charms, Mimic/spy/Oracle |
| `dist/catalog.js`, `catalog-data.js` | 50 kỹ năng, 50 nội tại, kit theo loài, status nền |
| `dist/expansion.js`, `expansion-data.js` | Nền mở rộng; tổng hiện tại 22 phòng, 47 Charm, 40 effects, 23 items, 6 phẩm chất, 7 biến thể |
| `dist/lair.js`, `lair-data.js` | Run trống, xây nền móng, quota cư dân, khóa/chìa, kit địa hình |
| `dist/rescue.js` | Gục/chết, cứu hộ có tiến độ, thuốc hồi sinh, kéo, ký ức thi thể |
| `dist/terrain-tactics.js` | Chỉ huy/trí khôn, kỹ năng địa hình/bẫy, AI tìm chìa/mở cổng |
| `dist/painter.js` | Canvas/camera/LOD/fog/minimap/sprites/telegraph |
| `dist/audio.js` | 10 SFX CC0, rate limit và giới hạn số giọng |
| `dist/app.css`, `fantasy.css` | Bố cục và khung đá/đồng pixel fantasy |

`simulation.js` gọi `installSystems(Game)` trước `installContent(Game)`, cuối cùng `installLair(Game)` (cài rescue rồi tactics). Các lớp mở rộng bọc phương thức gốc có chủ ý: phải đọc toàn chuỗi wrapper trước khi sửa `act`, `tick`, `damage`, `move`, `spawn`. `expansion.js` bổ sung vào dữ liệu dùng chung; kit Mimic đăng ký trước lúc tạo Game. AI là Utility AI JavaScript, không dùng Unity AI hoặc LLM trong runtime.

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
- Âm thanh là SFX, chưa có nhạc/ambient dài. Không có ảnh Gemini mới; dùng 0x72 CC0 đồng nhất.

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
