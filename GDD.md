# GAME DESIGN DOCUMENT
# YOUR DUNGEON? — HẦM NGỤC CỦA BẠN?

**Phiên bản:** GDD 5.0

**Nền tảng:** Web Game — Desktop Browser, có thể mở rộng sang Mobile.

**Thể loại:** Dungeon Builder, Management Simulation, Roguelike, RPG, Auto Battler, Card Strategy.

**Đồ họa:** Pixel Art, Top-down 2D Dungeon Crawler.

**Cảm hứng:** Soul Knight đảo ngược, Dungeon Keeper, RimWorld, Dwarf Fortress và thế giới Fantasy RPG.

**Hệ thống trọng tâm:** Utility AI cho cả quái vật và mạo hiểm giả.

---

# 1. GAME OVERVIEW

## 1.1. Ý tưởng cốt lõi

Người chơi là chủ nhân của một hầm ngục trong thế giới Fantasy.

Thay vì trở thành mạo hiểm giả đi khám phá hầm ngục, người chơi xây dựng chính hầm ngục đó, bố trí phòng, hành lang, bẫy, quái vật, công trình và kho báu.

Mục tiêu chính là bảo vệ kho báu trung tâm khỏi những đoàn mạo hiểm giả.

Tuy nhiên, mạo hiểm giả không phải những kẻ địch đơn giản chỉ biết tiến về phía kho báu. Họ là những nhân vật RPG có cấp độ, trang bị, túi đồ, kỹ năng, tính cách, Charm, mục tiêu, ký ức và khả năng tự đưa ra quyết định.

Họ có thể thực hiện những hành động thường thấy trong thế giới Fantasy:

- Khám phá hầm ngục.
- Chiến đấu.
- Né tránh.
- Tìm đường bí mật.
- Phát hiện và vô hiệu hóa bẫy.
- Mở rương.
- Thu thập chiến lợi phẩm.
- Sử dụng vật phẩm.
- Thay đổi trang bị.
- Mua bán tại cửa hàng.
- Nghỉ ngơi.
- Hồi phục.
- Cứu đồng đội.
- Hồi sinh.
- Mở cổng dịch chuyển.
- Rút lui.
- Thương lượng.
- Hợp tác hoặc gia nhập hầm ngục.

Quái vật cũng là những cá thể độc lập, có khả năng chiến đấu, sinh hoạt, sử dụng vật phẩm, học hỏi và tự tiến hóa.

Game tạo ra những câu chuyện tự nhiên thông qua tương tác giữa các hệ thống, thay vì phụ thuộc hoàn toàn vào những sự kiện được viết sẵn.

## 1.2. Các trụ cột chính

**BUILD — Xây dựng:** Xây dựng hầm ngục nhiều tầng bằng hệ thống thẻ bài.

**SIMULATE — Mô phỏng:** Cả hai phe đều sử dụng Utility AI, có cá tính và khả năng phát triển.

**ADAPT — Thích nghi:** Mạo hiểm giả học hỏi từ thất bại, quái vật tiến hóa, người chơi thay đổi chiến thuật.

**MANAGE — Quản lý:** Quản lý tài nguyên, phòng, trang bị, cư dân, thương mại và tổ đội phòng thủ.

## 1.3. Điều kiện thắng và thua

Điều kiện thất bại chính:

**Kho báu trung tâm bị mạo hiểm giả mang ra khỏi hầm ngục thành công.**

Kho báu bị phát hiện hoặc bị lấy khỏi phòng chưa dẫn đến Game Over.

Người chơi vẫn có thể thu hồi kho báu nếu nó còn bên trong hầm ngục.

Mất những tài sản khác không trực tiếp khiến người chơi thua:

- Vàng.
- Trang bị.
- Charm hoặc cổ vật có thể tạo Charm.
- Kho báu phụ.
- Nguyên liệu.
- Quái vật.
- Công trình.

Một màn được xem là phòng thủ thành công nếu cuộc thám hiểm kết thúc mà kho báu trung tâm vẫn thuộc quyền kiểm soát của hầm ngục.

Tuy nhiên, người chơi có thể chịu tổn thất lớn ngay cả khi thắng màn.

---

# 2. GAME MODES

## 2.1. Campaign

Chiến dịch có tiến trình, chương và thử thách cuối cùng.

Gợi ý tiến trình:

1. Hầm Ngục Vô Danh — Học xây dựng và phòng thủ.
2. Những Lời Đồn — Công hội bắt đầu chú ý.
3. Tầng Sâu — Mở rộng hầm ngục, phát triển quái vật.
4. Cuộc Chinh Phạt — Nhiều tổ đội phối hợp xâm nhập.
5. Kỷ Nguyên Anh Hùng — Mạo hiểm giả cấp cao xuất hiện.
6. Hầm Ngục Huyền Thoại — Thử thách cuối cùng.

Boss cuối có thể là một mạo hiểm giả đã từng xuất hiện, sống sót và trưởng thành qua nhiều cuộc thám hiểm.

## 2.2. Endless

Người chơi tiếp tục xây dựng hầm ngục cho đến khi kho báu chính bị mang ra ngoài.

Độ khó tăng thông qua:

- Cấp độ mạo hiểm giả.
- Trang bị và Charm mạnh hơn.
- Nghề nghiệp mới.
- Đội hình phối hợp tốt hơn.
- Thông tin tình báo.
- Phép thuật mới.
- Lối vào phát sinh.
- Sự kiện đặc biệt.

Không chỉ tăng HP và sát thương một cách vô hạn.

## 2.3. Sandbox — tính năng mở rộng

Cho phép thử nghiệm hầm ngục, quái vật, Charm, thẻ bài và AI với các tùy chọn giới hạn tài nguyên hoặc thời gian.

---

# 3. CORE GAMEPLAY LOOP

Mỗi màn được gọi là một Expedition — Cuộc Thám Hiểm.

## 3.1. Vòng lặp

1. Nhận kết quả của cuộc thám hiểm trước.
2. Nhận vàng, EXP và phần thưởng.
3. Quái vật hồi phục một phần.
4. Xử lý hồi sinh và tái tạo.
5. Quái vật đánh giá cơ hội tiến hóa.
6. Nhận thông tin tình báo về đoàn tiếp theo.
7. Rút bài, mua gói thẻ hoặc chọn thẻ định mệnh.
8. Bắt đầu giai đoạn chuẩn bị.
9. Xây dựng và nâng cấp hầm ngục.
10. Bố trí quái vật, bẫy, phòng và vật phẩm.
11. Mạo hiểm giả tiến vào.
12. Cả hai phe hoạt động bằng Utility AI.
13. Người chơi quan sát, ra lệnh hoặc trực tiếp tham chiến.
14. Mạo hiểm giả hoàn thành nhiệm vụ, bị đánh bại, đầu hàng hoặc rút lui.
15. Xử lý chiến lợi phẩm, nhân vật bị bỏ lại và thông tin Công hội.
16. Chuyển sang màn tiếp theo.

## 3.2. Thời gian chuẩn bị

Giai đoạn chuẩn bị có giới hạn thời gian.

Thông số đề xuất:

- Màn đầu: 180 giây.
- Màn thông thường: 120 giây.
- Trước Boss: 180–240 giây.

Người chơi có thể bắt đầu sớm.

Khi hết thời gian, cuộc thám hiểm tự động bắt đầu.

Trong chế độ thông thường, tạm dừng giai đoạn chuẩn bị sẽ đóng băng đồng hồ nhưng không cho thực hiện xây dựng hoặc giao dịch.

## 3.3. Điều khiển thời gian

Trong chiến đấu:

- Pause.
- ×1.
- ×2.
- ×4.

Cho phép xếp hàng mệnh lệnh khi tạm dừng.

Khi điều khiển trực tiếp nhân vật, mặc định chuyển tốc độ về ×1.

---

# 4. PLAYER CHARACTER — DUNGEON MASTER

## 4.1. Tạo nhân vật

Người chơi tự tạo chủ nhân hầm ngục.

Các lựa chọn:

- Tên.
- Ngoại hình.
- Chủng tộc.
- Năng lực khởi đầu.
- Chỉ số khởi đầu.
- Trang bị.
- Charm khởi đầu.
- Kho báu trung tâm.

Các chủng tộc đề xuất:

| Chủng tộc | Lợi thế |
|---|---|
| Demon | Phép thuật, cường hóa quái vật |
| Undead | Hồi sinh, tử linh |
| Dragonkin | Chiến đấu trực tiếp, kho báu |
| Human | Xây dựng, nghiên cứu, thương mại |
| Spirit | Nhập thể, phép hỗ trợ |
| Slime | Tái tạo, thích nghi |

Chủ nhân có Level, EXP, HP, Mana, kỹ năng, trang bị và Charm tương tự những nhân vật khác.

## 4.2. Vị trí chủ nhân

Người chơi có thể lựa chọn:

**Dungeon Lord:** Ở phòng trung tâm, đóng vai trò Boss cuối, nhận hiệu ứng từ ngai vàng.

**Wandering Lord:** Tự do di chuyển giữa các tầng, trực tiếp tham chiến hoặc hỗ trợ những khu vực gặp nguy hiểm.

Có thể thay đổi cách bố trí.

## 4.3. Ba chế độ điều khiển

### Management Mode

- Quan sát hầm ngục.
- Giao nhiệm vụ.
- Điều chuyển quân.
- Điều khiển công trình.
- Kích hoạt bẫy.
- Quản lý tài nguyên.

### Spell Mode

- Hồi phục.
- Tạo kết giới.
- Cường hóa quái vật.
- Cản trở dịch chuyển.
- Thôi miên.
- Thống trị.
- Các phép thuật khác tùy kỹ năng chủ nhân.

### Direct Control Mode

Người chơi trực tiếp điều khiển chủ nhân hoặc nhập vào quái vật có liên kết phù hợp.

Gameplay hành động top-down:

- Di chuyển.
- Tấn công.
- Né tránh.
- Sử dụng kỹ năng.
- Sử dụng vật phẩm.

Khi ngừng điều khiển, Utility AI tiếp quản nhân vật.

Những nhân vật khác vẫn hoạt động bình thường.

## 4.4. Chủ nhân bị đánh bại

Không lập tức Game Over.

Chủ nhân mất khả năng chiến đấu và cần hồi phục hoặc tái tạo cơ thể bằng tài nguyên.

Khả năng can thiệp trực tiếp bị giới hạn trong thời gian này.

---

# 5. DUNGEON BUILDING SYSTEM

## 5.1. Bản đồ hai lớp

### Construction Grid

Lưới lớn dùng xây phòng, hành lang và công trình.

### Navigation Grid

Lưới nhỏ dùng cho di chuyển, chiến đấu, va chạm và tìm đường.

Một ô Construction Grid có thể đại diện cho một căn phòng chứa nhiều ô Navigation Grid.

Ví dụ: Một Phòng đá chiếm một ô xây dựng nhưng bên trong có khu vực chiến đấu 12×12 ô nhỏ.

Các phòng lớn có thể chiếm nhiều ô xây dựng.

## 5.2. Hầm ngục nhiều tầng

Mỗi tầng có bản đồ độc lập.

Các tầng kết nối thông qua:

- Cầu thang.
- Cổng dịch chuyển nội bộ.
- Thang máy ma thuật.
- Đường hầm đặc biệt.

Mỗi tầng có:

- Floor ID.
- Level.
- Kích thước.
- Giới hạn phòng.
- Giới hạn quái vật được phân công.
- Lối lên.
- Lối xuống.
- Đặc tính môi trường.
- Các công trình.

Người chơi có thể nâng cấp tầng hoặc mở tầng mới.

Thông số thử nghiệm:

| Level tầng | Giới hạn phòng | Kích thước lưới | Sức chứa quân thường trú |
|---|---:|---|---:|
| 1 | 6 | 12×12 | 15 |
| 2 | 10 | 16×16 | 25 |
| 3 | 15 | 20×20 | 40 |
| 4 | 22 | 24×24 | 60 |
| 5 | 30 | 30×30 | 90 |

Sức chứa quân thường trú giới hạn số quái vật được phân công vào tầng, không phải giới hạn tuyệt đối số nhân vật có thể đi qua tầng đó.

## 5.3. Quy tắc xây dựng

- Xây phòng bằng thẻ và tài nguyên.
- Phòng phải có kết nối hợp lệ.
- Luôn có ít nhất một đường từ lối vào đến kho báu trung tâm.
- Cửa khóa phải có phương thức vượt qua hợp lệ.
- Phá, di chuyển hoặc cải tạo phòng tốn tài nguyên.
- Hành lang cũng tiêu tốn diện tích và chi phí.
- Phòng có giới hạn công trình, bẫy và quái vật.
- Có thể tạo cộng hưởng giữa những phòng liền kề.
- Không xây hoặc xóa phòng tùy ý khi đang chiến đấu.
- Không được khóa kín tất cả đường đến kho báu.

