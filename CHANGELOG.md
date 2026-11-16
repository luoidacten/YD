# Changelog

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
