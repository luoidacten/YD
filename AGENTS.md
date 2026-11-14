# Hướng dẫn sửa dự án

Đọc `CODEX.md` trước khi sửa: kiến trúc, hệ thống đã có, bất biến và giới hạn thực tế. Xem `GDD.md` cho thiết kế gốc, `ART-DIRECTION.md` cho chuẩn 0x72. Không viết lại hệ hiện có khi API hiện tại đáp ứng được.

Sau sửa gameplay chạy `node --test tests/v2.test.mjs` và `node scripts/build.mjs`. Giữ save v1/v2, seeded RNG, floor identity, seals, room confinement, fog và item ownership. Không coi mô tả catalog là bằng chứng cơ chế đã có. Cập nhật `CODEX.md` nếu đổi kiến trúc/bất biến.