## 5.4. Lối vào

Ban đầu có một lối vào chính.

Người chơi không tự do xây thêm lối vào từ thế giới bên ngoài.

Lối vào mới xuất hiện qua sự kiện:

- Động đất.
- Đoàn thợ mỏ.
- Cổng không gian cổ.
- Công hội phát hiện lối đi.
- Thẻ định mệnh.
- Đường hầm từ khu vực khác.

Lối vào mới có thể kết nối thẳng với tầng sâu.

Người chơi được cảnh báo và có cơ hội bố trí phòng thủ trước cuộc thám hiểm tiếp theo.

Có thể gia cố hoặc phong tỏa tạm thời lối vào, nhưng không được loại bỏ mọi đường xâm nhập hợp lệ.

---

# 6. ROOM SYSTEM — BỐN NHÓM PHÒNG

Mỗi phòng được phân loại theo chức năng chính.

Một phòng có thể ảnh hưởng đến cả hai phe tùy quyền truy cập và tình trạng vận hành.

## 6.1. TYPE A — DUNGEON BENEFICIAL

Phòng chủ yếu mang lại lợi ích cho người chơi.

### Monster Room

- Bố trí quái vật.
- Giới hạn sức chứa.
- Có thể cung cấp buff.

### Trap Room

- Chứa nhiều bẫy.
- Tự động hoặc kích hoạt thủ công.
- Cần hồi chiêu hoặc sửa chữa.

### Barracks

- Nơi quái vật nghỉ ngơi.
- Tăng hiệu quả hồi phục.

### Graveyard

- Tái tạo Undead.
- Có giới hạn công suất.

### Training Room

- Quái vật luyện tập.
- Nhận EXP và kỹ năng.

### Summoning Room

- Triệu hồi và tái tạo sinh vật ma thuật.

### Anti-Teleport Room

- Ngăn hoặc làm chậm phép dịch chuyển.
- Có thể bị giải trừ.

### Medical Room

- Hồi phục quái vật.
- Chăm sóc nhân vật mất khả năng chiến đấu.

### Boss Room

- Tăng hiệu quả cho Boss được phân công.

### Main Treasure Room

- Chứa kho báu trung tâm.
- Có cơ chế phòng thủ riêng.

## 6.2. TYPE B — ADVENTURER BENEFICIAL

Phòng mang lại lợi ích chủ yếu cho mạo hiểm giả.

Người chơi có thể sử dụng chúng để dẫn dụ, điều hướng hành vi AI hoặc phục vụ các chiến lược đặc biệt.

### Treasure Room

- Chứa vàng và vật phẩm.
- Mạo hiểm giả có thể mở rương và loot.

### Healing Room

- Hồi HP cho mạo hiểm giả.
- Có giới hạn số lần hoặc thời gian sử dụng.

### Mana Fountain

- Hồi Mana.
- Thu hút pháp sư.

### Equipment Room

- Cung cấp vũ khí, giáp hoặc vật phẩm.

### Rest Room

- Cho tổ đội nghỉ ngơi và tập hợp.

### Blessing Shrine

- Cung cấp buff.
- Một số loại có thể ban Charm đặc biệt cho nhân vật đáp ứng điều kiện.

Mục đích chiến thuật:

- Dẫn mạo hiểm giả đi theo tuyến đường mong muốn.
- Khai thác tính tham lam.
- Làm họ dành thời gian khám phá.
- Tạo lựa chọn đánh đổi.
- Hoàn thành điều kiện thẻ định mệnh.
- Tăng hấp dẫn của hầm ngục.

## 6.3. TYPE C — NEUTRAL / RANDOM

Phòng trung lập hoặc ngẫu nhiên.

### Empty Room

Không có chức năng đặc biệt.

### Mystery Room

Có thể xuất hiện kho báu, quái vật, sự kiện hoặc hiệu ứng ngẫu nhiên.

### Ancient Ruins

Chứa công trình cổ, kiến thức hoặc cổ vật.

### Random Shrine

Ban buff, debuff hoặc Charm tùy sự kiện.

### Environmental Room

Địa hình đặc biệt như băng, nấm, dung nham ma thuật hoặc vùng linh lực.

Ảnh hưởng đến cả hai phe tùy khả năng kháng.

### Secret Room

Phòng cần được phát hiện, có thể chứa vật phẩm, đường đi hoặc sinh vật đặc biệt.

### Portal Room

Kết nối đến một khu vực khác, phụ thuộc cách kích hoạt.

## 6.4. TYPE D — SPECIAL / OPERATIONAL

Phòng có chức năng phụ thuộc cách người chơi vận hành.

### Dungeon Shop

Cửa hàng bên trong hầm ngục.

Mạo hiểm giả có thể mua:

- Thuốc hồi HP.
- Thuốc hồi Mana.
- Vũ khí.
- Giáp.
- Phụ kiện.
- Túi đồ.
- Vật phẩm phép thuật.
- Cuộn giấy dịch chuyển.
- Bản đồ hoặc thông tin.

Lưu ý: Charm không phải trang bị. Cửa hàng có thể bán vật phẩm hoặc dịch vụ có khả năng ban Charm, nhưng không bán Charm dưới dạng phụ kiện đeo thông thường.

Người chơi quyết định:

- Hàng hóa.
- Giá.
- Tồn kho.
- Chủ cửa hàng.
- Quyền truy cập.
- Có cho mạo hiểm giả mua bán hay không.

Tiền mạo hiểm giả chi trả được chuyển vào tài sản người chơi.

AI của mạo hiểm giả đánh giá:

- Nhu cầu.
- Giá.
- Số vàng.
- Dung lượng túi.
- Chất lượng trang bị hiện tại.
- Giá trị của món hàng.
- Mức nguy hiểm.
- Độ tin cậy cửa hàng.

Cửa hàng có thể giúp mạo hiểm giả mạnh hơn nhưng đồng thời mang lại thu nhập cho người chơi.

Nếu cửa hàng được thiết lập là khu vực trung lập, các nhân vật tuân thủ quy tắc trung lập sẽ không chủ động giao chiến bên trong. Vi phạm quy tắc ảnh hưởng đến danh tiếng và độ tin cậy.

### Inn / Tavern

- Cho thuê nơi nghỉ.
- Hồi phục.
- Giao tiếp.
- Thu phí dịch vụ.

### Blacksmith

- Chế tạo.
- Sửa chữa.
- Nâng cấp trang bị.
- Có thể phục vụ mạo hiểm giả để kiếm vàng.

### Contract Room

- Thương lượng.
- Ký giao ước.
- Tuyển dụng.

### Research Laboratory

- Nghiên cứu phép thuật.
- Nghiên cứu tiến hóa.
- Phát triển công trình.

### Arena

- Tổ chức thử thách.
- Thu phí.
- Cung cấp phần thưởng.

### Warehouse

- Lưu trữ tài nguyên và trang bị.
- Phân phối đồ cho quái vật.
- Có nguy cơ bị loot.

### Trade Room

- Giao thương với NPC.
- Mua bán tài nguyên.

## 6.5. Room Data Model

Các thuộc tính tối thiểu:

- id
- definitionId
- name
- type
- floorId
- gridPosition
- size
- entrances
- assignedCreatures
- occupants
- structures
- traps
- items
- inventory
- effects
- accessPolicy
- interactionRules
- durability
- operationalState
- ownerFaction
- discoveryState

Room phải hỗ trợ nhiều loại tương tác, không chỉ là khu vực chiến đấu.

---

# 7. CARD SYSTEM

Game kết hợp Deck Building và Consumable Cards.

## 7.1. Blueprint Cards

Bản thiết kế được sở hữu lâu dài.

Ví dụ:

- Phòng đá.
- Hành lang.
- Phòng bẫy.
- Cửa hàng.
- Nghĩa địa.
- Cầu thang.
- Công trình đặc biệt.
- Công thức chế tạo.

Sau khi sử dụng, thẻ có thể quay lại bộ bài hoặc chồng bài bỏ.

Xây dựng vẫn tốn tài nguyên.

## 7.2. Consumable Cards

Thẻ chỉ sử dụng một lần.

Ví dụ:

- Triệu hồi Goblin.
- Trứng rồng.
- Vũ khí hiếm.
- Nguyên liệu.
- Bẫy độc nhất.
- Cổ vật.
- Nghi thức ban Charm.
- Vật phẩm đặc biệt.

Sau khi sử dụng, thẻ bị tiêu hao.

## 7.3. Fate Cards

Thẻ định mệnh tạo hiệu ứng hoặc sự kiện.

Có ba loại:

- Có lợi.
- Bất lợi.
- Đánh đổi.

Ví dụ:

**Lễ Hội Goblin:** Tăng EXP Goblin.

**Kho Báu Bị Nguyền:** Tăng phần thưởng, thu hút đoàn mạnh hơn.

**Cuộc Thánh Chiến:** Xuất hiện tổ đội tinh anh.

**Khế Ước Của Rồng:** Nhận trứng rồng, tăng chi phí duy trì.

**Kẻ Phản Bội:** Một phần thông tin hầm ngục bị tiết lộ.

**Mạch Linh Lực Cổ Đại:** Một phòng trở thành nguồn Mana.

**Khe Nứt:** Mở lối vào mới.

**Phúc Lành:** Một số cư dân đủ điều kiện nhận Charm Ban Phước.

**Lời Nguyền:** Một cá thể có thể nhận Charm bất lợi theo điều kiện sự kiện.

Hai phương thức chọn:

- Blind Fate: Chọn lá bài úp.
- Known Contract: Biết lợi ích và bất lợi trước khi chọn.

## 7.4. Card Packs

Sử dụng vàng kiếm được trong game.

Các gói:

- Architecture Pack.
- Monster Pack.
- Defense Pack.
- Equipment Pack.
- Magic Pack.
- Mystery Pack.

Ngoài mở gói, có cửa hàng mua thẻ riêng lẻ.

Không để người chơi bị kẹt tiến trình chỉ vì không rút được hành lang hoặc phòng cơ bản.

---

# 8. ENTITY SYSTEM

Mọi quái vật, mạo hiểm giả và chủ nhân sử dụng chung một hệ thống Entity.

## 8.1. Thông tin cơ bản

- id
- name
- species
- class
- faction
- level
- experience
- evolutionStage
- position
- floorId
- roomId
- lifeState

LifeState:

- ACTIVE
- DOWNED
- RECOVERING
- DEAD
- RECONSTRUCTING

## 8.2. Chỉ số

- maxHP
- currentHP
- maxMana
- currentMana
- stamina
- attack
- defense
- magicAttack
- magicDefense
- attackSpeed
- movementSpeed
- accuracy
- dodge
- criticalChance
- perception
- carryCapacity
- resistances

Các chỉ số cuối cùng được tính từ:

- Chỉ số chủng loại.
- Level.
- Nghề nghiệp.
- Tiến hóa.
- Trang bị.
- Charm.
- Buff/debuff.
- Hiệu ứng môi trường.

Không phải tất cả sinh vật đều có đầy đủ chỉ số.

## 8.3. Tính cách — Personality

Mỗi cá thể có các giá trị từ 0–1:

- Courage.
- Greed.
- Curiosity.
- Aggression.
- Caution.
- Altruism.
- Loyalty.
- Discipline.
- Ambition.
- Intelligence.

Personality là xu hướng hành vi cơ bản.

Charm là đặc tính đặc biệt có hiệu ứng rõ ràng lên chỉ số, hành vi hoặc quy tắc gameplay.

Hai hệ thống có thể tương tác nhưng không được gộp thành một.

## 8.4. Nhu cầu

Tùy chủng loại:

- Hunger.
- Fatigue.
- Safety.
- Social.
- Training.
- Mana Recovery.
- Territory.
- Wealth.
- Equipment Maintenance.

## 8.5. Các thành phần khác

- Skills.
- Inventory.
- Equipment.
- Charms.
- StatusEffects.
- Relationships.
- Memories.
- Knowledge.
- CurrentMission.
- CurrentOrders.
- CurrentAction.
- AIState.
- EvolutionCandidates.

Mỗi Entity có ID cố định để duy trì danh tính qua các màn, hồi sinh và tiến hóa.

---

# 9. CHARM SYSTEM — ĐẶC TÍNH NỘI TẠI

## 9.1. Định nghĩa

Charm KHÔNG phải vật phẩm trang bị, bùa hộ mệnh hoặc phụ kiện.

