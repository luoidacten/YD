# CODEX_07 — HUD và UI kiểu pixel đồng bộ với art 0x72

**Người giao:** Claude (quản lý + giám đốc mĩ thuật). **Người làm:** Codex.
**Mục tiêu:** UI hiện là dashboard web (Segoe UI/Consolas, panel phẳng xanh rêu, viền vàng 1 px, chữ nhỏ, 3 cột ăn mất nửa màn hình), lệch hẳn với thế giới pixel ấm của 0x72. Cần đổi sang khung đá pixel, font pixel, thẻ bài kiểu bài thật, và bản đồ là nhân vật chính.
**Tham chiếu bắt buộc:**
- `art/showcase/MOCKUP-HUD-v1.png`: bố cục và cảm giác đích, 640×360 phóng ×2.
- `art/showcase/UI-KIT-v1.png`: toàn bộ chi tiết.
- Ảnh hiện trạng: `docs/screenshots/v04-hud-icons.jpg`.
**Không đổi gameplay.** Chỉ HTML/CSS/painter vẽ overlay. Soak hash phải giữ nguyên.

## Asset đã giao (`dist/assets/ui/kit/`, kèm `kit.json` ghi `w`, `h`, `slice`)
| Nhóm | File | Cách dùng |
|---|---|---|
| Khung | `panel_stone` (slice 8), `panel_inset` (4), `panel_parchment` (8), `ribbon` (8) | `border-image: url(...) 8 fill / 16px round` (×2) |
| Nút | `btn_{normal,hover,pressed,disabled}`, `btn_gold_*` (slice 5) | Nút thường dùng đá; nút chính ("Mở cổng", "Chọn boss") dùng vàng. `:active` = pressed, dịch chữ xuống 2 px |
| Tab | `tab_on`, `tab_off` (slice 4) | Tab lọc thẻ, tab tầng |
| Thẻ | `card_{room,resident,trap,barrel,elite}` (52×58, không kéo giãn) | Art giữa (24 px ×2), tên trong plate dưới, giá ở viên ngọc góc trái trên |
| Thanh | `bar_frame` (slice 3) + `fill_{hp,mana,soul,xp}` (4×4, lặp ngang) | Thanh HP inspector, mana, XP |
| Boss | `boss_bar` (160×16, slice 14) | Thay `#boss-bar` hiện tại; fill HP màu soul, chữ "GIAI ĐOẠN n" |
| Tài nguyên | `capsule_{gold,mana,souls}` (slice `4 4 4 15`) | Ô tài nguyên trên topbar, icon nằm trong giếng bên trái |
| Icon | `icon_{pause,speed1,speed2,speed4,audio_off}` 16×16 | Thay các nút tốc độ 1×/2×/4× bằng chữ. Cập nhật `ICON-MANIFEST.json` → done |

Mọi ảnh: `image-rendering: pixelated`, chỉ phóng **số nguyên lần** (×2 mặc định, ×3 khi màn hình ≥ 2400 px). Không dùng `border-radius`, `box-shadow` mờ hay gradient CSS.

## Font pixel "YD Pixel 5x7" (tự làm, có đủ tiếng Việt)
- Dữ liệu: `dist/assets/ui/font/ydpixel.json`, gồm 214 ký tự (ASCII, 134 chữ có dấu tiếng Việt, `· × →`).
  - Mỗi glyph là `{w, px:[[x,y]...]}`, `cellHeight` 14, `baseline` 13, `spacing` 1.
  - Nguồn: `art/tools/pixelfont.py`; ảnh mẫu `art/final/_font_sample.png`.
- **Việc của Codex:** viết `scripts/build-font.mjs` (không thêm dependency) để dựng `dist/assets/ui/font/ydpixel.woff2`, hoặc `.ttf` nếu woff2 cần thư viện.
  - Mỗi pixel là một contour vuông, unitsPerEm = 14 × 64.
  - Chạy trong `node scripts/build.mjs`.
  - Test: font chứa đủ mọi ký tự xuất hiện trong chuỗi UI của `dist/*.js` (quét chuỗi tiếng Việt). Thiếu thì build fail và báo giám đốc mĩ thuật.
- **CSS:**
  - `@font-face{font-family:'YD Pixel';src:url(assets/ui/font/ydpixel.woff2)}`.
  - Cỡ chữ là bội của 14 px (14 / 28); `-webkit-font-smoothing:none`; `font-synthesis:none`.
  - Fallback khi font lỗi: `Consolas, monospace`.
