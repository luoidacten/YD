# Changelog

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
- Soak chứng nhận 150 trận (`tests/fixtures/soak-release-v0.1.0.json`): 0 trận kẹt, 0 trận chạm giới hạn thời gian.

### Biết trước
- Ô chất lỏng của biome chưa đặt được bằng thẻ; luật biome áp cho cả tầng.
- Icon trạng thái 8×8 còn dùng ký tự tạm. Chưa có nhạc nền.
- Cân bằng còn sớm: tỉ lệ phòng thủ thắng trong soak khoảng 20–25%.