Charm là những đặc tính nội tại, phúc lành, lời nguyền, bản năng hoặc năng lực đặc biệt của nhân vật.

Tương đương với hệ thống Traits hoặc Perks trong RPG, nhưng tên gọi chính thức trong game là Charm.

Cả quái vật, mạo hiểm giả và chủ nhân đều có thể sở hữu Charm.

Một nhân vật có thể:

- Không có Charm.
- Có một Charm.
- Có nhiều Charm.
- Có Charm tốt.
- Có Charm xấu.
- Có Charm vừa tốt vừa xấu.

Charm không chiếm ô túi đồ.

Charm không chiếm ô trang bị.

Charm không thể bị loot như vũ khí hoặc giáp.

Charm không biến mất chỉ vì nhân vật thay trang bị.

## 9.2. Phân loại

### Positive Charm

Đặc tính chủ yếu có lợi.

### Negative Charm

Đặc tính chủ yếu bất lợi.

### Mixed Charm

Có cả lợi ích và hạn chế.

### Conditional Charm

Chỉ kích hoạt khi đáp ứng điều kiện.

Một Charm có thể thuộc nhiều nhóm về cơ chế.

## 9.3. Số lượng và độ hiếm

Số lượng Charm không cố định giống nhau cho mọi cá thể.

Ví dụ:

- Goblin bình thường: 0–1 Charm.
- Goblin đặc biệt: 2–3 Charm.
- Hiệp sĩ kỳ cựu: 1–4 Charm.
- Anh hùng huyền thoại: Có thể sở hữu nhiều Charm.
- Quái vật yếu: Vẫn có khả năng sinh ra với Charm hiếm.

Đây là phân bố thử nghiệm, không phải giới hạn tuyệt đối.

Độ hiếm Charm đề xuất:

- Common.
- Uncommon.
- Rare.
- Epic.
- Legendary.
- Mythic.

Độ hiếm không đồng nghĩa với sức mạnh tuyệt đối.

Một Charm hiếm có thể là lời nguyền rất bất lợi.

## 9.4. Danh sách Charm ban đầu

### BAN PHƯỚC — BLESSED

Loại: Positive.

Hiệu ứng đề xuất:

- Tăng một số chỉ số cơ bản.
- Tăng khả năng kháng ma thuật hắc ám.

Có thể xuất hiện ở mạo hiểm giả, sinh vật linh thiêng hoặc quái vật nhận phúc lành.

### BẠO LỰC — VIOLENT

Loại: Positive / Mixed.

Hiệu ứng:

- Gây sát thương vật lý cao hơn.
- Có thể tăng điểm Utility cho hành động tấn công.

Ví dụ cân bằng: +20% sát thương vật lý.

Không bắt buộc nhân vật phải luôn tấn công.

### SỢ HÃI — FEARFUL

Loại: Mixed.

Hiệu ứng:

- Dễ hoảng sợ hơn khi gặp nguy hiểm.
- Tăng điểm Utility của hành động rút lui.
- Khi HP thấp, tốc độ di chuyển tăng.

Ví dụ: Khi HP dưới 30%, tăng 25% tốc độ di chuyển.

Một mạo hiểm giả có Charm này có thể nhanh chóng bỏ chạy cùng chiến lợi phẩm.

### KẺ BỊ RUỒNG BỎ — FORSAKEN

Loại: Negative.

Hiệu ứng chính:

- Không thể nhận hồi máu HP.

Hệ thống Healing phải kiểm tra Charm này trước khi áp dụng hiệu ứng.

Quy tắc đề xuất: Chặn phép hồi máu, thuốc hồi máu, phòng hồi máu và hồi phục tự nhiên.

Hồi sinh là một cơ chế riêng và vẫn có thể hoạt động, trừ khi có thêm đặc tính ngăn hồi sinh.

Utility AI phải biết bản thân không thể nhận hồi máu để tránh lãng phí thuốc hoặc chạy đến phòng hồi phục vô ích.

### CUỒNG CHIẾN — BATTLE FRENZY

Loại: Positive / Conditional.

Hiệu ứng:

- Càng chiến đấu lâu càng mạnh.
- Tích lũy sức mạnh trong thời gian duy trì giao chiến.

Ví dụ cân bằng:

- Mỗi 5 giây giao chiến: +5% sát thương.
- Tối đa 8 cộng dồn.
- Cộng dồn giảm dần khi rời chiến đấu.

Có thể ảnh hưởng cả Attack Speed tùy biến thể.

### THAM LAM — GREEDY

Loại: Mixed.

Hiệu ứng:

- Tăng ưu tiên loot.
- Tăng mong muốn sở hữu vật phẩm giá trị.
- Có thể làm nhân vật tách khỏi đội hình.
- Có thể tăng ưu tiên rút lui khi đang mang nhiều đồ quý.

### KIÊN CƯỜNG — RESILIENT

Loại: Positive.

Hiệu ứng:

- Tăng phòng thủ hoặc kháng hiệu ứng bất lợi.
- Giảm khả năng hoảng loạn.

### Ý CHÍ BẤT KHUẤT — UNBREAKABLE WILL

Loại: Positive.

Hiệu ứng:

- Tăng khả năng kháng thôi miên và thống trị.
- Giảm tác động của hiệu ứng sợ hãi.

### PHÁP SƯ THIÊN BẨM — MAGIC PRODIGY

Loại: Positive.

Hiệu ứng:

- Tăng sức mạnh phép thuật.
- Có thể giảm chi phí Mana.
- Tăng Utility của những hướng tiến hóa hoặc chuyển chức phép thuật.

### CƠ THỂ MONG MANH — FRAGILE

Loại: Negative.

Hiệu ứng:

- Giảm Max HP hoặc phòng thủ.
- Tăng nguy cơ gặp bất lợi trong giao chiến trực tiếp.

### KẺ ĐƠN ĐỘC — LONER

Loại: Mixed.

Hiệu ứng:

- Có lợi khi hoạt động một mình.
- Giảm xu hướng tập hợp đội.
- Có thể giảm hiệu quả phối hợp tổ đội.

### BẢO HỘ — GUARDIAN

Loại: Positive / Conditional.

Hiệu ứng:

- Tăng khả năng phòng thủ khi bảo vệ đồng đội.
- Tăng Utility của hành động cứu viện hoặc bảo vệ.

### KẺ SĂN KHO BÁU — TREASURE HUNTER

Loại: Positive.

Hiệu ứng:

- Tăng khả năng phát hiện rương và phòng bí mật.
- Đánh giá chiến lợi phẩm tốt hơn.

Không cho phép nhìn thấy thông tin chưa khám phá một cách vô điều kiện.

### KẺ PHÁ TRANG BỊ — SUNDERER

Loại: Positive / Conditional.

Hiệu ứng:

- Những đòn đánh phù hợp có thể làm giảm độ bền trang bị đối phương.
- Tăng Utility của kỹ năng phá trang bị khi mục tiêu có đồ giá trị.

### BẤT TỬ KHÔNG TRỌN VẸN — IMPERFECT IMMORTALITY

Loại: Mixed / Rare.

Hiệu ứng:

- Có khả năng tự tái tạo nếu điểm liên kết còn tồn tại.
- Cần thời gian phục hồi dài hoặc chịu hạn chế khác.

### THÍCH NGHI — ADAPTIVE

Loại: Positive.

Hiệu ứng:

- Tăng khả năng học kỹ năng hoặc thích nghi môi trường.
- Có thể mở thêm hướng tiến hóa.

## 9.5. Charm ảnh hưởng Utility AI

Charm có thể sửa đổi:

- Điểm Utility của một hành động.
- Điều kiện hành động có được phép thực hiện hay không.
- Mức độ nguy hiểm nhân vật cảm nhận.
- Ưu tiên mục tiêu.
- Hành vi rút lui.
- Khả năng kháng hiệu ứng.
- Lựa chọn tiến hóa.
- Cách đánh giá trang bị.
- Sự phối hợp tổ đội.

Ví dụ:

Goblin có Fearful và Guardian.

Khi đồng đội gặp nguy hiểm:

- Fearful tăng điểm rút lui.
- Guardian tăng điểm bảo vệ đồng đội.

Utility AI phải cân nhắc cả hai, cùng HP, tình hình chiến đấu, tính cách và mệnh lệnh.

Không được dùng Charm như một câu lệnh cố định ép nhân vật thực hiện hành động trong mọi tình huống.

## 9.6. Charm tương tác với nhau

Cho phép Charm có hiệu ứng đối lập.

Ví dụ:

**Sợ Hãi + Cuồng Chiến:** Nhân vật mạnh dần khi chiến đấu nhưng có thể bỏ chạy nếu HP quá thấp.

**Ban Phước + Kẻ Bị Ruồng Bỏ:** Nhận thêm chỉ số và kháng hắc ám nhưng vẫn không thể hồi HP.

**Bạo Lực + Bảo Hộ:** Một chiến binh gây sát thương cao và thích bảo vệ đồng đội.

**Tham Lam + Sợ Hãi:** Một mạo hiểm giả loot nhiều, sau đó tìm cách thoát sớm khi gặp nguy hiểm.

Quy tắc cấm tuyệt đối có ưu tiên cao hơn buff thông thường.

Ví dụ Forsaken phải chặn hồi máu dù nhân vật có Charm tăng hiệu quả hồi phục.

## 9.7. Nguồn nhận Charm

Charm có thể đến từ:

- Sinh ra với đặc tính ngẫu nhiên.
- Chủng loại.
- Nghề nghiệp.
- Tiến hóa.
- Sự kiện định mệnh.
- Phúc lành.
- Lời nguyền.
- Cổ vật hoặc nghi thức đặc biệt.
- Thành tựu.
- Trải nghiệm lâu dài.
- Điều kiện hiếm.

Ví dụ:

Một Goblin sống sót qua nhiều trận khó có thể đạt điều kiện nhận Kiên Cường.

Một mạo hiểm giả được thần điện ban phước có thể nhận Blessed.

Không tự động cấp Charm mới sau mọi trận chiến.

## 9.8. Charm và tiến hóa

Charm có thể:

- Mở khóa nhánh tiến hóa.
- Tăng điểm Utility của nhánh tiến hóa.
- Thay đổi hiệu ứng sau tiến hóa.
- Được giữ lại.
- Nâng cấp thành Charm mạnh hơn nếu có điều kiện.

Charm mặc định được giữ khi tiến hóa hoặc hồi sinh.

Chỉ mất hoặc thay đổi khi có quy tắc đặc biệt được định nghĩa rõ ràng.

## 9.9. Charm Data Model

CharmDefinition:

- id
- name
- description
- rarity
- category
- tags
- allowedSpecies
- statModifiers
- utilityModifiers
- actionRestrictions
- eventHooks
- activationConditions
- stackingRules
- conflicts
- acquisitionRules
- removalRules

CharmInstance:

- definitionId
- source
- acquiredAt
- rank
- runtimeStacks
- runtimeState

Charm phải được xây dựng theo hướng data-driven để thêm Charm mới mà không sửa hệ thống AI chính.

RuntimeStacks chỉ dùng cho Charm có cơ chế cộng dồn, chẳng hạn Battle Frenzy.

---

# 10. STATUS EFFECTS — PHÂN BIỆT BUFF/DEBUFF VÀ CHARM

Charm là đặc tính tương đối lâu dài.

Status Effect là hiệu ứng có trạng thái và thời gian tồn tại riêng.

Ví dụ Status Effects:

- Poisoned.
- Burning.
- Frozen.
- Stunned.
- Slowed.
- Shielded.
- Regeneration.
- Hypnotized.
- Silenced.
- Fear.

Ví dụ:

Fearful là Charm làm nhân vật dễ sợ hãi.

Fear là Status Effect tạm thời có thể xuất hiện khi nhân vật gặp nguy hiểm hoặc trúng phép.

Battle Frenzy là Charm.

Sức mạnh cộng dồn do Battle Frenzy tạo ra là trạng thái runtime hoặc buff phát sinh.

Không được nhầm lẫn hai hệ thống.

---

# 11. ITEM SYSTEM — VẬT PHẨM

Vật phẩm tồn tại vật lý trong thế giới game.

Có thể nằm trong túi, trên người nhân vật, trong rương, kho, cửa hàng hoặc trên mặt đất.

Mỗi vật phẩm có chủ sở hữu hoặc vị trí rõ ràng.

## 11.1. Phân loại

### Weapons

- Kiếm.
- Rìu.
- Giáo.
- Cung.
- Trượng phép.
- Dao găm.
- Vũ khí ma thuật.

### Armor

- Mũ.
- Giáp ngực.
- Giáp tay.
- Giáp chân.
- Khiên.
- Áo choàng.

