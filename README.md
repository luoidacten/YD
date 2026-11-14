# YOUR DUNGEON? — Hầm ngục của bạn

Playable vertical slice v0.1, dựa trên GDD 5.0. Pixel 16×16; bộ CC0 0x72 là chuẩn hình ảnh. Nhịp giao chiến vừa phải, có pause và ×1/×2/×4 theo lựa chọn của người chơi.

## Chạy

Cần Node.js 20+. Không có dependency cần cài.

```powershell
cd C:\Users\ACER\Desktop\YD\your-dungeon
node server.mjs
```

Mở http://127.0.0.1:4173. Kiểm tra: `node --test tests/game.test.mjs`. Kiểm tra đầu ra: `node scripts/build.mjs`. Có thể host nguyên thư mục `dist` trên static hosting. Nên chơi trên desktop màn hình ngang; giao diện có bố cục thu gọn cho màn hình nhỏ.

## Cách chơi

- Chọn thẻ xây phòng, chọn ô nét đứt kề phòng có sẵn. Mỗi phòng tự tạo lối nối với phòng kề.
- Chọn thẻ triệu hồi rồi chọn nền phòng. Chọn cư dân → **Đổi vị trí** để bố trí lại trước trận.
- Bấm **Mở cổng**. Hết giờ chuẩn bị thì tự mở. Chọn bất kỳ nhân vật để xem HP, Charm, hành động và Utility.
- Chủ nhân dùng 15 mana để hồi 35 HP cho một cư dân được chọn; Forsaken chặn hồi HP.
- **Space**: pause; **G**: lưới và đường đi; **Esc**: hủy chọn; cuộn chuột: zoom; kéo chuột phải: pan.
- Khi pause giai đoạn chuẩn bị, xây dựng/triệu hồi/đổi vị trí/hồi sinh đều bị khóa.
- Chỉ thua khi kẻ mang kho báu trung tâm thoát qua lối ra hoặc dịch chuyển hợp lệ. Lấy kho báu, đánh rơi và thu hồi đều là trạng thái thật.
- Lưu tự động mỗi 15 giây và khi chuyển giai đoạn; nút **Lưu** lưu ngay. Bản lưu nằm trong LocalStorage của đúng trình duyệt và địa chỉ đang chơi.

## Đã hoạt động

| Phần | Hành vi có thể kiểm tra |
|---|---|
| Dungeon | Construction grid 5×3, phòng có nội thất 5×5 ô di chuyển, nối hành lang, giới hạn 10 phòng/15 cư dân, kiểm tra đường đến kho báu, camera |
| Simulation | Fixed step 30 Hz; render riêng; ×2/×4 tăng bước mô phỏng, không tăng damage trực tiếp; RNG có seed |
| Nhân vật | Lord, Goblin, Skeleton, Slime; Knight, Rogue, Mage, Priest. HP/mana/level/EXP/trang bị/Charm/danh tính lưu lại |
| Perception | Tường chặn LOS; nhìn trong 8 ô; ký ức 7 giây ghi tọa độ cuối thấy; chia sẻ snapshot sau ít nhất 0,35 giây với đồng đội nhìn thấy trong 5 ô; không đuổi tọa độ thật của địch bị khuất |
| Utility | Đánh giá lệch nhịp 2–3,3 lần/giây, cá tính cố định theo seed; hysteresis 0,12 và thời gian giữ quyết định 0,7 giây, có ngoại lệ khẩn cấp |
| Chiến thuật | Chọn mục tiêu có xét đồng đội, Bảo hộ ưu tiên chặn đối thủ gần đồng đội yếu; nấp sau tường có reservation; ranged kite giữ LOS; tu sĩ di chuyển để hồi máu, cứu người bị hạ qua channel 2,5 giây bị gián đoạn bởi sát thương; tập hợp khi áp đảo |
| Nhận thức mục tiêu | Mạo hiểm giả khám phá phòng nhìn thấy qua lối nối; ghi phòng đã đến; chỉ hướng đến kho báu đã phát hiện. UI người chơi vẫn hiển thị toàn bản đồ |
| Inventory | Túi giới hạn ô; thuốc và kho báu chính tính vào số ô; item ID duy nhất, kiểm tra lại quyền sở hữu khi transfer; đầy túi ảnh hưởng retreat/loot; trang bị không tính trùng trong túi |
| Charm | Blessed, Violent, Fearful, Forsaken, Battle Frenzy, Greedy, Guardian, Opportunist, Proud, Camaraderie; lưu độc lập với trang bị |
| Room | Gai gây damage; nghĩa địa tái tạo Skeleton; giếng thêm mana giữa màn và cản dịch chuyển; cửa hàng bán thuốc 20 vàng có chuyển vàng thật; kho nhử có 30 vàng thật |
| Expedition | Chuẩn bị → giao chiến → kết quả → màn kế; rút lui; Mage có thể channel cổng 3 giây, mất 25 mana; kho báu bị chiếm/rơi/thu hồi/thoát; game over |
| Progression | EXP hỗ trợ và tham chiến, lên cấp; Goblin cấp 3 tự chọn nhánh dựa Charm/trang bị, giữ danh tính/ký ức/Charm; hồi sinh 5 linh hồn và Skeleton tái tạo miễn phí nếu có nghĩa địa |
| Guild | Lưu người rút lui và ký ức; cùng nghề có thể quay lại cấp cao hơn. Đây là mô hình đơn giản, chưa phải tình báo thế giới đầy đủ |

