# DESIGN_08 — Nâng gameplay, hệ quản lý, cảm giác chơi và địa hình

**Người viết:** Claude (quản lý + giám đốc mĩ thuật). **Ngày:** 2026-11-16.
**Brief code:**
- `CODEX_08`: màn chọn Tầng Chủ + cảm giác đòn đánh;
- `CODEX_09`: biome/tilemap;
- `CODEX_10`: quản lý và chiều sâu gameplay;
- phần sửa UI nằm trong `CODEX_07` mục "Sửa lỗi tràn/dính".

**Hiện trạng** (CODEX.md "Giới hạn thực tế"):
- Campaign chỉ là chuỗi wave hai tầng; chưa có research, phe phái hay crafting.
- AI tốt nhưng người chơi **khó thấy** điều đang xảy ra.
- Sau trận không có báo cáo, nên người chơi không biết bố cục nào hiệu quả.
- Trận đánh thiếu cảm giác va chạm.

Ba trụ cột cần nâng: **đọc được trận đánh**, **quyết định có ý nghĩa giữa các wave**, **cảm giác tay**.

## 1. Cảm giác chơi (game feel)
Asset đã vẽ: `yd/fx/{hit_spark,slash,crit,heal,death_puff,bone_chips,telegraph}`, `ui/kit/digits_{dmg,crit,heal,hurt}`. Xem `art/MOCKUP-COMBAT-FX.png`.

| Sự kiện | Phản hồi hình | Phản hồi chuyển động | Âm |
|---|---|---|---|
| Đòn trúng thường | `hit_spark` tại điểm trúng; sprite nạn nhân chớp trắng 2 frame; số trắng bay lên 10 px rồi mờ dần | Nạn nhân lùi 1 px theo hướng đòn | Tiếng "tick" theo vật liệu (xương, thịt, giáp) |
| Đòn chém cận chiến | `slash` theo hướng nhìn của kẻ đánh | — | Tiếng vung |
| Chí mạng | `crit`, số vàng to ×1,5 kèm "!" | **Hit-stop 50 ms** (chỉ khung hình render, không đổi tick mô phỏng) | Tiếng nặng |
| Hồi máu | `heal` + số xanh "+n" | — | Tiếng chuông nhẹ |
| Gục / chết | `death_puff` (quái xương thì `bone_chips`); sprite mờ theo bậc 3 frame | Rung màn hình 2 px nếu là boss hoặc elite | Tiếng vỡ |
| Boss tung chiêu | Ô `telegraph` lặp phủ vùng, viền vàng nhấp nháy 2 frame | Boss bar rung khi chuyển giai đoạn; màn hình rung 3 px khi chiêu nổ | Còi cảnh báo |
| Hero cuối cùng gục | Chậm ×0,3 trong 0,4 s, sau đó mới hiện banner thắng | — | Kèn thắng |
| Nhặt vàng / hồn | 3–6 đồng xu bay theo đường cong về capsule HUD; số đếm tăng dần | Capsule nảy 1 px | Leng keng |
| Đặt thẻ | Thẻ bay từ khay vào ô bản đồ; bụi đá khi phòng mọc lên | Rung 1 px | Tiếng đá |
| Mở cổng (bắt đầu wave) | Banner pixel quét ngang "ĐỢT 03 · 5 MẠO HIỂM GIẢ"; cửa vào mở theo frame | — | Tiếng tù và |

**Quy tắc:**
- Mọi hiệu ứng là **trình bày**: không dùng `Game.random()`, không đổi state, nên soak hash giữ nguyên.
- Nguồn ngẫu nhiên riêng cho FX là `Math.random` hoặc một seed render tách biệt.
- Cài đặt có các mục: "Rung màn hình", "Số sát thương", "Hit-stop" (mặc định bật). `prefers-reduced-motion` tắt rung và hit-stop.
- Gom số sát thương cùng mục tiêu trong 0,2 s thành 1 số, để không bị dính chữ.

## 2. Đọc được trận đánh
- **Vòng phe** dưới chân: hero viền vàng, quái viền xanh, boss viền đỏ đôi. Chỉ hiện khi rê chuột hoặc khi đang chọn.
- **Icon trạng thái 8×8** trên đầu (tối đa 3, thêm "+n" nếu nhiều hơn): burn, poison, slow, root, curse, shield, taunt, stun. Asset này còn nợ trong `ICON-MANIFEST` mục status; giám đốc mĩ thuật vẽ ở đợt sau.
- **Ý định của hero** (tùy chọn "Hiện ý định"): mũi tên mờ tới phòng hero định tới, icon nhỏ (rương, chìa, cứu bạn, rút lui). Dữ liệu này đã có trong utility AI.
- **Nhật ký có lọc:** Tất cả / Chiến đấu / Kinh tế / Boss. Bấm một dòng thì camera nhảy tới sự kiện đó.

## 3. Quản lý giữa các wave
1. **Báo cáo Công hội (trước wave):** thẻ giấy da hiện đoàn sắp tới gồm class, cấp, 1 nét tính cách nổi bật và mục tiêu (cướp rương, giải cứu, săn boss, do thám). Độ chi tiết tăng theo phòng `spyroom`.
2. **Bảng tổng kết (sau wave):**
   - sát thương theo phòng, số hạ theo quái, MVP quái;
   - **heatmap đường đi của hero**;
   - vàng, hồn và EXP nhận được;
   - hero thoát ra bằng lối nào.
   Mục đích: người chơi biết bố cục nào hiệu quả.