### Accessories

- Nhẫn.
- Dây chuyền.
- Phụ kiện.
- Trang bị ma thuật.

Accessories là vật phẩm trang bị, không phải Charm.

### Consumables

- Thuốc hồi HP.
- Thuốc hồi Mana.
- Thuốc giải hiệu ứng.
- Thức ăn.
- Cuộn giấy phép thuật.
- Cuộn giấy dịch chuyển.

### Materials

- Quặng.
- Tinh thể Mana.
- Xương.
- Nguyên liệu chế tạo.
- Nguyên liệu tiến hóa.

### Containers

- Túi nhỏ.
- Túi thường.
- Ba lô lớn.
- Túi không gian.

### Quest Items / Relics

- Chìa khóa.
- Cổ vật.
- Vật phẩm nhiệm vụ.
- Vật phẩm đặc biệt.

### Treasure

- Vàng.
- Đá quý.
- Kho báu phụ.
- Kho báu chính.

## 11.2. Độ hiếm trang bị

| Độ hiếm | Đặc điểm |
|---|---|
| Common | Chỉ số cơ bản |
| Uncommon | Chỉ số tốt hơn |
| Rare | Có hiệu ứng đặc biệt |
| Epic | Nhiều hiệu ứng hoặc cơ chế riêng |
| Legendary | Sức mạnh đặc biệt, có danh tính |
| Mythic | Vật phẩm độc nhất hoặc thay đổi gameplay |

Độ hiếm ảnh hưởng:

- Giá trị.
- Chất lượng.
- Affix.
- Hiệu ứng đặc biệt.
- Khả năng sửa chữa.
- Mức độ mạo hiểm giả muốn loot.

Không phải trang bị hiếm luôn phù hợp hơn trang bị thường.

Một cây trượng Legendary có thể vô ích với Goblin không biết dùng phép.

## 11.3. Item Data Model

- id
- definitionId
- name
- category
- rarity
- itemLevel
- value
- weight
- slotCost
- stackable
- stackLimit
- quantity
- durability
- maxDurability
- equipmentSlot
- statModifiers
- affixes
- effects
- requirements
- ownerId
- location
- history

Mỗi ItemInstance có đúng một vị trí sở hữu tại một thời điểm.

Không sao chép ItemInstance khi chuyển giữa túi, kho và mặt đất.

---

# 12. INVENTORY SYSTEM — TÚI ĐỒ

## 12.1. Túi của mạo hiểm giả

Mỗi mạo hiểm giả có túi đồ riêng.

Dung lượng túi khác nhau tùy loại, chủng tộc và trang bị.

Ví dụ:

| Loại túi | Số ô thử nghiệm |
|---|---:|
| Túi nhỏ | 6 |
| Túi thường | 12 |
| Ba lô lớn | 20 |
| Túi không gian | 40 |

Vật phẩm có thể chiếm một hoặc nhiều ô.

Vật phẩm cùng loại có thể xếp chồng nếu hỗ trợ stack.

Ngoài số ô, có thể sử dụng trọng lượng để giới hạn khả năng mang đồ.

Phiên bản đầu có thể chỉ sử dụng số ô, bổ sung trọng lượng sau.

Trang bị đang mặc được lưu ở Equipment Slots, không chiếm ô túi thông thường, nhưng vẫn có thể tính vào trọng lượng nếu sử dụng hệ thống trọng lượng.

## 12.2. Khi túi đầy

Mạo hiểm giả không thể nhặt đồ vô hạn.

Utility AI phải đánh giá các lựa chọn:

1. Không nhặt vật phẩm mới.
2. Sử dụng một vật phẩm tiêu hao đang có.
3. Thay thế vật phẩm giá trị thấp.
4. Đổi trang bị đang sử dụng.
5. Đưa đồ cho đồng đội còn chỗ.
6. Bán đồ tại cửa hàng.
7. Mua túi lớn hơn.
8. Cất đồ tại một vị trí an toàn nếu có cơ chế.
9. Rút lui và mang chiến lợi phẩm về.

Ví dụ:

Ren có túi 6/6 ô.

Trong túi:

- Hai thuốc hồi HP.
- Một cuộn giấy dịch chuyển.
- Một nguyên liệu Common.
- Một dao găm Rare.
- Một cổ vật Epic.

Ren phát hiện một thanh kiếm Legendary cần hai ô.

AI phải đánh giá giá trị thanh kiếm, khả năng sử dụng, nguy cơ hiện tại và tầm quan trọng của những đồ đang giữ.

Ren có thể bỏ nguyên liệu và dao găm để lấy thanh kiếm.

Hoặc giữ cuộn giấy dịch chuyển vì nó có giá trị sống còn.

Hoặc yêu cầu đồng đội mang thanh kiếm.

## 12.3. Đánh giá giá trị vật phẩm

Giá trị Utility của vật phẩm không chỉ dựa vào giá vàng.

Các yếu tố:

- Giá bán.
- Độ hiếm.
- Phù hợp nghề nghiệp.
- Chỉ số.
- Nhu cầu hiện tại.
- Giá trị chiến đấu.
- Giá trị nhiệm vụ.
- Số ô chiếm dụng.
- Trọng lượng.
- Độ bền.
- Khả năng sử dụng.
- Tính cách.
- Charm.
- Nguy cơ mất vật phẩm.

Ví dụ:

Một tu sĩ hết Mana đánh giá thuốc hồi Mana cao hơn một vũ khí Epic không sử dụng được.

Một Rogue tham lam có thể đánh giá cổ vật đắt tiền cao hơn thuốc hồi phục, nhưng vẫn phải cân nhắc khả năng sống sót.

## 12.4. Loot Policy

Nhân vật phải có khả năng nhận biết vật phẩm và quyền tương tác.

Không được nhặt đồ từ khoảng cách vô lý.

Loot cần thời gian tương tác nếu vật phẩm nằm trong rương hoặc cần mở khóa.

Khi nhiều NPC cùng muốn nhặt một vật phẩm, sử dụng hệ thống reservation hoặc kiểm tra lại quyền sở hữu để tránh nhân bản đồ.

## 12.5. Chuyển vật phẩm giữa đồng đội

Các thành viên có thể:

- Chia thuốc.
- Chuyển nguyên liệu.
- Chia chiến lợi phẩm.
- Đưa trang bị cho người phù hợp.
- Chuyển kho báu chính cho nhân vật có khả năng thoát tốt hơn.

Hành động phụ thuộc sự tin tưởng, khoảng cách, tính cách và mục tiêu tổ đội.

## 12.6. Quá tải

Nếu bổ sung trọng lượng:

- Mang quá nặng có thể giảm Movement Speed.
- Tăng tiêu hao Stamina.
- Ảnh hưởng khả năng rút lui.
- Làm AI muốn bỏ bớt đồ hoặc chuyển cho đồng đội.

Không cho AI vượt giới hạn tuyệt đối nếu vật phẩm không có cơ chế mang đặc biệt.

---

# 13. EQUIPMENT SYSTEM — TRANG BỊ

## 13.1. Equipment Slots

Ví dụ:

- Main Hand.
- Off Hand.
- Head.
- Chest.
- Legs.
- Boots.
- Accessory 1.
- Accessory 2.
- Backpack.

Các chủng loại có cấu trúc trang bị khác nhau.

Slime không nhất thiết có tay hoặc chân.

Dragon có thể sử dụng trang bị đặc biệt.

Golem có thể sử dụng bộ phận nâng cấp.

Charm KHÔNG phải Equipment Slot.

## 13.2. Quái vật sử dụng trang bị

Tùy capability của chủng loại:

- Goblin có thể loot kiếm, giáp và tự sử dụng.
- Skeleton có thể trang bị vũ khí, giáp.
- Orc có thể sử dụng trang bị nặng.
- Ghost sử dụng trang bị linh thể.
- Golem sử dụng lõi hoặc bộ phận nâng cấp.
- Slime có thể không dùng được trang bị thông thường.
- Dragon có thể dùng trang bị phù hợp kích thước.

Người chơi có thể trực tiếp cấp trang bị cho quái vật.

Có thể đặt chính sách:

- Tự động trang bị đồ tốt hơn.
- Giữ nguyên trang bị hiện tại.
- Không sử dụng đồ hiếm.
- Chỉ sử dụng đồ được cấp phép.

## 13.3. Tự đánh giá trang bị

AI đánh giá trang bị dựa trên:

- Nghề nghiệp.
- Kỹ năng.
- Chỉ số.
- Charm.
- Độ bền.
- Hiệu ứng đặc biệt.
- Khả năng sử dụng.
- Vai trò tổ đội.

Một Goblin Shaman có thể chọn trượng Rare thay vì kiếm Legendary nếu trượng phù hợp hơn.

## 13.4. Độ bền

Trang bị có Durability.

Độ bền giảm do:

- Sử dụng.
- Chiến đấu.
- Hiệu ứng môi trường.
- Kỹ năng phá trang bị.
- Một số loại quái vật.

Khi độ bền thấp:

- Chỉ số có thể giảm.
- AI muốn sửa chữa hoặc thay thế.

Khi độ bền bằng 0:

- Trang bị chuyển sang trạng thái Broken.
- Không thể sử dụng hiệu quả.
- Có thể sửa chữa tùy vật phẩm.

Một số hiệu ứng đặc biệt có thể phá hủy hoặc hấp thụ vật phẩm hoàn toàn nếu được định nghĩa rõ.

## 13.5. Quái vật phá trang bị

Một số quái vật có khả năng chuyên biệt.

### Acid Slime

Có thể làm giảm độ bền của giáp hoặc vật phẩm khi sử dụng kỹ năng phù hợp.

### Rust Monster

Ưu tiên tác động đến trang bị kim loại.

### Golem

Một số kỹ năng mạnh có thể gây hư hại trang bị.

### Mimic

Có thể tương tác hoặc giữ vật phẩm theo khả năng riêng.

### Dragon

Một số hiệu ứng nguyên tố có thể gây hư hại vật phẩm.

Trang bị Legendary hoặc Mythic không mặc định bất hoại.

Chúng có thể có khả năng kháng hư hại, cơ chế bảo vệ hoặc giới hạn phá hủy riêng.

## 13.6. Trang bị có lịch sử

Trang bị có thể ghi lại:

- Chủ nhân trước.
- Số cuộc chiến.
- Số lần sửa chữa.
- Người đã loot nó.
- Những sự kiện quan trọng.

Một món đồ bị mạo hiểm giả lấy mất có thể xuất hiện lại trong cuộc thám hiểm tương lai.

---

# 14. MONSTER SYSTEM

## 14.1. Quái vật là cá thể độc lập

Mỗi quái vật có:

- Danh tính.
- Level.
- EXP.
- Charm.
- Personality.
- Inventory nếu có khả năng.
- Equipment nếu tương thích.
- Skills.
- Memories.
- Relationships.
- Evolution Path.
- Loyalty.

Hai Goblin cùng cấp độ có thể có hành vi và hướng phát triển khác nhau.

## 14.2. Chủng loại ban đầu

### Goblin

- Hoạt động nhóm.
- Sử dụng trang bị.
- Loot.
- Nhiều hướng tiến hóa.
- Dễ bị ảnh hưởng bởi tinh thần.

### Skeleton

- Không cần ăn.
- Ít bị ảnh hưởng bởi sợ hãi cơ bản.
- Sử dụng trang bị.
- Tái tạo tại nghĩa địa.

### Slime

- Hấp thụ vật phẩm hoặc năng lượng.
- Có thể làm hỏng trang bị.
- Tái tạo hoặc phân chia tùy loại.
- Hạn chế sử dụng trang bị thông thường.

### Golem

- Phòng thủ cao.
- Phụ thuộc lõi.
- Sửa chữa bằng nguyên liệu.
- Có thể dùng bộ phận nâng cấp.

### Ghost

- Tồn tại dưới dạng linh thể.
- Liên kết với công trình hoặc điểm linh hồn.
- Tái tạo theo thời gian.

### Orc

- Mạnh về chiến đấu trực tiếp.
- Sử dụng trang bị nặng.
- Có thể phát triển thành thủ lĩnh.

### Dragon

- Sức mạnh lớn.
- Bảo vệ lãnh thổ.
- Quan tâm kho báu.
- Chi phí hồi sinh cao.

Các chủng mở rộng:

Mimic, Vampire, Werewolf, Demon, Elemental, Giant Spider, Lich.

## 14.3. Capability System

Mỗi chủng loại có các khả năng:

- canLoot
- canCarryItems
- canUseConsumables
- canEquipWeapons
- canEquipArmor
- canEquipAccessories
- canDamageEquipment
- canAbsorbItems
- canRepairItems
- canTrade
- canCommunicate
- canOpenDoors
- canUseMagic

