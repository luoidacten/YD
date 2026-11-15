# Đường ống mĩ thuật: Gemini → pixel 0x72

**Chủ quản:** Claude, giám đốc mĩ thuật. Chuẩn gốc ở `ART-DIRECTION.md`. File này hướng dẫn cách làm thực tế.

## Thứ tự ưu tiên (đừng đảo)
1. **Dùng hết 0x72 trước:** 10 vũ khí, 8 nhân vật, tim HUD, cần gạt, goo… Codex làm trong `GD/CODEX_02`. Không tốn AI, đồng nhất 100%.
2. **Icon tĩnh bằng Gemini:** HUD, status, phòng (xem `ICON-MANIFEST.json`). Đây là loại AI làm tốt nhất: 1 hình, 1 trạng thái, không cần animation.
3. **Vũ khí mới bằng Gemini:** các món 0x72 không có (nỏ, lưỡi hái, đinh ba, chùy xích, đũa phép, khiên, sách phép). Tĩnh, cỡ 10×21 đến 16×32 theo mẫu `sheet_weapons.png`.
4. **Nhân vật mới bằng Gemini:** khó nhất, cần 4 frame idle + 4 frame run đồng đều. Chỉ làm khi bước 1–3 đã ổn. Quy trình: Gemini vẽ frame idle_f0, mình chỉnh tay hoặc bằng script ra 3 frame còn lại (nhún 1 px như 0x72), run lấy chân từ sprite 0x72 cùng khổ.

## Quy trình một asset
1. **Đặt hàng:** chọn id trong `ICON-MANIFEST.json` hoặc danh sách vũ khí bên dưới.
2. **Gửi Gemini:** dùng prompt mẫu, **đính kèm** `art/reference/sheet_*.png` và `palette.png` làm tham chiếu.
   - Yêu cầu vẽ trên nền phẳng **màu magenta #FF00FF** để dễ tách nền. Không dùng nền caro giả trong suốt.
   - Mỗi lần chỉ xin 1 asset, hoặc 1 hàng 4–6 icon cùng nhóm thì cắt sau.
3. **Lưu ảnh gốc:** `art/gemini-raw/<nhóm>/<id>_vN.png`, kèm `<id>_vN.txt` ghi prompt, ngày, model. Thư mục này không commit (đã ignore).
4. **Hậu kỳ:**
   ```
   python art/tools/pixelize.py art/gemini-raw/hud/save_v1.png art/final/ui/hud/save.png --size 16x16 --outline --colors 12 --preview
   ```
   Script tách nền, thu nhỏ BOX, alpha chỉ 0/255, ép về 66 màu của bộ 0x72, viền tối 1 px.
5. **QA bằng mắt** (bản `_x8.png`), đặt cạnh `sheet_heroes.png`:
   - Đọc được hình ở 1×? Silhouette có rõ không, có bị "bùn" màu không?
   - Ánh sáng từ trên trái, viền tối giống 0x72, không có pixel lẻ loi?
   - Nếu chưa đạt: chỉnh tay vài pixel, hoặc gửi lại Gemini với ghi chú cụ thể.
6. **Duyệt:** chép sang `dist/assets/ui/<nhóm>/<id>.png`, đặt `"status":"done"` trong manifest. Ghi vào `ASSET-LICENSES.md` mục **AI-generated (Gemini)**, kèm ngày và prompt. **Không** gắn nhãn CC0.
7. `python art/tools/pixelize.py --check <file> --size WxH` phải ra OK trước khi giao cho Codex.

## Lấy ảnh từ Gemini về máy (đã kiểm chứng 2026-11-15)
- Trình duyệt tích hợp **không lưu được file tải xuống**. Cách đang dùng: chạy JS trong trang Gemini, cắt từng icon theo lưới, lấy trung bình BOX về 32×32, ánh xạ sang palette 0x72, nén run-length thành chuỗi, rồi dán vào `art/gemini-raw/<nhóm>/sheet_vN.txt` và chạy `python art/tools/decode_browser_icons.py`.
- Nếu người dùng tự tải ảnh gốc về `Downloads`, chạy thẳng `pixelize.py` trên ảnh gốc. Cách này cho chất lượng tốt nhất.
- Gemini vẽ chi tiết cỡ khoảng 32 px dù được yêu cầu 16 px. Từ nguồn 32 px sạch, dùng `--method mode --bg none` và **không** dùng `--outline`, vì Gemini đã tự có viền.
- Gemini có thể hiểu sai đề (đề "thanh đồng" ra "thỏi vàng"). Mô tả bằng hình dạng, đừng dùng từ có hai nghĩa.

