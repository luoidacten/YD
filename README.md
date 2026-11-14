# YOUR DUNGEON? — Hầm ngục của bạn

Playable prototype v0.2, pixel 16×16 theo 0x72. Hai tầng, phòng boss lớn, hành lang dài, zoom ba mức, pause và ×1/×2/×4.

## Chạy

Node.js 20+, không cần dependency:

```powershell
node server.mjs
node scripts/build.mjs
node --test tests/v2.test.mjs
```

Mở http://127.0.0.1:4173. Host nguyên thư mục `dist`.

## Chơi

- Mở gói bài, chọn lá giữ lại rồi dùng blueprint trên bản đồ. Thuê cư dân theo loài hoặc ký hợp đồng ngẫu nhiên phẩm chất tốt hơn.
- Bố trí quái giữ phòng, nâng cấp công trình, đặt bẫy và thùng. Quái không đuổi khỏi phòng. Cửa khóa khi hero vào phòng còn quái; quét sạch mới mở.
- Hộ Môn giữ cầu thang; Azrakh giữ kho báu tầng sâu. Có trinh sát và viện binh bí mật đến sau.
- Chọn nhân vật xem Utility/skill/passive/Charm/gear/effect. Bên ngoài có lời đồn, tình hình thế giới, spy giả dạng và Oracle. Có quái Mimic và Tổ Mimic.
- Sau trận chọn Fate trước màn tiếp. Công trình mất quyền phải chiếm lại và sửa nếu bị phá.
- Space pause; 1/2/3 camera; G lưới; WASD/kéo chuột phải pan; cuộn zoom; nhấp đôi phòng nhìn gần.

Catalog: 50 kỹ năng, 50 nội tại, 40 effects, 40 Charms, 22 loại phòng, 20 items, 6 phẩm chất, 7 biến thể. Đây vẫn là prototype cần cân bằng, nhiều kỹ năng chia sẻ handler/animation; chưa phải toàn bộ campaign GDD. Xem [CODEX.md](CODEX.md) để biết kiến trúc, bất biến và giới hạn chính xác.

Save LocalStorage `your-dungeon-v2` theo origin, tự lưu và có nút Lưu; giữ save v1 khi chuyển bản. Save localhost và Site không tự chuyển nhau.

Nguồn art/audio CC0 ở [ASSET-LICENSES.md](ASSET-LICENSES.md), [AUDIO-SOURCES.md](AUDIO-SOURCES.md).