AI chỉ tạo hành động phù hợp capability.

Charm không bị giới hạn bởi khả năng mang túi hoặc mặc trang bị.

Một Slime không thể mặc giáp vẫn có thể sở hữu Charm.

## 14.4. Mệnh lệnh

Người chơi có thể giao:

- Guard.
- Patrol.
- Defend.
- Pursue.
- Ambush.
- Retreat.
- Recover.
- Protect Treasure.
- Rescue Ally.
- Train.
- Repair.
- Work.
- Trade.

Mệnh lệnh điều chỉnh ưu tiên Utility.

Quái vật vẫn có thể đánh giá tình huống dựa trên tính cách, lòng trung thành và Charm.

---

# 15. EVOLUTION SYSTEM — TỰ TIẾN HÓA

## 15.1. Nguyên tắc

Quái vật tự quyết định hướng tiến hóa mà chúng cho là có lợi nhất cho bản thân.

Người chơi không trực tiếp chọn mọi nhánh tiến hóa.

Utility AI đánh giá các hướng đã mở khóa.

## 15.2. Điều kiện mở khóa

- Level.
- EXP.
- Chủng loại.
- Kỹ năng.
- Charm.
- Trang bị.
- Môi trường sống.
- Lịch sử chiến đấu.
- Hành vi thường xuyên.
- Mục tiêu cá nhân.
- Công trình.
- Nguyên liệu tiến hóa.

## 15.3. Ví dụ cây tiến hóa

Goblin có thể phát triển thành:

- Goblin Warrior.
- Goblin Archer.
- Goblin Rogue.
- Goblin Shaman.
- Hobgoblin.

Các nhánh tiếp theo:

Goblin Warrior → Goblin Champion → Goblin King.

Goblin Archer → Goblin Ranger.

Goblin Rogue → Goblin Assassin.

Goblin Shaman → Goblin High Shaman → Goblin Archmage.

Hobgoblin → Hobgoblin Warlord.

## 15.4. Evolution Utility

Mỗi Evolution Candidate được đánh giá theo:

- Sức mạnh dự kiến.
- Khả năng sống sót.
- Phù hợp tính cách.
- Phù hợp Charm.
- Phù hợp trang bị.
- Phù hợp kỹ năng.
- Vai trò.
- Môi trường.
- Chi phí.
- Nhu cầu cá nhân.

Ví dụ Grek:

- Cấp 10.
- Thường xuyên dùng kiếm.
- Có Charm Bạo Lực.
- Có Charm Cuồng Chiến.
- Thích bảo vệ đồng đội.

Điểm tiến hóa:

- Warrior: 0.92.
- Shaman: 0.21.
- Rogue: 0.45.
- Archer: 0.37.

Grek chọn Warrior.

Một Goblin có Magic Prodigy, Mana cao và thường xuyên luyện phép có thể chọn Shaman.

## 15.5. Người chơi tác động gián tiếp

Người chơi có thể:

- Cấp trang bị.
- Giao nhiệm vụ.
- Bố trí phòng huấn luyện.
- Cung cấp nguyên liệu.
- Nghiên cứu.
- Ban Charm thông qua cơ chế đặc biệt.
- Khuyến khích một hướng phát triển.

Quyết định cuối cùng thuộc về AI của quái vật.

Quái vật chỉ được tiêu tài nguyên tiến hóa từ kho nếu có quyền sử dụng.

Nếu thiếu điều kiện, có thể trì hoãn.

## 15.6. Duy trì danh tính

Sau tiến hóa:

- Giữ Entity ID.
- Giữ tên.
- Giữ ký ức.
- Giữ quan hệ.
- Giữ Charm mặc định.
- Giữ kỹ năng tương thích.
- Cập nhật chỉ số.
- Cập nhật ngoại hình.
- Kiểm tra tương thích trang bị.

Trang bị không còn sử dụng được chuyển vào túi hoặc kho.

Nếu không đủ chỗ, đặt vật phẩm xuống vị trí hợp lệ.

Không tự động xóa vật phẩm.

---

# 16. ADVENTURER SYSTEM

## 16.1. Mạo hiểm giả tồn tại lâu dài

Mạo hiểm giả là NPC có hồ sơ riêng.

Một người sống sót có thể quay trở lại ở màn sau với:

- Level cao hơn.
- Trang bị mới.
- Charm mới nếu đạt điều kiện.
- Kỹ năng mới.
- Kiến thức về hầm ngục.
- Tổ đội mới.

## 16.2. Nghề nghiệp

### Knight

- Đỡ đòn.
- Bảo vệ đồng đội.
- Giữ tuyến trước.
- Hỗ trợ rút lui.

### Mage

- Phép thuật.
- Tấn công tầm xa.
- Phá giải ma thuật.
- Dịch chuyển.

### Rogue

- Loot.
- Mở khóa.
- Phát hiện bẫy.
- Tìm phòng bí mật.
- Ẩn thân.

### Priest

- Hồi phục.
- Thanh tẩy.
- Kết giới.
- Cứu đồng đội.
- Hồi sinh nếu có kỹ năng.

### Ranger

- Trinh sát.
- Tấn công tầm xa.
- Theo dõi.
- Phát hiện nguy hiểm.

### Summoner

- Triệu hồi sinh vật.
- Dùng linh thú trinh sát.

### Berserker

- Chiến đấu trực tiếp.
- Sức mạnh cận chiến.
- Có thể sở hữu các Charm phù hợp giao chiến lâu dài.

## 16.3. Chuyển chức

Ví dụ:

- Knight → Paladin.
- Mage → Archmage.
- Rogue → Master Rogue.
- Priest → High Priest.
- Ranger → Beast Master.

Có thể sử dụng Utility AI để lựa chọn nghề nghiệp nâng cao dựa trên kỹ năng, Charm và mục tiêu.

## 16.4. Nhiệm vụ

Không phải đoàn nào cũng muốn kho báu chính.

Nhiệm vụ có thể là:

- Khám phá tầng.
- Lập bản đồ.
- Thu thập nguyên liệu.
- Săn quái vật.
- Tìm cổ vật.
- Lấy trang bị.
- Mua vật phẩm.
- Giải cứu đồng đội.
- Đánh bại Boss.
- Lấy kho báu trung tâm.

Khi nhiệm vụ hoàn thành, AI phải cân nhắc rút lui.

## 16.5. Tổ đội

Party chứa:

- id
- leaderId
- members
- sharedMission
- sharedKnowledge
- formation
- currentStrategy
- retreatPlan

Leader chọn mục tiêu chung.

Mỗi thành viên có Utility AI riêng.

Thành viên có thể tuân thủ, đề xuất, hỗ trợ, tách đội hoặc tự rút lui tùy hoàn cảnh.

---

# 17. COMBAT SYSTEM

## 17.1. Chiến đấu thời gian thực

Phong cách Dungeon Crawler top-down.

Các nhân vật có thể:

- Di chuyển.
- Tấn công cận chiến.
- Tấn công tầm xa.
- Thi triển phép.
- Né tránh.
- Chặn đòn.
- Sử dụng vật phẩm.
- Hỗ trợ.
- Rút lui.

## 17.2. Damage Types

Ví dụ:

- Physical.
- Fire.
- Ice.
- Lightning.
- Holy.
- Dark.
- Poison.
- Arcane.

Hệ thống sát thương tính đến:

- Chỉ số.
- Trang bị.
- Charm.
- Kỹ năng.
- Phòng thủ.
- Kháng nguyên tố.
- Status Effects.
- Hiệu ứng môi trường.

## 17.3. Skill System

SkillDefinition:

- id
- name
- damageType
- range
- manaCost
- staminaCost
- cooldown
- castTime
- targetingRules
- effects
- areaOfEffect
- interruptRules
- requirements

AI chỉ chọn Skill hợp lệ.

Ví dụ không dùng phép nếu thiếu Mana, đang hồi chiêu hoặc bị hiệu ứng cấm thi triển.

## 17.4. Không xuyên vật cản vô lý

Projectile và nhân vật phải tuân theo:

- Va chạm.
- Line of Sight.
- Tầm đánh.
- Vật cản.
- Địa hình.
- Cửa và tường.

## 17.5. Nhân vật bị đánh bại

HP về 0 chuyển sang Downed hoặc trạng thái tương ứng với chủng loại.

Không lập tức xóa Entity.

Cho phép đồng đội cứu, hồi phục hoặc vận chuyển về nơi an toàn nếu có khả năng.

---

# 18. RECOVERY, RESURRECTION AND REGENERATION

## 18.1. Hồi phục sau màn

Quái vật sống sót tự hồi một phần HP.

Đề xuất: hồi 30% lượng HP đã mất.

Ví dụ:

Goblin có 20/100 HP.

Lượng HP đã mất: 80.

Hồi 24 HP.

Kết quả: 44/100 HP.

Hồi phục phải kiểm tra chủng loại và Charm.

Forsaken không nhận hồi HP nếu quy tắc của Charm chặn nguồn hồi phục đó.

## 18.2. Phòng hỗ trợ

- Medical Room.
- Barracks.
- Nhà ăn.
- Phòng hồi Mana.
- Nghĩa địa.
- Xưởng sửa chữa.

## 18.3. Quái vật bị đánh bại

Không phải tất cả đều cần hồi sinh.

| Chủng loại | Cách trở lại |
|---|---|
| Goblin, Orc | Hồi sinh bằng tài nguyên |
| Skeleton | Tái tạo tại nghĩa địa |
| Ghost | Phục hồi tại điểm liên kết |
| Golem | Sửa chữa hoặc tái tạo cơ thể |
| Slime | Tái tạo tùy chủng loại |
| Dragon | Nghi thức hồi sinh đặc biệt |

Các hình thức tái tạo miễn phí vẫn cần thời gian hoặc công trình phù hợp.

Không cho hồi sinh vô hạn tức thời.

## 18.4. Hồi sinh giữ danh tính

Quái vật hồi sinh giữ:

- ID.
- Level.
- EXP.
- Charm.
- Kỹ năng.
- Ký ức.
- Mối quan hệ.

Trang bị chỉ được giữ nếu nó chưa bị lấy hoặc phá hủy.

## 18.5. Mạo hiểm giả

Mạo hiểm giả bị đánh bại có thể:

- Được đồng đội cứu.
- Được hồi phục.
- Được đưa ra ngoài.
- Được hồi sinh tại Công hội.
- Bị bỏ lại.
- Được chủ nhân cứu chữa.
- Trở thành mục tiêu của nhiệm vụ giải cứu.
- Thương lượng gia nhập hầm ngục.

---

# 19. RETREAT AND ESCAPE SYSTEM

Đây là hệ thống trọng tâm.

Mạo hiểm giả được phép bỏ chạy.

Người chơi phải ngăn họ mang chiến lợi phẩm và thông tin ra ngoài nếu điều đó gây bất lợi.

## 19.1. Điều kiện rút lui

Utility AI cân nhắc:

- HP.
- Mana.
- Tình trạng đồng đội.
- Mục tiêu đã hoàn thành.
- Giá trị chiến lợi phẩm.
- Túi đồ đã đầy.
- Mức nguy hiểm.
- Charm.
- Tính cách.
- Đường thoát.
- Khả năng dịch chuyển.

## 19.2. Phương thức thoát

### Normal Exit

Quay lại lối vào hoặc lối ra hợp lệ.

### Teleport Scroll

Sử dụng cuộn giấy dịch chuyển.

Có thời gian kích hoạt và điều kiện.

### Teleport Spell

Pháp sư sử dụng phép dịch chuyển nếu đủ Mana và kỹ năng.

### Portal

Mở cổng cho nhiều thành viên đi qua.

Cổng có thời gian tồn tại và sức chứa tùy kỹ năng.

### Secret Exit

Sử dụng đường bí mật đã được phát hiện.

### Special Item

Vật phẩm hồi thành hoặc năng lực đặc biệt.

## 19.3. Chống dịch chuyển

Người chơi có thể dùng:

- Anti-Teleport Rune.
- Spatial Obelisk.
- Sealing Gate.
- Surveillance Eye.
- Phép phong tỏa.

Những công trình này có thể bị vô hiệu hóa hoặc giải trừ theo quy tắc gameplay.

AI phải kiểm tra điều kiện trước khi sử dụng dịch chuyển.

## 19.4. Chiến lợi phẩm khi thoát

Nếu mạo hiểm giả thoát thành công:

- Giữ những vật phẩm đang mang.
- Tài sản đó rời khỏi quyền kiểm soát hầm ngục.
- Kiến thức có thể được báo cáo cho Công hội.

