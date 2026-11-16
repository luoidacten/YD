# Changelog

## v0.3.4 — Phòng tự triệu hồi quái, điện thoại, AI chiến thuật (2026-11-17)
- **Phòng tự triệu hồi quái theo loại phòng:**
  - Doanh trại ra lính, Nghĩa địa ra xương và xác sống, Hồ độc ra slime và bọ cạp…, chọn ngẫu nhiên trong các loài ưa phòng đó.
  - **Phòng càng lên cấp:** mở thêm loài mạnh hơn và tăng sức quái (cấp 1: 57% máu, mỗi cấp +12%).
  - Boss, vua và Mimic không bao giờ là quái hoang.
- **Sửa lỗi lớn:** mạo hiểm giả mang đồ khởi đầu gần đầy túi nên nhặt một món là "túi đầy" và bỏ về ngay sau 2 giây. Túi giờ rộng thêm 3 ô; trận kéo dài đúng nghĩa.
- **Mũi tên và đạn** xoay đúng hướng bay (trước đây luôn chĩa sang phải).
- **Xây xong một phòng,** camera lướt mượt tới **ô xây tiếp theo** kề bên, có khung nhấp nháy.
- **Giao diện điện thoại:**
  - **Dọc:** bản đồ chiếm toàn chiều ngang; tab tầng nổi trên bản đồ; nút **Mở cổng** nổi to dễ bấm; khay thẻ cuộn ngang; ẩn bản đồ nhỏ.
  - **Ngang:** topbar và khay thẻ gọn.
  - **Thao tác:** chụm hai ngón để zoom, kéo một ngón để di chuyển.
- **AI chiến thuật** (tham khảo F.E.A.R. squad AI và danh sách vùng nguy hiểm kiểu influence map):
  - Tổ đội ghi nhớ phòng đã gây nhiều sát thương; lần sau phải hồi sức tới 85% rồi mới bàn bạc vào lại.
  - Lính tầm xa và hỗ trợ **dồn hỏa lực** vào mục tiêu hộ vệ đang giữ chân.
  - Xác sống quá ngu để kéo xác đồng đội.
  - Lưới an toàn chống đứng im khi canh xác, khám phá hay tập hợp quá lâu; quái giữ chỗ khi lối đi bị chắn; đội bế tắc thì rút lui.
- Soak 150 trận: 0 kẹt, 0 chạm giới hạn; phòng thủ thắng 44%.

## v0.3.3 — Quái hoang, tổ đội có chỉ huy, cùng vào phòng (2026-11-17)
- **Quái hoang:**
  - Mọi phòng (trừ cổng vào và bậc thang đến) sinh **3–5 quái hoang** mỗi đợt, theo bậc đợt 1 / 4 / 8.
  - Quái hoang yếu hơn (70% máu, 75% sức), **không chiếm chỗ** nên không chặn việc thuê quái, và biến mất khi hết đợt.
  - Quái bạn tự đặt là **quân cố định, mạnh hơn** (+15% máu và sức, áp một lần).
- **Đoàn đầu tiên chỉ có 3 người đúng vai:** Hiệp sĩ, Pháp sư, Tu sĩ (không kèm đội trinh sát). Người do thẻ định mệnh/sự kiện thêm vào vẫn được giữ.
- **Tổ đội 3–5 người có chỉ huy ★.** Bấm vào một mạo hiểm giả để xem bảng **Tổ đội**: chỉ huy, trạng thái (khám phá / bàn bạc / giao chiến / nghỉ / rút lui), vai trò và máu từng người. Bấm tên để chuyển sang người đó.
- **Bàn bạc thấy rõ:** bong bóng hội thoại pixel trên đầu từng người (chỉ huy, hộ vệ, tầm xa, hỗ trợ, trinh sát nói câu riêng), cùng dòng nhật ký.
- **Cả đội đồng ý thì dịch chuyển cùng lúc tới trước cổng** rồi ập vào phòng một lượt ("Vào!", "Rõ!").
- **Từ đợt 5 các tổ đội gộp lại** khi cùng nhắm một phòng, thành nhóm đông hơn.
- **Tầm xa né đạn:** tùy độ nhanh nhẹn (10–60%), bước tránh sang bên khi đạn tới gần ("Né!").
- **Trao đồ:** khi bàn bạc, người có bình máu đưa cho đồng đội đang yếu.
- Soak 150 trận: 0 kẹt, 0 chạm giới hạn; phòng thủ thắng 52%.