3. **Danh sách quái:** bảng có lọc theo phòng/loài.
   - Cột cấp, HP, mệt mỏi, morale, vũ khí.
   - Nút "Nghỉ" chuyển quái về barracks một wave để hồi mệt.
4. **Duy trì (upkeep):** mỗi wave, mỗi quái tốn 1 mana duy trì; quái lớn tốn 2, boss 0.
   - Thiếu mana thì quái yếu nhất "bỏ đi" (có cảnh báo trước).
   - Mục đích: chặn chiến thuật nhồi quái, buộc chọn chất lượng.
5. **Sách Hắc Thuật (research)** dùng hồn. Ba nhánh, mỗi nhánh 4 bậc, bậc sau cần bậc trước:
   - **Kiến trúc:** +1 slot phòng; tường dày (phòng +15% HP); cửa bẫy; mở biome thứ 2 cho một tầng.
   - **Quân đoàn:** giảm upkeep; tiến hóa sớm 1 cấp; elite xuất hiện trong gói bài; quái hồi 25% HP giữa wave.
   - **Hắc Thuật:** phép chủ nhân thứ 2; đổi bộ Tầng Chủ miễn phí; Ấn Tầng mạnh hơn 25%; bẫy hồi chiêu nhanh hơn.
6. **Tai tiếng (Infamy) 0–100:** tăng khi hero chết trong hầm, giảm khi hero thoát.
   - Infamy cao: đoàn mạnh hơn và có class hiếm, nhưng vàng rơi ×1,5 và mở hợp đồng thưởng.
   - Người chơi có thể "ẩn mình": thả 1 hero đi qua để giảm Infamy.
7. **Sự kiện giữa wave (1 trong 3 thẻ):**
   - thương nhân bóng tối (mua vật phẩm bằng hồn);
   - lời nguyền (debuff đổi lấy vàng);
   - khách lạ (một quái lang thang xin gia nhập);
   - Công hội đổi luật (wave sau chỉ có cung thủ).
   Tất cả rút theo seed.

## 4. Chiều sâu chiến đấu
- **Combo bẫy:** dầu + lửa → cháy lan; băng + nước đầm → đóng băng ô; gai + đẩy lùi (minotaur húc) → thêm sát thương. Mỗi combo có tên, hiện log "COMBO!", và được đưa vào bảng tổng kết.
- **Mục tiêu đoàn đa dạng:** ngoài cướp rương, có thể là giải cứu tù nhân (phòng giam), săn Tầng Chủ, hoặc phá Ấn Tầng (đập 3 cột ấn). Mỗi kiểu buộc người chơi phòng thủ khác nhau.
- **Mệt mỏi:** quái đánh liên tục 2 wave thì giảm 10% sát thương. Phòng nghỉ và barracks có ý nghĩa thật.

## 5. Biome cho tầng (tilemap đa dạng)
Asset: `yd/tiles/<biome>/`. Mỗi biome có đủ 47 tile **cùng tên** với 0x72 (floor_1..8, wall_*, column, doors_*, floor_spikes…), cộng `prop_*` và `liquid_anim_f0..3` (lava, đầm, băng). Xem `art/SHOWCASE-BIOMES.png`.

| Biome | Tên | Luật tầng | Hợp với | Đạo cụ |
|---|---|---|---|---|
| dungeon | Hầm Đá Cổ (mặc định) | — | mọi thứ | cột, cờ |
| forest | Rừng Cổ | Bụi rậm: quái đứng trong bụi được ẩn (ambush +); hero bị rễ làm chậm 10% | druid, treant, harpy, werewolf | cây, bụi, nấm, gốc cây |
| cave | Hang Đá | Tối: tầm nhìn mọi phe −30%; đuốc là nguồn sáng | gargoyle, kobold, Nữ Hoàng Nhện | măng đá, pha lê, đá vụn |
| ice | Hầm Băng | Sàn trơn: dừng chậm hơn (trượt 1 ô khi bị đẩy); nước băng làm chậm | Phù Thủy Băng Giá, ice zombie | trụ băng, sọ đông |
| lava | Lò Dung Nham | Ô dung nham gây burn; forge +25% sản lượng | salamander, Ác Ma, imp | lò lửa, đá obsidian |
| swamp | Đầm Lầy | Ô nước đầm gây poison nhẹ + chậm; xác chết thối nhanh (hồi sinh khó) | naga, scorpion, giant rat | sậy, lá súng |
| crypt | Hầm Mộ | Quái họ Xương +10% HP; holy của hero +10% | Kẻ Chiêu Hồn, Vua Xương | bia mộ, đống xương, quan tài |

- Chọn biome khi **mở tầng**: hiện 2 biome theo seed, người chơi chọn trước màn chọn Tầng Chủ.
- Nếu boss hợp biome (cột "Hợp với") thì thẻ boss có tag "Đất Nhà" và Ấn mạnh hơn 10%. Màn chọn boss hiện tag này.
- Ô liquid là **tile nguy hiểm** đặt bằng thẻ "Địa hình" trong phòng (không chặn đường đi). Hero tránh nếu biết; AI dùng chi phí đường đi.

## 6. Ưu tiên (đề xuất thứ tự cho Codex)
1. CODEX_07 (HUD pixel + sửa tràn chữ). Đây là nền cho mọi UI khác.
2. CODEX_08: màn chọn Tầng Chủ + game feel. Thấy ngay, rủi ro gameplay thấp.
3. CODEX_09: biome. Có thay đổi luật tầng, cần soak.
4. CODEX_10: quản lý (báo cáo, tổng kết, research, upkeep, infamy, sự kiện). Nhiều hệ, chia nhỏ commit.