Nếu bị đánh bại trước khi thoát:

- Có thể đánh rơi chiến lợi phẩm.
- Quái vật có khả năng loot có thể thu hồi.
- Đồng đội mạo hiểm có thể nhặt lại.
- Trang bị có thể được thu hồi hoặc hư hại tùy cơ chế.

Mỗi vật phẩm chỉ có một trạng thái sở hữu hợp lệ.

Không nhân đôi phần thưởng khi thu hồi tài sản vốn thuộc người chơi.

---

# 20. MAIN TREASURE SYSTEM

Kho báu chính là mục tiêu tối thượng.

Có thể là:

- Rương cổ.
- Trái tim hầm ngục.
- Tinh thể.
- Thánh vật.
- Cổ vật độc nhất.

## 20.1. Trạng thái

- SAFE.
- DISCOVERED.
- BEING_ACQUIRED.
- STOLEN_INSIDE.
- DROPPED.
- RECOVERED.
- ESCAPED.

## 20.2. Quy tắc

Kho báu bị lấy khỏi phòng chưa làm người chơi thua.

Có thể chuyển từ mạo hiểm giả này sang người khác.

Có thể bị đánh rơi.

Quái vật có thể mang kho báu trở lại.

Chỉ chuyển Game Over khi kho báu được mang ra khỏi hầm ngục thành công.

## 20.3. Neo không gian

Đề xuất: Kho báu chính có Spatial Anchor.

Muốn mang kho báu qua dịch chuyển, mạo hiểm giả cần giải trừ neo hoặc sử dụng phương thức đặc biệt.

Không cho phép một NPC chạm vào kho báu rồi lập tức biến mất mà không có cơ hội phản ứng.

---

# 21. RECRUITMENT SYSTEM — TUYỂN DỤNG MẠO HIỂM GIẢ

Có bốn phương thức chính.

## 21.1. Hypnosis — Thôi miên

- Kiểm soát tạm thời.
- Có thời gian tồn tại.
- Có thể bị kháng hoặc thanh tẩy.
- Không tạo lòng trung thành thực sự.

## 21.2. Domination — Thống trị

- Liên kết ma thuật lâu dài.
- Tốn Mana hoặc tài nguyên duy trì.
- Nhân vật có thể chống lại nếu liên kết suy yếu.
- Charm như Unbreakable Will giúp tăng khả năng kháng.

## 21.3. Contract — Giao ước

Hai bên thỏa thuận điều khoản.

Ví dụ:

- Tiền lương.
- Quyền sử dụng thư viện.
- Quyền giữ một số vật phẩm.
- Nghĩa vụ bảo vệ hầm ngục.
- Phạm vi nhiệm vụ.

Nếu vi phạm giao ước, NPC có thể yêu cầu thương lượng lại hoặc rời đi.

## 21.4. Cooperation — Hợp tác

NPC tự nguyện gia nhập hoặc hợp tác.

Đánh giá dựa trên:

- Quan hệ.
- Lợi ích.
- Mục tiêu.
- Danh tiếng.
- Tính cách.
- Điều kiện sống.
- Lịch sử tương tác.

## 21.5. Chỉ số quan hệ

- Loyalty: Lòng trung thành tự nguyện.
- Willpower: Khả năng kháng kiểm soát.
- Bond Strength: Sức mạnh liên kết ma thuật hoặc giao ước.

Kiểm soát cao không đồng nghĩa với trung thành cao.

## 21.6. Sau khi gia nhập

Mạo hiểm giả giữ:

- Level.
- Trang bị còn sở hữu.
- Charm.
- Kỹ năng.
- Ký ức.
- Mối quan hệ.
- Tính cách.

Có thể được phân công bảo vệ, nghiên cứu, chế tạo, thương mại hoặc công việc phù hợp.

---

# 22. UTILITY AI — HỆ THỐNG TRỌNG TÂM

## 22.1. Nguyên tắc

Không sử dụng AI chiến đấu đơn giản chỉ có một trạng thái đuổi và đánh.

Cả hai phe phải đánh giá nhiều hành động và lựa chọn hành động hợp lệ có Utility cao nhất.

Utility AI không cần mô hình ngôn ngữ hoặc API AI bên ngoài.

Sử dụng hệ thống tính điểm, điều kiện và Response Curves chạy trực tiếp trong game.

## 22.2. Kiến trúc ba cấp

### Goal Layer

Xác định mục tiêu tổng thể.

Ví dụ:

- Tìm kho báu.
- Bảo vệ kho báu.
- Hoàn thành nhiệm vụ.
- Sinh tồn.
- Giải cứu.
- Phát triển bản thân.

### Strategy Layer

Xác định cách đạt mục tiêu.

Ví dụ:

- Khám phá.
- Tập hợp tổ đội.
- Giao chiến.
- Đổi đường.
- Rút lui.
- Tìm hồi phục.
- Mua vật phẩm.

### Action Layer

Thực hiện hành động cụ thể.

Ví dụ:

- Move.
- Attack.
- Cast.
- Loot.
- Heal.
- Equip.
- Drop Item.
- Trade.
- Open Door.
- Rescue.
- Escape.
- Rest.
- Train.
- Evolve.

## 22.3. AI Considerations

Thông tin đánh giá:

- HP Ratio.
- Mana Ratio.
- Stamina Ratio.
- Enemy Threat.
- Ally Strength.
- Nearby Allies.
- Target Distance.
- Inventory Fullness.
- Loot Value.
- Equipment Durability.
- Mission Progress.
- Known Exit Distance.
- Personality.
- Charms.
- Relationships.
- Current Orders.
- Environment.
- Known Information.

## 22.4. Quy trình quyết định

1. Thu thập dữ liệu cảm nhận hợp lệ.
2. Xác định mục tiêu hiện tại.
3. Tạo danh sách hành động có khả năng thực hiện.
4. Loại hành động không hợp lệ.
5. Tính Utility từng hành động.
6. Áp dụng Personality.
7. Áp dụng Charm.
8. Áp dụng mệnh lệnh.
9. Áp dụng mục tiêu và hoàn cảnh.
10. Chọn hành động có điểm cao nhất.
11. Duy trì hành động trong thời gian cam kết.
12. Đánh giá lại nếu điều kiện thay đổi.

## 22.5. Action Definition

Mỗi hành động cần:

- id
- name
- requiredCapabilities
- preconditions
- targetSelector
- considerations
- baseWeight
- utilityModifiers
- minimumCommitmentTime
- interruptionRules
- cooldown
- execute
- cancel
- complete

## 22.6. Hành động không hợp lệ

Phải bị loại hoàn toàn trước khi tính điểm cuối.

Ví dụ:

- Không đủ Mana để thi triển phép.
- Không còn thuốc để sử dụng.
- Không có đường đi.
- Không có khả năng loot.
- Túi không đủ chỗ.
- Trang bị không tương thích.
- Không thể mở cổng trong vùng phong tỏa.
- Forsaken không thể hồi HP bằng thuốc thông thường.
- Không đủ tài nguyên để tiến hóa.

AI không được liên tục thử một hành động đã biết là bất khả thi.

## 22.7. Ví dụ hành động của mạo hiểm giả

Một Rogue có:

- HP: 25%.
- Túi: 100%.
- Giá trị loot cao.
- Charm: Sợ Hãi.
- Đồng đội gặp nguy hiểm.
- Có cuộn giấy dịch chuyển.

Utility thử nghiệm:

- Continue Exploring: 0.18.
- Attack: 0.25.
- Rescue Ally: 0.42.
- Normal Retreat: 0.83.
- Teleport: 0.95.

AI chọn Teleport nếu hành động hợp lệ.

Nếu khu vực bị phong tỏa dịch chuyển, loại bỏ Teleport và chọn Normal Retreat hoặc hành động khác có điểm cao nhất.

## 22.8. Ví dụ hành động của quái vật

Goblin Warrior có:

- HP: 35%.
- Charm: Bảo Hộ và Cuồng Chiến.
- Có đồng đội bị Downed.
- Được giao bảo vệ kho báu.

AI cân nhắc:

- Attack.
- Rescue Ally.
- Protect Treasure.
- Call Reinforcement.
- Retreat.

Charm Cuồng Chiến làm giao chiến lâu dài hấp dẫn hơn.

Charm Bảo Hộ tăng ưu tiên cứu đồng đội.

Mệnh lệnh bảo vệ kho báu có thể làm Protect Treasure trở thành lựa chọn cao nhất nếu kho báu đang bị lấy.

## 22.9. Tránh AI đổi ý liên tục

Sử dụng:

- Minimum commitment time.
- Hysteresis.
- Action cooldown.
- Target reservation.
- Replanning khi có sự kiện.

Ví dụ, không đổi hành động chỉ vì điểm mới cao hơn 0.01.

Có thể sử dụng ngưỡng chênh lệch thử nghiệm 0.10 trước khi đổi hành động thông thường.

Sự kiện khẩn cấp vẫn có thể ngắt hành động ngay.

## 22.10. AI không toàn tri

Mạo hiểm giả chỉ biết:

- Những gì nhìn thấy.
- Những gì đồng đội báo.
- Những gì đã khám phá.
- Thông tin Công hội.

Không biết vị trí bẫy, phòng bí mật hoặc quái vật nếu chưa phát hiện.

Quái vật cũng có giới hạn nhận thức.

Người chơi có thể cung cấp thông tin cho quái vật thông qua hệ thống mệnh lệnh hoặc liên kết phù hợp.

## 22.11. AI Inspector

Khi chọn quái vật, hiển thị:

- Hành động hiện tại.
- Mục tiêu.
- Điểm Utility.
- Các hành động đang cân nhắc.
- Charm ảnh hưởng quyết định.
- Lý do từ chối hành động.

Ví dụ:

Grek — Protect Treasure.

Utility: 0.94.

Lý do:

- Kho báu bị chiếm đoạt.
- Loyalty cao.
- Có Guardian.
- Nhận mệnh lệnh bảo vệ.
- Đường đến mục tiêu hợp lệ.

Thông tin chi tiết của mạo hiểm giả cần giới hạn theo tình báo trong chế độ chơi thông thường.

Developer Debug Mode có thể xem toàn bộ.

---

# 23. PATHFINDING AND NAVIGATION

Sử dụng A* hoặc thuật toán tìm đường phù hợp.

## 23.1. Hai cấp tìm đường

### Room Graph

Tìm đường qua phòng, hành lang và các tầng.

### Local Navigation

Tìm đường chính xác bên trong khu vực.

## 23.2. Chi phí đường đi

Path Cost có thể phụ thuộc:

- Khoảng cách.
- Địa hình.
- Bẫy đã biết.
- Quái vật đã biết.
- Cửa khóa.
- Mức nguy hiểm.
- Khả năng nhân vật.
- Mục tiêu.

AI chỉ sử dụng thông tin mà nó biết.

## 23.3. Chuyển tầng

Cầu thang và cổng là node kết nối giữa các Floor.

Quái vật và mạo hiểm giả đều có thể sử dụng nếu đáp ứng điều kiện.

## 23.4. Dynamic Obstacles

Cửa, công trình và trạng thái môi trường có thể thay đổi đường đi.

Cần cập nhật navigation khi có thay đổi hợp lệ.

Không tính lại toàn bộ pathfinding mỗi frame.

## 23.5. Xử lý AI bị kẹt

Nếu hành động di chuyển thất bại:

- Thử tính lại đường.
- Thay đổi mục tiêu.
- Tìm lối khác.
- Gọi hỗ trợ.
- Rút lui nếu phù hợp.

Không để màn chơi kéo dài vô hạn vì NPC đứng yên.

---

# 24. GUILD AND WORLD MEMORY

## 24.1. Công hội mạo hiểm giả

Công hội quản lý:

- Adventurer Registry.
- Parties.
- Quests.
- Dungeon Reports.
- Reputation.
- Threat Assessment.

## 24.2. Thông tin mang ra ngoài

Những người sống sót có thể báo cáo:

- Bố cục phòng.
- Lối xuống tầng.
- Loại quái vật.
- Boss.
- Bẫy.
- Công trình phong tỏa.
- Vật phẩm.
- Đường bí mật.
- Thông tin kho báu.

## 24.3. Thông tin có thể lỗi thời

Dungeon Report lưu:

- observedAt.
- sourceAdventurerId.
- knownRoomIds.
- knownTraps.
- knownMonsters.
- knownEntrances.
- confidence.

Nếu người chơi thay đổi hầm ngục, Công hội không tự động biết.

Đoàn mới có thể chuẩn bị sai vì dựa trên bản đồ cũ.

## 24.4. Thích nghi

Nếu hầm ngục có nhiều Undead, Công hội có thể gửi Priest.