## v0.3.2 — Tự xây tường trong phòng, xây mượt hơn (2026-11-17)
- **Xây tường trong phòng:** chọn một phòng → **🧱 Xây tường trong phòng**, rồi nhấp hoặc kéo trên sàn để tô.
  - **4 loại tường:**
    - **Tường đá:** chặn đi lại và tầm nhìn, không phá được.
    - **Tường gỗ:** chặn như đá nhưng phá được (60 HP).
    - **Bụi rậm:** đi xuyên được nhưng chậm 30%, che tầm nhìn.
    - **Rào thấp:** chặn đi lại nhưng nhìn và bắn qua được.
  - **3 mẫu có sẵn:** Bốn cột, Ụ nấp, Lùm cây. Có công cụ **Gỡ** (hoàn 50% vàng).
  - **Ngân sách:** mỗi cấp phòng cho 4 ô miễn phí; vượt thì trả vàng (đá 12, rào 8, gỗ 6, bụi 4); tối đa nửa phòng.
  - Tường đá dùng tile tường của biome nên đổi theo địa hình.
- **Ba quy tắc luôn hoàn thành được:**
  - lối giữa các cửa và quanh cầu thang luôn trống;
  - phòng không bao giờ bị cắt đôi;
  - cổng vào, phòng rương và đường nối vẫn hợp lệ để mở trận.
- **Xây mượt hơn:** đặt bẫy, tường, thùng hay phá vật cản không còn vẽ lại cả lớp sàn (trước đây gây khựng hình); tường cập nhật đường đi tức thì mà không dựng lại toàn bộ bản đồ.

## v0.3.1 — Mạo hiểm giả chơi như một tổ đội (2026-11-17)
- **Bàn bạc rồi cùng vào phòng:**
  - Người đầu tiên tới cửa phòng chưa khám phá đặt điểm tập hợp.
  - Cả tổ đội (3–5 người) kéo về, hiện "…" trong lúc bàn bạc.
  - Khi **tất cả sẵn sàng** thì cùng tiến vào một lượt. Chờ quá 12 giây thì vẫn vào.
  - Đồng đội tụt quá xa thì trưởng nhóm quay lại đón trước.
- **Nghỉ theo tính cách:** người tham lam hoặc hiếu chiến lấy **lương khô ra ăn** (hồi 6% máu/giây, "Nhai…"); người còn lại **ngủ** (hồi 4% máu và 4% mana mỗi giây, "Zzz").
- **Đánh có đội hình thay vì cùng lao vào:**
  - Pháp sư, cung thủ, tu sĩ giữ khoảng cách.
  - Sát thủ chờ hộ vệ lao lên giữ chân trước (tối đa 3 giây).
  - Người máu dưới 35% lùi ra sau lưng hộ vệ.
  - Không đứng chồng lên đồng đội.

## v0.3.0 — Độ khó tùy chỉnh (2026-11-17)
- **Phòng bắt buộc miễn phí mana:** Cổng hầm ngục, Phòng rương trung tâm (kho báu), Đại sảnh cầu thang, Bậc thang tầng sâu. Thẻ hiện "Miễn phí". Các phòng khác vẫn tốn 5 mana.
- **Độ khó:**
  - 4 mức: **Dễ**, **Thường** (mặc định, giữ nguyên cân bằng v0.2), **Khó**, **Ác Mộng**.
  - Chế độ **Tùy chỉnh** có 6 thanh trượt: máu hero, sát thương hero, số hero mỗi đợt, thưởng vàng, vàng khởi đầu, mana khởi đầu.
  - Chọn khi bấm "Run mới" ở Menu chính; đổi bất cứ lúc nào trong Menu → ⚔ Độ khó (áp dụng từ đợt sau, không đổi được giữa trận).
  - Lưu theo từng run.

