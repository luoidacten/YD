# YOUR DUNGEON? — Hầm ngục của bạn

Playable prototype v0.3, pixel 16×16 theo 0x72. Hai tầng, phòng boss lớn, hành lang dài, zoom ba mức, pause và ×1/×2/×4.

## Chạy

Node.js 20+, không cần dependency:

```powershell
node server.mjs
node scripts/build.mjs
node --test tests/v2.test.mjs tests/lair.test.mjs tests/room-life.test.mjs
```

Mở http://127.0.0.1:4173. Host nguyên thư mục `dist`.

## Chơi

- Run mới trống hoàn toàn. Đặt cổng vào, các phòng và phòng rương; đặt chìa trên nền hoặc giao quái. Bản thiết kế kiểm tra tuyến đường trước khi mở trận.
- Mở gói bài, chọn lá giữ lại rồi dùng blueprint trên bản đồ. Thuê cư dân theo loài hoặc ký hợp đồng ngẫu nhiên phẩm chất tốt hơn.
- Bố trí quái giữ phòng, nâng cấp công trình, đặt bẫy và thùng. Quái không đuổi khỏi phòng. Cửa khóa khi hero vào phòng còn quái; quét sạch mới mở.
- Cầu thang nối hai tầng khi tự đặt đủ cặp. Có thể thuê boss tại đại sảnh/phòng rương. Có trinh sát và viện binh bí mật đến sau.
- Chọn nhân vật xem Utility/skill/passive/Charm/gear/effect. Bên ngoài có lời đồn, tình hình thế giới, spy giả dạng và Oracle. Có quái Mimic và Tổ Mimic.
- Sau trận chọn Fate trước màn tiếp. Công trình mất quyền phải chiếm lại và sửa nếu bị phá.
- Space pause; 1/2/3 camera; G lưới; WASD/kéo chuột phải pan; cuộn zoom; nhấp đôi phòng nhìn gần.

Catalog: 58 kỹ năng, 58 nội tại, 40 effects, 47 Charms, 22 loại phòng, 35 items, 6 phẩm chất, 7 biến thể. Đây vẫn là prototype cần cân bằng, nhiều kỹ năng chia sẻ handler/animation; chưa phải toàn bộ campaign GDD. Xem [CODEX.md](CODEX.md) để biết kiến trúc, bất biến và giới hạn chính xác.

Save LocalStorage `your-dungeon-v2` theo origin, tự lưu và có nút Lưu; giữ save v1 khi chuyển bản. Save localhost và Site không tự chuyển nhau.

Nguồn art/audio CC0 ở [ASSET-LICENSES.md](ASSET-LICENSES.md), [AUDIO-SOURCES.md](AUDIO-SOURCES.md).

V0.3 thêm quota phòng, địa hình tường/vực liên thông theo seed, trí khôn/chỉ huy, AI tận dụng bẫy/thùng, cứu hộ chậm/kéo người gục/thuốc hồi sinh. Save cũ giữ nguyên; bắt đầu run mới trong Trợ giúp để thiết kế từ trống. `?sandbox=1` dành cho QA với save riêng.

Menu và Reset ở thanh đầu. Dọn sạch bất kỳ phòng nào đều có rương cấp I–V, một lần mỗi đợt. Quái tản ra tuần tra trong phòng, trở về sau chiến đấu. Thêm 10 loài quái có sprite riêng, Cung Thủ, 12 vũ khí và Gói Vũ Khí. Cấp thẻ vũ khí cho quái rồi chọn Trang bị trong túi.

Kiểm chứng: `node --run test`, `node scripts/build.mjs`, `node scripts/format-check.mjs`; soak 50 seed × 3 wave: `node scripts/soak.mjs --seeds 1-50 --waves 3 --strict`. So hash định dạng bằng `node scripts/compare-soak.mjs`. Lấy số catalog bằng `node scripts/catalog-counts.mjs`.