Nếu có nhiều bẫy, tăng Rogue.

Nếu quái vật mạnh về phép, chuẩn bị kháng phép.

Nếu một Goblin Vương nổi tiếng, xuất hiện nhiệm vụ riêng liên quan đến nó.

## 24.5. Nhân vật sống sót

Mạo hiểm giả có thể tiếp tục tăng EXP, mua trang bị và nhận nhiệm vụ giữa các màn.

Không cần mô phỏng toàn bộ thế giới bên ngoài theo thời gian thực trong phiên bản đầu.

Có thể xử lý bằng World Simulation theo từng Expedition.

---

# 25. ECONOMY SYSTEM

## 25.1. Tài nguyên

### Gold

- Xây dựng.
- Mua thẻ.
- Nâng cấp.
- Sửa chữa.
- Mua vật phẩm.
- Tiền lương.

### Mana

- Thi triển phép.
- Triệu hồi.
- Duy trì công trình ma thuật.
- Thôi miên.
- Thống trị.

### Soul Resource

- Hồi sinh sinh vật phù hợp.
- Nghi thức đặc biệt.

### Materials

- Chế tạo.
- Sửa Golem.
- Sửa trang bị.
- Tiến hóa.
- Xây công trình.

### Experience

- Phát triển chủ nhân.
- Phát triển quái vật.
- Phát triển mạo hiểm giả.

### Reputation

- Mở khóa nội dung.
- Ảnh hưởng đoàn xâm nhập.
- Ảnh hưởng thế giới bên ngoài.

## 25.2. Thu nhập

- Phần thưởng qua màn.
- Vật phẩm.
- Kho báu.
- Cửa hàng.
- Thu phí dịch vụ.
- Giao thương.
- Sự kiện định mệnh.
- Công trình sản xuất nếu được mở khóa.

## 25.3. Chi phí

- Xây phòng.
- Mở tầng.
- Nâng cấp.
- Hồi sinh.
- Sửa chữa.
- Trang bị.
- Mua thẻ.
- Duy trì giao ước.
- Nghiên cứu.

## 25.4. Chống nhân bản tài nguyên

Sử dụng giao dịch tài nguyên tập trung.

Khi mạo hiểm giả lấy 100 vàng từ rương, 100 vàng chuyển từ rương sang túi.

Khi thu hồi, 100 vàng chuyển trở lại tài sản người chơi.

Không tính số vàng thu hồi là phần thưởng mới nếu nó vốn thuộc người chơi.

Shop chỉ nhận vàng nếu giao dịch thành công và tồn kho được cập nhật.

---

# 26. REPUTATION SYSTEM

Danh tiếng gồm các phương diện đề xuất:

- Power.
- Wealth.
- Hostility.
- Trustworthiness.

Hầm ngục giàu có thu hút kẻ săn kho báu.

Hầm ngục mạnh thu hút đoàn tinh anh.

Hầm ngục có độ tin cậy cao có thể thu hút thương nhân và các NPC muốn hợp tác.

Hầm ngục nổi tiếng với việc phá giao ước có thể khiến mạo hiểm giả không muốn giao dịch.

Các cấp đánh giá Công hội:

F → E → D → C → B → A → S → Calamity.

Danh tiếng không chỉ tăng số lượng kẻ địch mà còn thay đổi loại nhiệm vụ, nhân vật và sự kiện xuất hiện.

---

# 27. CREATURE LIFE SIMULATION

Giữa các cuộc thám hiểm, cư dân có thể:

- Nghỉ ngơi.
- Hồi phục.
- Luyện tập.
- Nghiên cứu.
- Chế tạo.
- Sửa chữa.
- Giao tiếp.
- Làm việc.
- Đánh giá trang bị.
- Đánh giá tiến hóa.

AI sử dụng nhu cầu, tính cách, Charm, mệnh lệnh và công trình hiện có.

Ví dụ:

Goblin chăm chỉ thường luyện tập.

Goblin có xu hướng lười biếng thích nghỉ ngơi.

Goblin có Magic Prodigy có thể dành thời gian nghiên cứu nếu đủ điều kiện.

Các hệ thống sinh sản, tổ chức xã hội phức tạp, vương quốc, hầm ngục đối thủ và nhiệm vụ bên ngoài được xem là nội dung mở rộng chưa chốt, không bắt buộc trong bản đầu.

---

# 28. PROGRESSION AND LEVELING

## 28.1. Quái vật nhận EXP

- Tham gia chiến đấu.
- Hỗ trợ đồng đội.
- Bảo vệ mục tiêu.
- Sống sót.
- Hoàn thành nhiệm vụ.
- Luyện tập.
- Sử dụng kỹ năng.

Không chỉ nhận EXP khi kết liễu đối thủ.

## 28.2. Mạo hiểm giả nhận EXP

- Hoàn thành nhiệm vụ.
- Khám phá.
- Chiến đấu.
- Hỗ trợ.
- Sống sót.
- Thu thập kiến thức.

## 28.3. Level Up

Có thể:

- Tăng chỉ số.
- Mở kỹ năng.
- Mở nhánh tiến hóa.
- Mở chuyển chức.
- Đạt điều kiện nhận Charm.

Không cấp Charm tự động mỗi lần lên cấp.

## 28.4. Nhân vật huyền thoại

Một cá thể sống sót qua nhiều cuộc thám hiểm có thể tích lũy danh tiếng riêng.

Ví dụ:

Grek, Goblin cấp 1, dần trở thành Goblin Vương cấp 50.

Arthur, Hiệp sĩ cấp 1, dần trở thành Thánh Kỵ Sĩ cấp 50.

Cả hai có thể gặp lại nhau nhiều lần.

---

# 29. USER INTERFACE

## 29.1. Phong cách

Pixel Art 2D Top-down.

Dungeon Crawler khi phóng to.

Management Simulation khi thu nhỏ.

Ưu tiên màn hình ngang trên Desktop.

## 29.2. Main HUD

Hiển thị:

- Gold.
- Mana.
- Soul Resource.
- Materials.
- Expedition Number.
- Thời gian chuẩn bị.
- Game Speed.
- Tầng hiện tại.
- Cảnh báo.
- Trạng thái kho báu.

## 29.3. Dungeon View

- Camera pan.
- Zoom.
- Chọn ô.
- Xây phòng.
- Chọn nhân vật.
- Xem từng tầng.
- Xem hành lang và kết nối.

## 29.4. Card Panel

- Bài đang có.
- Chi phí.
- Loại bài.
- Độ hiếm.
- Điều kiện sử dụng.
- Preview vị trí xây dựng.

## 29.5. Entity Inspector

Hiển thị:

- Tên.
- Chủng loại.
- Level.
- HP.
- Mana.
- Personality.
- Charm.
- Skills.
- Equipment.
- Inventory.
- Relationships.
- Memories.
- Orders.
- Current Action.
- Evolution Candidates.

Charm có khu vực riêng, không trộn vào trang bị.

## 29.6. Inventory UI

Hiển thị túi theo ô.

- Capacity.
- Used Slots.
- Item Stack.
- Rarity.
- Durability.
- Giá trị.
- Tooltip.
- Chuyển đồ.
- Trang bị.
- Đặt xuống.
- Cấp cho quái vật.

## 29.7. Charm UI

Hiển thị:

- Tên Charm.
- Độ hiếm.
- Hiệu ứng.
- Điều kiện kích hoạt.
- Nguồn nhận.
- Stack hiện tại nếu có.
- Tác động AI.
- Charm đang xung đột.

Charm có lợi và bất lợi phải có cách nhận biết rõ.

Không chỉ dựa vào màu sắc.

## 29.8. AI Inspector

Hiển thị hành động, điểm Utility và lý do lựa chọn.

## 29.9. Các màn hình bổ sung

- Creature Manager.
- Adventurer Database.
- Card Collection.
- Character Creator.
- Research.
- World View.
- Dungeon History.
- Shop Manager.
- Floor Upgrade.
- Expedition Results.

---

# 30. EXPEDITION RESULTS

Khi cuộc thám hiểm kết thúc, hiển thị:

- Trạng thái kho báu chính.
- Số mạo hiểm giả tham gia.
- Số thoát.
- Số bị đánh bại.
- Số được cứu.
- Vật phẩm bị mất.
- Vật phẩm thu hồi.
- Vàng kiếm được.
- Chi phí.
- Quái vật bị thương.
- Quái vật cần hồi sinh.
- Quái vật đang tái tạo.
- Nhân vật lên cấp.
- Charm mới.
- Tiến hóa.
- Thông tin Công hội nhận được.
- Giao ước mới.

Một cuộc thám hiểm kết thúc khi mọi thành viên xâm nhập đã thoát, bị đánh bại, đầu hàng, gia nhập hoặc hoàn thành trạng thái rời cuộc thám hiểm hợp lệ.

Không bắt buộc tất cả mạo hiểm giả phải bị tiêu diệt.

Nếu kho báu chính bị mang ra ngoài, kết thúc run ngay theo điều kiện Game Over.

---

# 31. TECHNICAL REQUIREMENTS FOR CODEX

## 31.1. Công nghệ đề xuất

- TypeScript hoặc JavaScript.
- HTML5 Canvas cho rendering 2D.
- HTML/CSS cho giao diện quản lý.
- Vite nếu sử dụng cấu trúc project nhiều file.
- LocalStorage hoặc IndexedDB để lưu game.

Không yêu cầu backend cho phiên bản đầu.

Không yêu cầu API AI.

Utility AI chạy local trong trình duyệt.

Sử dụng hình khối hoặc sprite pixel art tự tạo cho prototype. Không phụ thuộc asset bên ngoài để chạy được bản đầu.

## 31.2. Kiến trúc module

Tách thành các hệ thống độc lập:

- GameEngine.
- GameStateManager.
- TimeSystem.
- EventBus.
- EntityManager.
- RenderingSystem.
- InputSystem.
- DungeonSystem.
- RoomSystem.
- FloorSystem.
- NavigationSystem.
- UtilityAISystem.
- CombatSystem.
- SkillSystem.
- CharmSystem.
- StatusEffectSystem.
- InventorySystem.
- EquipmentSystem.
- LootSystem.
- TradeSystem.
- EvolutionSystem.
- ProgressionSystem.
- RecruitmentSystem.
- RelationshipSystem.
- ResurrectionSystem.
- CardSystem.
- EconomySystem.
- GuildSystem.
- WorldSimulation.
- SaveSystem.
- UISystem.

Có thể gộp một số module ở prototype nếu cần, nhưng giữ ranh giới trách nhiệm rõ ràng.

## 31.3. Data-driven content

Định nghĩa nội dung qua dữ liệu:

- SpeciesDefinitions.
- ClassDefinitions.
- MonsterDefinitions.
- AdventurerDefinitions.
- CharmDefinitions.
- SkillDefinitions.
- ItemDefinitions.
- RoomDefinitions.
- CardDefinitions.
- EvolutionDefinitions.
- FateEventDefinitions.

Không hardcode mọi Charm hoặc quái vật vào AI chính.

Ví dụ:

CharmDefinition chứa modifier cho Stat System, Utility AI, Healing System và event hooks.

Khi thêm Charm mới, ưu tiên thêm dữ liệu và effect handler dùng chung.

## 31.4. Game Loop

Tách Rendering khỏi Simulation.

Sử dụng fixed timestep cho simulation.

Render bằng requestAnimationFrame.

Ví dụ:

- Simulation: 30 ticks/giây.
- Rendering: Theo tốc độ màn hình.
- Utility AI: Đánh giá khoảng 2–5 lần/giây mỗi nhân vật, tùy tình trạng.
- Pathfinding: Khi cần thiết.
- World updates: Theo sự kiện hoặc kết thúc Expedition.

Các con số cần điều chỉnh dựa trên hiệu năng.

Không tính Utility của hàng trăm nhân vật mỗi frame.

## 31.5. Simulation Speed

Pause đóng băng simulation.

×2 và ×4 tăng lượng thời gian mô phỏng hoặc số simulation step được xử lý.

Không tăng trực tiếp sát thương hoặc bỏ qua các bước collision để tăng tốc.

Kết quả logic nên nhất quán giữa các tốc độ.

Giới hạn số step mỗi frame để tránh trình duyệt bị treo.

## 31.6. Simulation theo tầng

Tầng có mạo hiểm giả hoặc người chơi điều khiển trực tiếp sử dụng mô phỏng chi tiết.

Tầng không có giao tranh có thể giảm tần suất AI.

Tất cả sự kiện quan trọng vẫn được xử lý.

Không được để quái vật đứng yên hoàn toàn chỉ vì người chơi đang xem tầng khác.

## 31.7. Event System