## v0.2.1 — Sửa lỗi và đội hình thông minh (2026-11-17)
- **Sửa crash** khi bấm chọn nhân vật trong lúc đang cầm thẻ (`Cannot read properties of undefined (reading 'kind')`).
- **Vũ khí:**
  - Cầm ở tay thay vì neo ở vai, nên không còn bay trên đầu.
  - Giới hạn chiều cao khoảng một ô.
  - Kiếm nghiêng nhẹ khi đứng yên, vung khi đánh.
  - **Cung cầm dựng đứng**; súng và nỏ chĩa ngang; khiên cầm bên tay kia.
- **Mạo hiểm giả đi như một đội thật:**
  - Tới cửa phòng chưa khám phá thì đợi đồng đội tụt lại (tối đa 6 giây) để cùng vào.
  - Dọn sạch phòng mà cả đội dưới 75% máu thì nghỉ (tối đa 10 giây, mỗi giây hồi 4% máu và 3% mana, có "Zzz"). Thấy địch là dậy ngay.
  - Người mang kho báu không bao giờ dừng.
- Repo có `index.html` ở gốc, chuyển hướng vào game trong `dist/`.

## v0.2.0 — Bầy Xác Sống và Quân Vương Quốc (2026-11-17)

### Bẫy
- **20 bẫy mới**, đều có hình riêng:
  - **Ụ:** nỏ, súng, phun lửa, băng, tháp sét (lan 3 hero), pháo cối (nổ vùng có báo trước), phun độc, hắc ấn.
  - **Mìn:** mìn nổ, ụ thuốc nổ, mìn băng, mìn khói độc.
  - **Cơ khí:** lưỡi cưa, búa lắc (đánh văng), lưới bắt, hố chông, nam châm (hút + tước vũ khí).
  - **Ma thuật:** vòng rút mana, bia nguyền, cột hồi sinh quái.
- Ụ bắn bằng **đạn thật** (né được, tường chặn). Mìn nổ một lần mỗi đợt và có sát thương lan sang cả quái.

### Họ Zombie
- **10 loài:** Xác Sống, Xác Chạy, Xác Phun Axit, Xác Giáp Sắt, Xác Thợ Mỏ, Xác Bò, Xác Khổng Lồ, Xác Trương Phình (nổ mây độc khi gục), Xác Dịch Hạch (tỏa độc), Hiệp Sĩ Xác Sống (chỉ huy).
- **Boss tầng mới: Vua Xác Sống.** Gọi bầy xác, đập thối rữa, lao xác. Ấn: zombie hồi sinh thêm 1 lần và hồi máu nhanh gấp đôi.
- **Cơ chế:**
  - Rất trâu; hồi sinh 1–2 lần, trừ khi bị **lửa** kết liễu hoặc đang cháy.
  - Hồi đầy máu rất nhanh khi rời giao tranh.
  - Biết cầm trang bị.
  - **Lơ ngơ** khi không có Chủ phòng, tinh anh hoặc zombie chỉ huy cùng phòng.

### Công hội tấn công
- **Cuộc Đột Kích** (từ đợt 3): thêm 2 đợt nhỏ trong trận.
- **Cuộc Tiến Công** (từ đợt 6): đoàn chính đông hơn 50% và 3 đợt lớn có quân Vương Quốc.
- **Càn Quét** (đợt 10, sau đó mỗi 5 đợt): 5 đợt cực đông, phần lớn là quân Vương Quốc tinh nhuệ.
- Báo cáo Công hội cảnh báo trước khi đợt sau là một cuộc tấn công.
- **Quân Vương Quốc:** Vệ Binh, Xạ Thủ, Pháp Sư, Giáo Sĩ, Đội Trưởng. Trí khôn 75–90, có sẵn trang bị và skill AOE.

