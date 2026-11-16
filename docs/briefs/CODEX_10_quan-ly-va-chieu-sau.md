# CODEX_10 — Quản lý giữa các wave và chiều sâu gameplay

**Người giao:** Claude. **Người làm:** Codex. **Đọc trước:** `docs/briefs/DESIGN_08` mục 2–4.
**UI:** mọi màn dùng kit CODEX_07 (`panel_stone`, `panel_parchment`, `btn_*`, `tab_*`, `bar_*`) và quy tắc chống tràn chữ.
Chia **6 commit** theo mục A–F. Mỗi mục có test và soak riêng.

## A. Báo cáo Công hội (trước wave)
- Modal giấy da khi vào phase chuẩn bị, mở lại được bằng nút trên topbar.
- Nội dung: số hero, class (chân dung ×2), cấp, **1 nét tính cách** và **mục tiêu**, lấy từ dữ liệu đoàn đã sinh sẵn theo seed.
- Mức chi tiết: không có `spyroom` thì chỉ biết số hero và 1 class; có spyroom thì biết đủ; spyroom cấp 2 thì thấy cả vũ khí.

## B. Bảng tổng kết (sau wave)
- Bộ đếm trong mô phỏng: `metrics` per wave (sát thương theo phòng, theo quái, số hạ, vàng/hồn/EXP).
  - Đã có `weaponMetrics`: **mở rộng nó, không tạo hệ thứ hai**.
- **Heatmap đường đi hero:** đếm ô mỗi 0,5 s, vẽ lên bản đồ thu nhỏ bằng 4 mức màu của palette.
- MVP quái (sát thương + số hạ), "Combo!" đã kích hoạt, lối hero thoát.
- Nút "Tiếp tục" mở sự kiện (mục E).

## C. Danh sách quái + mệt mỏi + upkeep
- Bảng quái lọc theo phòng/loài, có cột cấp, HP, mệt mỏi, morale, vũ khí. Nút "Nghỉ" (về barracks 1 wave).
- **Mệt mỏi:** đánh 2 wave liên tiếp thì −10% sát thương; nghỉ 1 wave thì về 0.
- **Upkeep** mana mỗi wave: quái 1, quái lớn 2, boss 0. Thiếu mana thì cảnh báo trong phase chuẩn bị; vào wave mà vẫn thiếu thì quái yếu nhất rời đi (log rõ).
  - Research "Quân đoàn" giảm upkeep.

## D. Sách Hắc Thuật (research bằng hồn)
- 3 nhánh × 4 bậc theo DESIGN_08 mục 3.5. Mỗi bậc là một modifier, áp qua **một** hàm `researchMods()`; không rải `if`.
- UI: cây 3 cột trên giấy da, nút học (vàng) có giá hồn; bậc khóa thì mờ và tooltip ghi điều kiện.
- Save: `state.research = {architecture:0..4, legion:0..4, dark:0..4}`.

## E. Infamy + sự kiện giữa wave
- **Infamy 0–100:** hero chết thì +, hero thoát thì −.
  - Ảnh hưởng sinh đoàn: cấp, class hiếm.
  - Vàng rơi ×(1 + infamy/200).
  - Thanh pixel trên topbar.
- **Sự kiện:** sau tổng kết, rút 3 thẻ sự kiện theo seed (thương nhân bóng tối, lời nguyền đổi vàng, quái lang thang gia nhập, Công hội đổi luật wave sau), chọn 1.
  - Dữ liệu `EVENTS`, mỗi sự kiện là một hiệu ứng có thời hạn.

## F. Combo bẫy + mục tiêu đoàn
- **Combo:** dầu+lửa (cháy lan 3 ô), băng+nước đầm (đóng băng ô 4 s), gai+đẩy lùi (+50% sát thương bẫy).
  - Phát hiện ở chỗ status/trap đang được resolve; log "COMBO! <tên>"; đếm vào metrics.
- **Mục tiêu đoàn mới:**
  - giải cứu tù nhân: cần phòng giam, nếu chưa có thì dùng `rescue.js` hiện có;
  - săn Tầng Chủ;
  - phá Ấn Tầng: 3 cột ấn spawn trong phòng boss, có HP; phá cả 3 thì Ấn tắt sớm.
  Utility AI thêm hành động tương ứng và **dùng lại** `path`/`canSeeEnemy`.

## Tiêu chí nghiệm thu
- [ ] Test và build xanh. Test mới:
  - báo cáo đúng mức chi tiết theo spyroom;
  - metrics cộng đúng;
  - upkeep: quái rời đi đúng con, deterministic;
  - research modifier áp đúng một chỗ;
  - infamy tăng/giảm;
  - sự kiện rút theo seed;
  - 3 combo kích hoạt;
  - 3 mục tiêu đoàn hoàn thành được.
- [ ] Save cũ load được (field mới mặc định 0/rỗng).
- [ ] Soak seed 1–50 cho mỗi commit: không phát sinh kẹt, tỉ lệ thắng thay đổi ±15% (ghi lý do nếu vượt), và liệt kê tần suất combo/mục tiêu.
- [ ] Ảnh `docs/screenshots/v10-*.jpg`:
  - (1) báo cáo Công hội;
  - (2) tổng kết có heatmap;
  - (3) danh sách quái;
  - (4) Sách Hắc Thuật;
  - (5) chọn sự kiện.
