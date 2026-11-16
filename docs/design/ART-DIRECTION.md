# Art direction — chuẩn 0x72

Đã được người dùng chọn: pixel 16×16 giống nhịp hình ảnh Soul Knight, dùng 0x72 DungeonTileset II làm chuẩn; chiến đấu vừa phải, quan sát được chiến thuật.

## Quy tắc thống nhất

1. Gạch cơ sở 16×16. Nhân vật thường giữ tỉ lệ khoảng 16×24, quái lớn 32×32 theo sprite gốc. Không trộn sprite 32×32 nhiều chi tiết vào nhân vật thường.
2. Top-down có mặt tường phía trước; nền hầm đá nâu xám, khe sâu tối, silhouette sáng vừa đủ để đọc rõ.
3. Dùng màu lấy trực tiếp từ sprite sheet gốc. Accent UI vàng cũ, hỗ trợ xanh dịu, mana lam, nguy hiểm đỏ đất. Charm có ký hiệu và mô tả, không chỉ phân biệt bằng màu.
4. Không anti-alias/blur trên sprite; render nearest-neighbor. Ánh sáng và vignette là lớp trên map, không làm thay đổi đường viền pixel.
5. Hoạt ảnh idle/run 4 frame theo bộ gốc; hướng trái/phải mirror. Nội dung hiện tại không có đủ 8 hướng, không mô tả như đã có.
6. Nội thất, portrait nhỏ và icon dùng cùng bộ. Đồ mới phải được thử cạnh Goblin/Skeleton/chest gốc trước khi đưa vào game.
7. Giao diện quản lý dùng chữ rõ, nền đá xanh tối, khung đồng vuông và bóng cứng theo cụm pixel. Canvas chiếm chính giữa, không dùng ảnh lớn khác phong cách làm phông game.
8. Zoom dùng ba mức LOD: toàn tầng dưới 10 px/ô, chiến thuật dưới 23 px/ô và cận cảnh từ 23 px/ô. Hình phòng vẫn giữ đúng footprint vật lý ở cả ba mức; chi tiết nhỏ chỉ vẽ khi tới gần.
9. Phòng thường có nền 15×13, phòng lớn 21×17, boss 29×23. Hành lang rộng 3 ô. Chiều dài đến từ khoảng cách phòng, không kéo giãn sprite.
10. Phẩm chất dùng viền chân/màu nhấn; biến thể dùng tint nhẹ và effect dễ nhận biết. Không tuyên bố mỗi biến thể có bộ sprite riêng.

## Khi cần Gemini để vẽ

Chỉ dùng Gemini cho hình ảnh theo yêu cầu của người dùng. Không cần tài khoản Gemini cho v0.2 vì asset CC0 hiện có đủ để chơi.

- Đưa một contact sheet tham chiếu từ bộ gốc, bảng màu trích từ ảnh, kích thước sprite chính xác và trạng thái cần vẽ.
- Tách yêu cầu một nhân vật/một trạng thái hoặc một bộ icon; không yêu cầu AI dựng cả atlas gameplay nhiều ô một lần.
- Yêu cầu nền trong suốt, hard pixel edges, không gradient trong sprite, không viền mờ, cùng hướng ánh sáng và tỉ lệ.
- Kiểm tra kích thước, alpha, footprint chân, silhouette, độ đồng đều các frame. Hình chưa qua kiểm tra không được tự coi là asset hoàn thiện.
- Lưu prompt, ngày tạo, ảnh tham chiếu và ghi rõ AI-generated. Không gắn nhãn CC0 cho ảnh AI nếu chưa có cơ sở giấy phép.

Prompt mẫu (chưa dùng để sinh ảnh):

> Create one 16×24 pixel-art goblin shaman idle sprite matching the attached 0x72 DungeonTileset II reference in palette, silhouette, front-facing top-down perspective and 1-pixel cluster size. Transparent background, hard pixel edges, no antialiasing, no gradients, no glow baked into the sprite, feet aligned to the same ground baseline. Keep the readable small green goblin silhouette; add a short wooden staff and one muted violet cloth detail. Deliver at native resolution, with a nearest-neighbor enlarged preview separately.