- Số liệu lớn (vàng, timer) dùng cỡ 28 px; chữ thân dùng 14 px. Không dùng chữ nhỏ hơn 14 px.

## Bố cục mới (đúng như mockup)
1. **Topbar cao 60 px:**
   - Ribbon đỏ có tên game.
   - 3 capsule tài nguyên.
   - Tiêu đề wave ở giữa.
   - Nút vàng "Mở cổng" bên phải.
   - Menu, Reset, Lưu, Âm thanh, Trợ giúp gom vào **một nút Menu** (dropdown panel đá).
2. **Rail trái 104 px:** tab tầng (T1, T2, …) và các nút lọc lớp nhìn (phòng, cư dân, cửa).
   - Danh sách phòng chuyển vào dropdown của tab tầng.
   - Số "Các phòng 0/10" đặt trên tab tầng.
3. **Bản đồ** chiếm phần còn lại, trong `panel_inset`, và **không có chữ hướng dẫn chen vào**:
   - Hướng dẫn đưa xuống dòng gợi ý ở khay thẻ.
   - Minimap thu nhỏ còn 1/2 ở góc dưới trái.
   - Nút tốc độ dùng icon, ở góc dưới phải.
   - Boss bar nằm giữa trên.
4. **Ngăn phải 260 px (`panel_stone` + `panel_parchment`):**
   - Thông tin đang chọn có chân dung ×2 và thanh HP pixel.
   - Ấn Tầng / chiêu dưới đó.
   - Nhật ký bên dưới, chữ màu theo loại: cảnh báo vàng, chết đỏ.
   - Ngăn **thu gọn được** (nút mũi tên). Khi đang đánh mà không chọn gì thì tự thu, nhường chỗ cho bản đồ.
5. **Khay thẻ dưới 132 px:**
   - Thẻ 52×58 ×2. Hover thì nhấc thẻ 12 px; thẻ không đủ tài nguyên thì tối đi và viên ngọc chuyển xám.
   - Tab lọc nằm bên phải khay, kèm dòng gợi ý phím tắt.
6. **Inspector, modal (Hồ sơ Công hội, chọn Tầng Chủ của CODEX_06) và tooltip** dùng `panel_stone` + `panel_parchment`. Tooltip có mũi tên pixel.

## Chuyển động nhẹ (pixel, không easing mượt)
- Nút: hover đổi sang sprite hover; nhấn thì dịch 2 px.
- Thẻ: nhấc lên theo bậc 2 px trong 3 frame.
- Số tài nguyên thay đổi: nhấp nháy màu vàng 2 lần; giảm thì nhấp nháy đỏ.
- Boss bar: khi chuyển giai đoạn thì rung ±2 px trong 0,3 s.
- Toast: trượt vào theo bậc 4 px.
- Tôn trọng `prefers-reduced-motion`.

## Tiêu chí nghiệm thu
- [ ] `node --test tests/v2.test.mjs` và `node scripts/build.mjs` xanh. Soak hash seed 1–50 giữ nguyên so với trước khi sửa UI.
- [ ] Không còn `Segoe UI`/`Georgia`/`border-radius`/gradient trong CSS (trừ fallback font).
- [ ] Ở 1280×720, bản đồ chiếm ≥ 60% diện tích (hiện khoảng 45%). Ở 1920×1080, mọi UI ×2 đều nét, không pixel lẻ (kích thước chẵn).
- [ ] Mọi chuỗi tiếng Việt hiển thị đúng dấu bằng YD Pixel (chụp màn hình cận cảnh).
- [ ] Ảnh `docs/screenshots/v07-*.jpg`, so với `art/showcase/MOCKUP-HUD-v1.png`:
  - (1) chuẩn bị;
  - (2) đang đánh, có boss bar;
  - (3) inspector quái;
  - (4) menu mở;
  - (5) 1920×1080.
- [ ] Không sửa file trong `assets/ui/kit` hay `assets/ui/font`. Thiếu mảnh nào (dropdown, scrollbar, checkbox…) thì liệt kê để giám đốc mĩ thuật vẽ.

## Sửa lỗi tràn/dính chữ — áp cho HUD pixel mới (không vá CSS cũ)
Giám đốc mĩ thuật đã kiểm tra game thật ngày 2026-11-16, ở cỡ 1280×720 và 1024×640. **Các lỗi phải hết sau khi chuyển sang HUD mới:**