### AI mạo hiểm giả
- Thấy ụ là ghi nhớ, và ưu tiên phá ụ/cột khi không bị áp sát.
- Hero đã được Công hội dạy về bẫy thì dò được bẫy ẩn ở gần.
- Hạ Chủ phòng trước để phá hào quang.
- Ưu tiên đốt zombie để chúng không đứng dậy.
- Vẫn giữ các hành vi cũ: bắn thùng nổ khi quái đứng tụm, đánh vào điểm yếu, ngắt phép, dồn đánh kẻ yếu.

## v0.1.0 — Bản chính thức đầu tiên (2026-11-17)

Bản phát hành công khai đầu tiên của **YOUR DUNGEON? — Hầm ngục của bạn**. Các tag `v0.3`–`v0.6.0` trước đây là mốc nguyên mẫu nội bộ.

### Màn hình và giao diện
- **Menu chính:** logo pixel, các nút Tiếp tục / Run mới / Hướng dẫn / Cài đặt / Ghi công. Phía sau là một trận thật do AI tự chơi, mỗi vòng đổi boss và địa hình.
- **HUD pixel:** khung đá, nút đá/vàng, thẻ bài theo loại, thanh máu, boss bar, font **YD Pixel** tự vẽ đủ tiếng Việt.
- **Màn chọn Tầng Chủ:** 3 thẻ boss, chọn địa hình, đổi bộ 1 lần.
- **Bảng Quản lý:** Báo cáo Công hội, Tổng kết kèm bản đồ nhiệt đường đi của hero, Quân đoàn (mệt mỏi, hồi sức), Sách Hắc Thuật.
- **Cảm giác đòn đánh:** tia lửa, vệt chém, chí mạng, số sát thương, khựng hình, rung màn hình, xu bay về HUD. Tắt được trong cài đặt.

### Lối chơi
- **8 Tầng Chủ** (Titan, Ác Ma, Kẻ Chiêu Hồn, Nữ Hoàng Nhện, Phù Thủy Băng Giá, Đại Tướng Orc, Hắc Kỵ Sĩ Tử Thần, Vua Xương). Mỗi boss có 4 chiêu theo 3 giai đoạn, lối đánh riêng và Ấn Tầng.
- **7 biome:** Hầm Đá Cổ, Rừng Cổ, Hang Đá, Hầm Băng, Lò Dung Nham, Đầm Lầy, Hầm Mộ. Mỗi biome có tile riêng và luật riêng.
- **Chủ phòng:** hào quang phủ phòng và các phòng nối hành lang; khi lên cấp chọn Mạnh hơn / Xa hơn / Đa dạng hơn. Phòng có ngai, thảm và cờ.
- **Nguyên tố và kháng/yếu:** 8 nguyên tố, mỗi loài và boss có điểm mạnh/yếu.
- **Mana và máu:** mọi loài có mana, skill tốn mana; một số loài trả skill bằng máu.
- **Kỹ năng và đạn:** 20 skill AOE; đạn bay thật, né được và bị tường chặn.
- **Công hội học từ thất bại:** đoàn sau mang kháng và class khắc chế; hero thoát được quay lại thành "Kẻ Sống Sót".
- **Quản lý giữa đợt:** phí duy trì mana, mệt mỏi, nghiên cứu bằng hồn, Tai tiếng, 3 sự kiện giữa đợt.
- **Nội dung:** 85+ loài, 8 class mạo hiểm giả mới cùng bạn đồng hành (sói, chim ưng, dạng gấu), 53 vũ khí có yêu cầu trí khôn, thông thạo và kỹ thuật, họ Xương 7 loài.

### Kiểm chứng
- 186/186 test tự động; build, format và kiểm tra UI (0 lỗi tràn chữ ở 3 cỡ màn hình) xanh.
- Soak chứng nhận 150 trận (`tests/fixtures/soak/soak-release-v0.1.0.json`): 0 trận kẹt, 0 trận chạm giới hạn thời gian.

### Biết trước
- Ô chất lỏng của biome chưa đặt được bằng thẻ; luật biome áp cho cả tầng.
- Icon trạng thái 8×8 còn dùng ký tự tạm. Chưa có nhạc nền.
- Cân bằng còn sớm: tỉ lệ phòng thủ thắng trong soak khoảng 20–25%.
