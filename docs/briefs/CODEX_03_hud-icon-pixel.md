# CODEX_03 — Đường ống icon HUD pixel (thay ký tự unicode)

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex. **Có thể làm song song với CODEX_02.**

## Bối cảnh
HUD hiện dùng ký tự unicode trộn với sprite: thanh đầu dùng `♜ ☰ ↻ ▦ ⚑ ✦ ♪ ↓`, status trong `catalog.js` dùng `symbol:'↑' '»' '◇' '⬡' '◉'…`. Các ký tự này vẽ bằng font hệ thống, không phải pixel 16×16, nên lệch phong cách 0x72 (xem `docs/design/ART-DIRECTION.md`, quy tắc 3 và 7).

Giám đốc mĩ thuật đang làm bộ icon pixel (Gemini cộng hậu kỳ `art/tools/pixelize.py`). Hình sẽ được giao dần vào `dist/assets/ui/`. Đề bài này chỉ dựng **đường ống** để icon nào có thì hiện, icon nào chưa có thì giữ ký tự cũ.

## Hợp đồng asset (cố định, không tự đổi tên)
- Đường dẫn `dist/assets/ui/<nhóm>/<id>.png`. PNG có alpha 0/255, **16×16** (status: **8×8** và **16×16**).
- Danh sách id chuẩn nằm ở `art/ICON-MANIFEST.json`, do giám đốc mĩ thuật cập nhật. Codex chỉ đọc file này.
- Nhóm:
  - `hud/`: menu, reset, layout, world, catalog, audio_on, audio_off, save, help, sigil, souls, pause, speed1, speed2, speed4, grid, zoom_in, zoom_out
  - `status/`: một file cho mỗi status id có `symbol` trong `catalog.js`/`expansion-data.js`, tên file = status id
  - `room/`: một file cho mỗi key của `ROOMS` (dùng thay sprite quái đang mượn làm icon phòng)
  - `card/`: khung lá bài `frame_<tone>.png`, 9-slice 48×64, viền 6 px

## Nhiệm vụ
1. `dist/icons.js`: nạp `assets/ui/manifest.json` (bản build chép từ `art/ICON-MANIFEST.json`, chỉ chứa id đã có file). Xuất `icon(group,id,fallbackText)` trả về `<img class="px-icon">` nếu có, nếu không trả về `<span>` chứa ký tự cũ.
2. Thay mọi chỗ in ký tự trên thanh đầu, nút camera và tốc độ, status chip, icon phòng bằng `icon()`. Giữ `aria-label` và `title` như cũ.
3. Trong canvas (`painter.js`), status trên đầu nhân vật dùng bản 8×8 nếu có. Vẽ nearest-neighbor, căn số nguyên pixel.
4. CSS `.px-icon{image-rendering:pixelated;width:16px;height:16px}`. Ở HUD phóng ×2 bằng số nguyên, không dùng 1.5×.
5. `scripts/build.mjs`: kiểm tra mọi file trong manifest tồn tại, đúng kích thước, alpha chỉ 0/255. Sai thì fail build.
6. Khung lá bài: nếu có `card/frame_<tone>.png` thì dùng `border-image` 9-slice; nếu không thì giữ CSS cũ.

## Tiêu chí nghiệm thu
- [ ] Khi `assets/ui/` rỗng, giao diện giống hệt trước. So bằng ảnh chụp.
- [ ] Đã có sẵn 6 icon trong `dist/assets/ui/hud/`: layout, world, catalog, audio_on, save, help (status `done` trong manifest). Chỉ 6 nút đó đổi; menu/reset/sigil vẫn dùng ký tự cũ.
- [ ] Build fail khi cố tình bỏ vào một PNG 17×16 hoặc có alpha 128.
- [ ] Không có request mạng ra ngoài. Không có font web.
- [ ] `npm test` xanh. Cập nhật `CODEX.md` (mục kiến trúc và bất biến UI).

## Không làm
- Không tự vẽ icon hay sinh ảnh.
- Không đổi bố cục HUD.