| # | Lỗi hiện tại | Nguyên nhân | Cách sửa trong HUD mới |
|---|---|---|---|
| 1 | Tên thẻ 2–3 dòng bị mất dòng đầu ("Phòng rương trung tâm" chỉ còn "rương trung tâm") | `.card-name` rộng 60 px, cao cố định, nội dung căn dưới | Thẻ 104×116 (52×58 ×2): tên nằm trong plate dưới, **tối đa 2 dòng**, `overflow-wrap:anywhere`. Dài hơn thì cắt "…" và tooltip hiện tên đủ. Art ở giếng riêng, không chung khối với chữ |
| 2 | Khoảng 50 phần tử chữ 7–10 px (nhãn, giá "mana", version, kbd) | Cỡ chữ lẻ | YD Pixel chỉ có 14 px hoặc 28 px. Nhãn phụ dùng màu nhạt, **không** dùng cỡ nhỏ hơn |
| 3 | Minimap che khoảng 35% bản đồ ở 1024 px; dòng hướng dẫn đè lên minimap | Minimap cố định 166 px; hướng dẫn nằm trong khung map | Minimap = 18% chiều rộng map (tối thiểu 96 px), thu gọn được; hướng dẫn dời xuống khay thẻ |
| 4 | `.layout` tràn dọc 5 px, `.dock` tràn 5 px (sinh thanh cuộn/cắt mép) | Tổng chiều cao cố định > viewport | Grid `grid-template-rows: 60px 1fr 132px` với `min-height:0` cho map; không đặt chiều cao px cho panel con |
| 5 | Icon topbar 16 px không có nhãn, sát nhau | — | Gom vào nút Menu (đã có trong bố cục mới); icon còn lại tối thiểu 32×32 (×2), cách nhau ≥ 8 px |
| 6 | Bản đồ chỉ khoảng 25% màn ở 1024 px | 3 cột cố định | Ngăn phải thu gọn; < 1180 px thì ngăn phải thành drawer phủ lên map |
| 7 | Select "Toàn cảnh hầm ngục" chữ 10 px, khó bấm | Select mặc định của trình duyệt | Thay bằng dropdown pixel (`panel_stone` + `btn_*`). Thiếu mảnh mũi tên dropdown thì báo giám đốc mĩ thuật |
| 8 | Footer lặp lại phím tắt đã có ở khay | — | Bỏ footer; dòng gợi ý duy nhất nằm ở khay thẻ |

**Quy tắc bắt buộc cho mọi UI mới** (CODEX_08, 09, 10 cũng phải theo):
1. Mọi khối chữ có `max-width` theo ô chứa, ellipsis 1 dòng (`white-space:nowrap;overflow:hidden;text-overflow:ellipsis`) hoặc clamp 2 dòng. Phần bị cắt phải có `title`/tooltip.
2. Khoảng cách tối thiểu giữa 2 khối chữ kề nhau là 8 px (4 px art ×2); giữa icon và chữ là 4 px. Không chồng chữ lên sprite: sprite nằm trong giếng riêng.
3. Số liệu dùng `font-variant-numeric: tabular-nums` (YD Pixel đã đều nhau). Ô số có độ rộng cố định theo số ký tự lớn nhất (vàng tới 99999), để số đổi không xô lệch hàng.
4. Chữ trên sprite trong canvas (tên, HP) có viền tối 1 px ×2. Tên đơn vị chỉ hiện khi chọn/rê chuột, boss thì luôn hiện. Các nhãn trên map tự né nhau: dịch dọc theo bậc 8 px nếu chồng.
5. Ba breakpoint phải chụp kiểm tra: 1024×640, 1280×720, 1920×1080. Không có thanh cuộn ngang ở cả 3.

**Công cụ kiểm tra** (Codex viết `scripts/ui-audit.js`, chạy được trong trình duyệt và trong test DOM nếu có):
- Liệt kê phần tử có chữ mà `scrollWidth > clientWidth + 1` hoặc `scrollHeight > clientHeight + 1` (trừ vùng cuộn có chủ ý).
- Liệt kê phần tử có `font-size < 14px`.
- Liệt kê cặp phần tử lá có chữ mà khung chữ nhật giao nhau > 2 px.
- Thêm vào nghiệm thu: **0 lỗi** ở 3 breakpoint, ở các màn: chuẩn bị, đang đánh, inspector, menu, chọn Tầng Chủ, tổng kết.