## Prompt mẫu

### Icon HUD 16×16 (dùng cho mọi id nhóm hud/room)
> Pixel art game icon, exactly 16x16 pixels, of: **{brief}**. Match the attached 0x72 DungeonTileset II reference: same palette (attached), 1-pixel dark outline (#222222), top-left light source, hard pixel edges, no anti-aliasing, no gradients, no text, no drop shadow. Centered, fills about 80% of the canvas. Draw it large on a flat solid magenta #FF00FF background, with every pixel a crisp square block (render each art pixel as a 32x32 block, total 512x512 image).

### Icon status 8×8
> Pixel art status-effect icon, exactly 8x8 pixels, of: **{brief}**. Maximum 4 colors from the attached palette plus a dark outline #222222. Must be readable at 8x8 — simplest possible silhouette. Hard pixel edges, no anti-aliasing. Flat magenta #FF00FF background, each art pixel drawn as a 64x64 block (512x512 image).

### Vũ khí mới (tĩnh, dựng đứng mũi lên trên như 0x72)
> One pixel-art weapon sprite, **{W}x{H}** pixels, vertical with the tip pointing up, like the attached 0x72 weapon sheet: **{weapon}**. Same palette, same metal shading (3 tones of gray-blue steel, warm brown wood handle), 1-px dark outline, no anti-aliasing, no glow baked in. Flat magenta #FF00FF background, each art pixel drawn as a 16x16 block.

Danh sách vũ khí AI đề xuất (đợt 1): Nỏ (crossbow, 14×16, ngang), Lưỡi Hái (scythe, 14×32), Đinh Ba (trident, 9×32), Chùy Xích (flail, 12×24), Đũa Phép Xương (bone wand, 6×16), Khiên Tròn (round shield, 12×12), Sách Phép (spellbook, 12×12).

### Nhân vật (frame idle_f0, giai đoạn 4)
> One pixel-art character, exactly 16x28 pixels canvas (body about 16x22, feet on the bottom row), facing right, idle pose, of: **{character}**. Match the attached 0x72 hero sheet exactly in proportions (big head, short body), palette, 1-px dark outline and shading. No anti-aliasing, no gradients. Flat magenta #FF00FF background, each art pixel as a 16x16 block.

## Giấy phép và minh bạch
- Ảnh AI **không** được ghi là CC0. Ghi "AI-generated with Google Gemini, post-processed; project asset" kèm ngày.
- Lưu prompt cho mọi asset đã duyệt (tham chiếu tới file `.txt` trong raw).
- Không đưa ảnh tham chiếu có bản quyền của game khác (Soul Knight…) vào prompt. Chỉ dùng 0x72 CC0.

## Rút kinh nghiệm đợt v0.4 (2026-11-15)
| Loại | Cách cho kết quả tốt | Công cụ |
|---|---|---|
| Icon HUD, hiệu ứng phép | Prompt "chunky … 16x16 grid with big square pixels (~14 screen px)". Gemini vẽ đúng lưới khoảng 15,5 px, nên lấy mẫu trực tiếp với `scale:15.5, tl:true` | `decode_browser_icons.py` |
| Quái (hình khối đơn giản) | Gemini vẽ lưới khoảng 7,5 px (gấp đôi 0x72). Lấy mẫu native 32×32 rồi thu `reduce2x.py`: ưu tiên màu nền, vẽ lại viền | `reduce2x.py`, `animate.py char --float/--legs` |
| Nhân vật người | **Không** dùng Gemini. Kitbash từ thân 0x72 (đổi màu, thêm phụ kiện) để giữ nguyên animation gốc | `kitbash_chars.py` |
| Vũ khí | Gemini chỉ để lấy concept. Bản cuối vẽ tay bằng bản đồ ASCII, vì nét mảnh của Gemini bị mất khi thu nhỏ | `handpixel_weapons.py` |
| Animation | idle squash 0/1/2/1 px, run bob kèm chân luân phiên (phân tích từ knight/goblin của 0x72); fx dùng pulse/spin/flicker/rise | `animate.py` |
- Ngay cạnh ảnh có watermark ngôi sao của Gemini. Lấy mẫu theo lưới ô và kiểm tra icon ở góc phải dưới.
- Trong JS, hàm `window.__yd(W,H,{cc,grid,rows,scale,tl,uniform})` chỉ tồn tại tới khi tải lại trang. Mã gốc nằm trong lịch sử phiên; nên chép ra `art/tools/browser_extract.js` khi cần dùng lại.