Các sự kiện ví dụ:

- ENTITY_SPAWNED
- ENTITY_DAMAGED
- ENTITY_DOWNED
- ENTITY_REVIVED
- ENTITY_LEVEL_UP
- CHARM_ACQUIRED
- CHARM_REMOVED
- ITEM_PICKED_UP
- ITEM_DROPPED
- ITEM_TRANSFERRED
- ITEM_DAMAGED
- ITEM_BROKEN
- ITEM_EQUIPPED
- ITEM_PURCHASED
- ROOM_BUILT
- FLOOR_UPGRADED
- PORTAL_OPENED
- PORTAL_INTERRUPTED
- TREASURE_STOLEN
- TREASURE_RECOVERED
- ADVENTURER_ESCAPED
- ENTITY_EVOLVED
- CONTRACT_SIGNED
- EXPEDITION_ENDED

Charm có thể đăng ký hoặc phản ứng với event phù hợp.

Ví dụ Battle Frenzy phản ứng với trạng thái giao chiến.

Sunderer có thể phản ứng với sự kiện tấn công hợp lệ.

## 31.8. Save System

Lưu:

- Player.
- Dungeon.
- Floors.
- Rooms.
- Entities.
- Entity Charms.
- Inventory.
- Equipment.
- Items.
- Cards.
- Economy.
- Guild Reports.
- Memories.
- Relationships.
- Progression.
- Current Expedition.
- Random Seed.
- Save Version.

Khuyến nghị autosave ở đầu hoặc cuối cuộc thám hiểm.

Có thể mở rộng lưu giữa trận sau khi hệ thống runtime ổn định.

Không mất Charm, trang bị hoặc danh tính khi tải lại game.

## 31.9. Random System

Sử dụng RNG có seed nếu có thể.

Giúp tái hiện lỗi liên quan đến:

- Thẻ bài.
- Charm.
- Loot.
- NPC generation.
- Tiến hóa.
- Sự kiện.

## 31.10. Debug Tools

Developer Mode cần:

- Xem navigation grid.
- Xem room graph.
- Xem path.
- Xem AI Utility.
- Xem lý do hành động thất bại.
- Tạo quái vật.
- Tạo mạo hiểm giả.
- Cấp vật phẩm.
- Thêm Charm.
- Thay đổi HP.
- Tăng EXP.
- Kích hoạt tiến hóa.
- Mở cổng.
- Kiểm tra chuyển tầng.
- Kiểm tra quyền sở hữu vật phẩm.

---

# 32. MVP DEVELOPMENT ROADMAP

Không triển khai tất cả hệ thống phức tạp cùng một lúc.

Ưu tiên tạo một vertical slice có thể chơi hoàn chỉnh.

## PHASE 1 — DUNGEON CORE

- Canvas renderer.
- Construction Grid.
- Navigation Grid.
- Phòng.
- Hành lang.
- Lối vào.
- Kho báu chính.
- Camera.
- Xây dựng.
- Kiểm tra kết nối.

Mục tiêu: Xây được một hầm ngục hợp lệ.

## PHASE 2 — ENTITY AND COMBAT

- Entity System.
- Goblin.
- Skeleton.
- Slime.
- Knight.
- Mage.
- Rogue.
- Priest.
- Di chuyển.
- A*.
- Chiến đấu.
- Kỹ năng cơ bản.
- Downed State.

Mục tiêu: Hai phe có thể giao chiến trong hầm ngục.

## PHASE 3 — UTILITY AI

- Goal Layer.
- Action Layer.
- AI Considerations.
- Tấn công.
- Khám phá.
- Loot.
- Rút lui.
- Hồi phục.
- Bảo vệ đồng đội.
- AI Inspector.

Mục tiêu: Các nhân vật đưa ra quyết định khác nhau theo tình huống.

## PHASE 4 — INVENTORY, EQUIPMENT AND CHARM

- Vật phẩm.
- Túi đồ.
- Dung lượng.
- Loot.
- Đổi trang bị.
- Độ hiếm.
- Độ bền.
- Charm System.
- Status Effects.

Charm tối thiểu:

- Blessed.
- Violent.
- Fearful.
- Forsaken.
- Battle Frenzy.
- Greedy.
- Guardian.

Mục tiêu: Những nhân vật cùng cấp độ có hành vi và sức mạnh khác nhau.

## PHASE 5 — EXPEDITION AND ESCAPE

- Nhiệm vụ.
- Giai đoạn chuẩn bị.
- Điều khiển thời gian.
- Túi đầy.
- Rút lui.
- Dịch chuyển.
- Phong tỏa.
- Kho báu bị chiếm.
- Thu hồi.
- Kết quả màn.
- Game Over.

Mục tiêu: Có vòng lặp chơi hoàn chỉnh từ chuẩn bị đến kết thúc màn.

## PHASE 6 — CARDS AND MULTI-FLOOR

- Bộ bài.
- Thẻ dùng một lần.
- Cửa hàng thẻ.
- Thẻ định mệnh.
- Hai tầng.
- Cầu thang.
- Nâng cấp tầng.
- Giới hạn phòng.
- Bốn nhóm phòng.

Mục tiêu: Hầm ngục có thể mở rộng qua nhiều màn.

## PHASE 7 — PROGRESSION

- Level.
- EXP.
- Tiến hóa tự động.
- Hồi sinh.
- Tái tạo.
- Hồi phục một phần.
- Lưu danh tính.
- Trang bị có lịch sử.

Mục tiêu: Quái vật và mạo hiểm giả phát triển lâu dài.

## PHASE 8 — GUILD AND ECONOMY

- Ký ức.
- Báo cáo Công hội.
- Mạo hiểm giả quay lại.
- Cửa hàng trong hầm ngục.
- NPC mua bán.
- Danh tiếng.

Mục tiêu: Hai phe thích nghi và nền kinh tế có ý nghĩa.

## PHASE 9 — DUNGEON MASTER AND RECRUITMENT

- Tạo chủ nhân.
- Direct Control.
- Spell Mode.
- Hypnosis.
- Domination.
- Contract.
- Cooperation.
- Relationship System.

## PHASE 10 — FULL GAME

- Campaign.
- Endless.
- Nhiều chủng loại.
- Nhiều nghề nghiệp.
- Nhiều Charm.
- Sự kiện.
- Pixel art hoàn chỉnh.
- Âm thanh.
- Save/Load.
- Tối ưu hiệu năng.
- Cân bằng.

---

# 33. ACCEPTANCE TESTS — YÊU CẦU KIỂM THỬ

Codex cần xây dựng và kiểm tra các trường hợp sau.

## 33.1. Dungeon

- Xây phòng hợp lệ.
- Từ chối vị trí không hợp lệ.
- Không cho bắt đầu màn nếu kho báu không có đường kết nối.
- Chuyển tầng đúng.
- Nâng cấp tầng làm tăng giới hạn phòng.

## 33.2. Inventory

- NPC không nhặt vật phẩm khi túi đầy nếu chưa giải phóng đủ chỗ.
- NPC có thể bỏ đồ giá trị thấp.
- NPC có thể chuyển đồ cho đồng đội.
- Không nhân đôi vật phẩm khi hai NPC cùng loot.
- Trang bị đang mặc không bị tính trùng trong túi.
- Giao dịch shop cập nhật vàng và tồn kho chính xác.

## 33.3. Charm

- Blessed tăng chỉ số và kháng hắc ám.
- Violent tăng sát thương vật lý.
- Fearful tăng ưu tiên rút lui và tốc độ khi HP thấp.
- Forsaken chặn hồi HP theo quy tắc.
- AI có Forsaken không lãng phí thuốc hồi HP.
- Battle Frenzy tăng sức mạnh theo thời gian giao chiến.
- Battle Frenzy mất hoặc giảm stack khi rời giao chiến.
- Một NPC có thể sở hữu nhiều Charm.
- Charm không chiếm Inventory Slot.
- Charm không biến mất khi thay trang bị.
- Charm được lưu và tải lại chính xác.
- Charm được giữ sau hồi sinh và tiến hóa, trừ quy tắc đặc biệt.

## 33.4. Utility AI

- Không sử dụng phép khi thiếu Mana.
- Không loot vật phẩm nếu không có khả năng.
- Không dùng trang bị không tương thích.
- Không nhìn thấy bẫy chưa phát hiện.
- Có thể thay đổi kế hoạch nếu đường đi bị chặn.
- Không liên tục đổi ý vì Utility thay đổi nhỏ.
- Có thể rút lui khi hoàn thành nhiệm vụ.

## 33.5. Escape

- Mạo hiểm giả có thể thoát bằng lối ra.
- Có thể thoát bằng dịch chuyển hợp lệ.
- Không dịch chuyển thành công trong vùng phong tỏa nếu chưa vô hiệu hóa.
- Mang kho báu phụ ra ngoài không Game Over.
- Mang kho báu chính ra ngoài mới Game Over.
- Thu hồi kho báu trước khi đối phương thoát ngăn Game Over.

## 33.6. Evolution

- Quái vật tự đánh giá nhánh tiến hóa.
- Charm ảnh hưởng lựa chọn.
- Trang bị ảnh hưởng lựa chọn.
- Không tiêu tài nguyên quý khi chưa được cấp quyền.
- Giữ Entity ID sau tiến hóa.
- Không làm mất vật phẩm không tương thích một cách vô lý.

## 33.7. Persistence

- Nhân vật sống sót có thể quay lại.
- Level được lưu.
- Charm được lưu.
- Vật phẩm được lưu.
- Báo cáo Công hội được lưu.
- Thông tin cũ không tự cập nhật khi hầm ngục thay đổi.

---

# 34. FINAL IMPLEMENTATION DIRECTIVE

Hãy phát triển một Web Game có thể chơi được dựa trên GDD này.

Không chỉ tạo giao diện giả hoặc bản trình diễn tĩnh.

Ưu tiên cơ chế hoạt động thực sự:

1. Xây dựng hầm ngục.
2. Utility AI.
3. Chiến đấu.
4. Túi đồ và loot.
5. Charm.
6. Rút lui và dịch chuyển.
7. Kho báu chính.
8. Tiến hóa.
9. Nhiều tầng.
10. Thẻ bài và quản lý.

Các hệ thống phải kết nối với nhau.

Ví dụ:

- Charm ảnh hưởng Utility AI.
- Utility AI ảnh hưởng chiến đấu, loot và rút lui.
- Trang bị ảnh hưởng sức mạnh và tiến hóa.
- Túi đầy ảnh hưởng quyết định loot và thoát.
- Phòng ảnh hưởng nhu cầu và khả năng phát triển.
- Mạo hiểm giả sống sót ảnh hưởng Công hội.
- Công hội ảnh hưởng những cuộc thám hiểm tiếp theo.
- Sự kiện ảnh hưởng bố cục và chiến lược hầm ngục.

Tất cả thông số nên có thể cấu hình.

Không hardcode nội dung theo cách khiến việc bổ sung Charm, phòng, quái vật và vật phẩm mới trở nên khó khăn.

Sử dụng GDD này làm nguồn thiết kế chính.

Nếu chưa thể triển khai toàn bộ, hãy hoàn thành lần lượt từng Phase, giữ game chạy được và có thể kiểm thử sau mỗi Phase.

Mọi tính năng chưa được triển khai phải được đánh dấu rõ, không giả vờ đã hoạt động.

---

# 35. TẦM NHÌN CUỐI CÙNG

YOUR DUNGEON? là một game về xây dựng và quản lý một hầm ngục sống.

Một Goblin có thể sinh ra với Charm Sợ Hãi, sống sót qua nhiều cuộc chiến, nhận thêm Kiên Cường, tìm được một thanh kiếm hiếm và tự chọn tiến hóa thành Goblin Champion.

Một mạo hiểm giả có thể sở hữu Bạo Lực và Cuồng Chiến, chiến đấu rất mạnh nhưng thất bại vì túi đầy, thiếu thuốc và không còn Mana để mở cổng.

Một pháp sư từng là kẻ địch có thể ký giao ước, trở thành người nghiên cứu cho hầm ngục.

Một cửa hàng do người chơi vận hành có thể bán thuốc cho chính đoàn mạo hiểm đang tìm cách lấy kho báu.

Một thanh kiếm huyền thoại có thể bị lấy mất ở màn 5, xuất hiện lại trong tay kẻ thù ở màn 20 và cuối cùng được một Goblin thu hồi ở màn 35.

Những câu chuyện này không cần được viết sẵn.

Chúng phải tự xuất hiện từ Utility AI, Charm, vật phẩm, ký ức, tiến hóa và các quyết định của người chơi.

Đó là bản sắc chính của YOUR DUNGEON?.