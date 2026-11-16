# CODEX_08 — Màn chọn Tầng Chủ và cảm giác đòn đánh

**Người giao:** Claude. **Người làm:** Codex.
**Đọc trước:**
- `GD/DESIGN_06` (luật chọn boss, đã giao ở CODEX_06);
- `GD/DESIGN_08` mục 1–2;
- `GD/CODEX_07` (HUD pixel, bắt buộc xong trước).

**Mockup:** `art/MOCKUP-BOSS-PICK.png`, `art/MOCKUP-COMBAT-FX.png`.

## A. Màn chọn Tầng Chủ (UI của CODEX_06-B)
- **Modal phủ tối:** nền game tối 80%, không pause mô phỏng (đang ở phase chuẩn bị).
  - Ribbon tiêu đề: "CHỌN TẦNG CHỦ · TẦNG n".
  - Phụ đề 1 dòng.
- **3 thẻ** khung `ui/kit/card_boss` (slice 16), 176×254 ×2:
  - **Giếng chân dung:** `panel_inset` + một hàng tile sàn của biome tầng đó. Boss ×2 (cao hơn 34 px thì ×1,5), **chạy idle animation**.
  - **Tên** trên `ribbon`; dòng lối đánh (style).
  - **4 dòng chiêu:** icon `skill_<kind>` + tên chiêu; nhãn "GĐ2"/"GĐ3" căn phải cho chiêu mở muộn.
  - **Ô giấy da Ấn Tầng:** mỗi Ấn một dòng, có icon `seal`. Nếu boss hợp biome thì thêm tag "ĐẤT NHÀ".
  - **Nút vàng** "CHỌN · giá" có icon xu. Không đủ vàng thì nút disabled kèm tooltip "Thiếu n vàng".
- **Hover thẻ:** nhấc thẻ 6 px theo bậc, đổi nút sang hover.
- **Click chiêu:** tooltip chi tiết (sát thương, bán kính, hồi chiêu), lấy từ dữ liệu `BOSS_POOL`.
- **Nút đá dưới cùng** "ĐỔI BỘ · 50 VÀNG (1 lần)". Đã dùng thì disabled và đổi chữ "ĐÃ ĐỔI BỘ".
- **Bàn phím:** ←/→ chọn thẻ, Enter chọn, R đổi bộ. Không có nút đóng (bắt buộc chọn), nhưng Esc mở menu game như thường.
- **Chữ không được tràn:** tên chiêu dài thì cắt "..", và tooltip hiện đủ. Kiểm tra theo quy tắc CODEX_07 mục "Sửa lỗi tràn/dính".

## B. Hiệu ứng đòn đánh (renderer, chỉ trình bày)
**Asset:**
- `yd/fx/{hit_spark,slash,crit,heal,death_puff,bone_chips}_anim_f0..3`;
- `yd/fx/telegraph_anim_f0..1` + `telegraph_edge`;
- `ui/kit/digits_{dmg,crit,heal,hurt}.png`: dãy ký tự "0123456789!+", mỗi ô 8×12.

1. **Hàng đợi sự kiện trình bày:**
   - `game.event()` hiện có phát `{type:'hit'|'crit'|'heal'|'down'|'boss'|'loot'...}`.
   - Painter tiêu thụ hàng đợi và tự giữ danh sách hiệu ứng với tuổi/frame.
   - **Không** ghi gì vào `state`, **không** gọi `Game.random()`.
2. Hiệu ứng theo bảng DESIGN_08 mục 1:
   - spark, slash, crit;
   - chớp trắng 2 frame (vẽ sprite qua mask trắng);
   - lùi 1 px;
   - death puff (xương thì dùng bone chips);
   - fade theo bậc.
3. **Số sát thương:**
   - Vẽ từ sheet digits; bay lên 10 px trong 0,6 s theo bậc 2 px.
   - Gộp cùng mục tiêu trong 0,2 s; lệch ngang ±4 px xen kẽ để không chồng số.
4. **Hit-stop 50 ms** khi chí mạng hoặc khi boss trúng đòn. Dừng **vòng render**, mô phỏng vẫn chạy đủ tick. Rung màn hình 2–3 px (boss, elite gục, chiêu boss nổ).
5. **Telegraph boss:** thay hình tròn/đường mượt bằng tile `telegraph` lặp, cắt theo hình vùng, và viền 2 px vàng nhấp nháy giữa 2 frame.
6. **Loot bay về HUD:** xu và hồn theo đường cong 0,5 s tới capsule; capsule nảy 1 px; số tăng dần.
7. **Banner wave** khi Mở cổng; **slow-mo ×0,3 trong 0,4 s** khi hero cuối gục (chỉ render).
8. **Cài đặt** (menu): Rung màn hình / Số sát thương / Hit-stop, lưu localStorage (bọc try/catch). `prefers-reduced-motion` thì tắt rung và hit-stop.

## Tiêu chí nghiệm thu
- [ ] Test và build xanh. **Soak hash seed 1–50 trùng 100% trước/sau** (vì FX chỉ là trình bày).
- [ ] Test màn chọn: đủ 3 thẻ, nút disabled khi thiếu vàng, đổi bộ một lần, phím tắt chạy, không tràn chữ (dùng hàm audit của CODEX_07 trên modal).
- [ ] Ở ×4 tốc độ với 20 đơn vị đánh nhau, FPS ≥ 55 trên máy dev. Giới hạn 64 hiệu ứng sống, bỏ cái cũ nhất khi vượt.
- [ ] Ảnh `screenshots/v08-*.jpg`:
  - (1) màn chọn Tầng Chủ;
  - (2) chí mạng có số vàng;
  - (3) telegraph boss;
  - (4) xu bay về HUD;
  - (5) tắt rung trong cài đặt.