## Chưa triển khai / giới hạn cần biết

- Một tầng và một vòng phòng thủ liên tiếp; chưa có campaign, nhiều tầng, nâng cấp tầng, direct control, spell targeting trên map, tuyển dụng/giao ước, crafting/research, faction world simulation.
- Thẻ hiện là palette mua bằng tài nguyên, chưa phải deck rút ngẫu nhiên, thẻ tiêu hao hay Fate Cards.
- Túi hiện chứa chiến lợi phẩm vàng; thuốc có counter tính ô. Chưa có item stacking, chia thuốc, đổi đồ giá trị thấp, inventory drag/drop, trang bị nhiều slot và tự đổi trang bị.
- Trang bị có power/durability, vũ khí dùng chung đơn giản. Chưa có thư viện vật phẩm RPG, kháng damage theo nguyên tố và skill tree đầy đủ.
- Slime dùng sprite slug từ bộ 0x72. Tiến hóa Goblin thêm vũ khí vàng; các nhánh chưa có bộ hoạt ảnh riêng.
- Cover dùng tường và cửa phòng để chặn LOS. Cột, thùng, nội thất là đồ trang trí, chưa là vật cản. Có logic nghe giao chiến ở mức phòng trong 12 ô, không tiết lộ danh tính/HP. Chưa có peek animation, âm thanh phát ra loa, suppression, collision tách đám đông hoặc formation steering.
- AI tìm đường trên nav grid hiện có. Khám phá giới hạn mục tiêu theo phòng đã thấy; chưa có fog of war theo từng ô hay bản đồ Công hội có phiên bản.
- AI nhân vật có độ trễ và khác biệt cá tính, chưa phải mô phỏng con người hoàn chỉnh. Không dùng LLM trong game.
- Hồi sinh tại chỗ trong trận hiện chỉ Priest, mỗi mục tiêu một lần/màn. Chưa có kéo lê người gục, đưa qua cổng, rescue animation riêng.
- Shop có nguồn thuốc không giới hạn trong v0.1; chưa có tồn kho hoặc định giá tùy chỉnh. Do đó không tuyên bố đã đáp ứng acceptance test tồn kho shop.
- Nhân vật rút lui được ghi thành hồ sơ; khi quay lại tạo entity mới liên kết bằng tên/nghề, chưa bảo toàn đầy đủ entity ID và đồ của adventurer qua màn.
- Các item/Charm chỉ nằm trong `DESIGN-NOTES.md` mà không có trong `data.js` là đề xuất, không hoạt động.
- Chưa có âm thanh. Font từ Google Fonts có fallback; sprite/gameplay không cần mạng sau khi đã tải trang.

## Cấu trúc

- `dist/data.js`: định nghĩa phòng, loài, Charm, thẻ.
- `dist/engine.js`: vòng mô phỏng, map/nav, kinh tế, giao chiến, loot, tiến hóa, save state.
- `dist/tactics.js`: perception, trí nhớ, cover reservation, chấm Utility.
- `dist/render.js`: Canvas, pixel sprites, lighting, hoạt ảnh và debug path.
- `dist/main.js`: UI, tương tác người chơi, save/load và accumulator.
- `tests/game.test.mjs`: các tình huống tích hợp và chiến thuật, chạy bằng Node test runner.
- `GDD.md`: tài liệu người dùng cung cấp, giữ nguyên nội dung.
- `ASSET-LICENSES.md`: nguồn tải và giấy phép.
- `ART-DIRECTION.md`: tiêu chuẩn đồ họa cho nội dung tương lai.

## Kiểm thử v0.1

24 bài kiểm tra tự động: xây hợp lệ/không hợp lệ, đường đi/LOS, pause/build, Forsaken, túi và quyền sở hữu, Violent, Frenzy, perception/ký ức/chia sẻ, cover reservation, kiting, support/rescue, Charm khác hành vi, đầy túi, đánh rơi/thoát kho báu, chống dịch chuyển, tiến hóa/hồi sinh, save/RNG, fixed timestep và hai màn chơi liên tiếp.
