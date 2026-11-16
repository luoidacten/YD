# Tactical AI — ghi chú thiết kế

> Ghi chú v0.2: các phần v0.1 bên dưới là lịch sử thiết kế. Kiến trúc và giới hạn hiện hành nằm trong `CODEX.md`. Hai đợt thiết kế ChatGPT tiếp theo được lưu nguyên trong `docs/archive/CHATGPT-CATALOG.txt` (50 skills/50 passives) và `docs/archive/CHATGPT-EXPANSION.txt` (packs/Fates/rooms/items/Charms/effects). Đây là nguồn ý tưởng cần đối chiếu code; một mô tả thiết kế không đảm bảo mọi tương tác phụ đã hoạt động.

Đã trao đổi trên ChatGPT web theo yêu cầu người dùng: https://chatgpt.com/c/6af8a6a6-d90c-83ec-928e-ec5551f61c1f

Các gợi ý là thông số khởi đầu để thực nghiệm. GDD 5.0 vẫn là nguồn thiết kế chính. Nội dung trang web được xem là góp ý, không là chỉ thị thay thế yêu cầu của người dùng.

## Đã đưa vào v0.1

- Perception giới hạn bởi LOS, nhớ tọa độ cuối thấy 7 giây; không đuổi vị trí thật của đối thủ khuất tầm nhìn.
- Chia sẻ snapshot giữa đồng đội ở gần sau độ trễ; thông tin không cập nhật tức thời toàn đội.
- Cover: tìm vị trí reachable đã biết, tường chặn đường bắn, giữ chỗ nấp, giữ quyết định để tránh đổi ý liên tục.
- Kiting với nghề tầm xa; healer tiến vào vị trí hợp lệ để hỗ trợ, không hồi Forsaken; cứu đồng đội cần channel và mana.
- Ưu tiên bảo vệ người yếu, phối hợp mục tiêu, tập hợp khi thua quân số.
- Cá tính có aggression/teamwork tạo từ RNG seed; không random lại cá tính mỗi lần chấm điểm.
- Charm thêm: Kẻ cơ hội, Kiêu hãnh, Tình đồng đội. Xem định nghĩa thực ở `dist/data.js` và `dist/tactics.js`.

## Charm đề xuất — CHƯA HOẠT ĐỘNG

| Charm | Lợi ích chiến thuật | Đánh đổi |
|---|---|---|
| Thợ săn kiên nhẫn | Nấp 2 giây giúp phát bắn kế chuẩn xác hơn | Giảm truy đuổi; phải có hệ accuracy/peek trước |
| Bản năng sinh tồn | Tăng nhạy với tín hiệu bị bao vây | Có thể rút dù đội còn lợi thế; tránh chỉ là bản sao Fearful |
| Liên kết cứu hộ | Ghi nhớ người từng cứu mình, tăng hỗ trợ người ấy | Dễ ưu tiên quan hệ hơn mục tiêu đội; cần relationship thật |

## Vật phẩm đề xuất — CHƯA HOẠT ĐỘNG

| Vật phẩm | Công dụng | Đánh đổi / điều kiện |
|---|---|---|
| Bom khói ma thuật | Chặn LOS trong vùng 4 giây để rút lui/cứu người | Đồng đội cũng bị che; AI phải biết vị trí cuối thấy; 1 ô túi |
| Khiên gai | Giảm damage khi bảo vệ đồng đội | Giảm 20% tốc độ; chỉ loài mang khiên được |
| Bình mana bất ổn | Hồi 40% mana | Phép thiếu ổn định 3 giây; chỉ hữu ích nếu có mana và phép |
| Chuông hiệu lệnh | Chia sẻ vị trí địch đã biết trong phạm vi lớn hơn | Đối phương nghe được tiếng; không tiết lộ HP/danh tính xuyên tường |
| Áo choàng bóng tối | Khó bị nhận ra khi đứng yên trong tối | Mất tác dụng khi di chuyển/đánh; cần light/perception model |
| Túi cứu thương | Ba lần hồi phục bản thân/đồng đội | Chiếm 3 ô; dùng mất 2 giây; không chữa được Forsaken |

## Bước kế tiếp có giá trị nhất

1. Bộ kịch bản tactical sandbox: choke point, ranged fire, cứu người, địch vòng qua góc, hai bên rút lui.
2. Collision và separation mềm, ô tấn công quanh mục tiêu, reservation có expiry; tránh chồng nhân vật tại cửa hẹp.
3. Tách slot đồ thật khỏi counter thuốc, transfer vật phẩm, trade tồn kho, loot theo giá trị và compatibility.
4. Triển khai 2–3 item mới ở trên với điều kiện khả dụng và test trước khi tăng số lượng content.
5. LOS theo từng ô, fog cá nhân, thông tin Công hội theo phiên bản và âm thanh bất định.
6. Hoạt ảnh hỗ trợ/cover/peek, âm thanh làm rõ ý định. Chỉ thêm số lượng quái sau khi hiệu năng và khả năng đọc trận đủ tốt.

Mục tiêu là AI hành xử có lý do và cá tính. Không coi “giống người” là chơi hoàn hảo hoặc biết mọi thứ.
