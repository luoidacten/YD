# CODEX_09 — Biome và tilemap đa dạng theo tầng

**Người giao:** Claude. **Người làm:** Codex. **Đọc trước:** `GD/DESIGN_08` mục 5. **Ảnh:** `art/SHOWCASE-BIOMES.png`.

## Asset (`dist/assets/frames/yd/tiles/<biome>/`, biome ∈ forest, cave, ice, lava, swamp, crypt)
- 47 tile cùng tên với 0x72: `floor_1..8`, `floor_stairs`, `floor_ladder`, `floor_spikes_anim_f0..3`, `wall_*`, `column`, `column_wall`, `doors_*`.
  Renderer chỉ cần đổi tiền tố đường dẫn: `tilePath(name, biome) = biome==='dungeon' ? name : 'yd/tiles/'+biome+'/'+name`.
- `prop_*.png` (vật trang trí, kích thước khác nhau, đáy là chân đứng):
  - forest: tree, bush, mushroom, stump;
  - cave: stalagmite, crystal, rocks;
  - ice: ice_pillar, frozen_skull;
  - lava: brazier, obsidian;
  - swamp: reeds, lily;
  - crypt: tombstone, bone_pile, coffin.
- `liquid_anim_f0..3.png` cho lava, swamp, ice: ô 16×16 lặp được, chạy 4 frame mỗi 0,6 s. Vẽ thêm viền tối 1 px ở cạnh giáp ô thường bằng code (autotile đơn giản: kiểm tra 4 hướng).
- Tile và prop không có trong biome nào thì fallback về 0x72. Không crash.

## Việc cần làm
1. **Dữ liệu:**
   - `BIOMES` (id, tên, luật, đạo cụ, danh sách loài/boss "Đất Nhà");
   - `state.floors[f].biome` (save cũ thiếu thì mặc định `dungeon`).
2. **Chọn biome khi mở tầng:** rút 2 biome theo seed, hiện modal nhỏ (khung `card_boss`, chân dung là một ô phòng mẫu). Chọn xong mới tới màn chọn Tầng Chủ. Tầng 0 đầu game dùng `dungeon`, kèm tùy chọn "Đổi biome" mở khi có research Kiến trúc bậc 4.
3. **Renderer:**
   - Vẽ sàn/tường theo biome của tầng.
   - Rải prop trang trí theo seed render: tối đa 3 prop/phòng, không đặt trên đường đi hay ô cửa, không chặn LOS. **Prop chỉ để trang trí**, trừ bụi rậm của forest (xem 4).
4. **Luật tầng** (áp ở **một** hàm `biomeRules(floorId)`, gọi từ các chỗ tính hiện có: tầm nhìn, tốc độ, status):

| Biome | Luật |
|---|---|
| forest | Bụi rậm (prop bush) là ô ẩn: quái đứng đó có ambush như Mimic; hero −10% tốc độ trên ô có rễ |
| cave | Tầm nhìn mọi phe −30%; đuốc trên tường cho tầm nhìn bình thường trong bán kính 4 |
| ice | Đẩy lùi đi xa thêm 1 ô (không xuyên tường); liquid băng làm chậm 40% |
| lava | Liquid lava gây burn (dùng `applyStatus`); forge +25% sản lượng |
| swamp | Liquid đầm gây poison nhẹ + chậm 20%; hồi sinh ở grave chậm hơn 30% |
| crypt | Quái `family:'bone'` +10% HP; holy của hero +10% |

5. **Thẻ "Địa hình":** đặt liquid của biome vào ô trong phòng (giá 2 mana/ô, tối đa 6 ô/phòng).
   - Không chặn đường đi; `path` tăng chi phí cho phe biết ô đó nguy hiểm.
   - Hero chưa biết thì đi thẳng vào (dùng `knownTraps` như bẫy).
6. **Đất Nhà:** boss có biome trùng thì Ấn mạnh hơn 10%; thẻ boss (CODEX_08) hiện tag.

## Tiêu chí nghiệm thu
- [ ] Test và build xanh. Soak seed 1–50 với tầng `dungeon` trùng hash trước/sau. Thêm soak riêng cho mỗi biome (10 seed/biome): không phát sinh kẹt, kèm bảng tỉ lệ thắng theo biome.
- [ ] Mọi tile được tham chiếu tồn tại cho cả 7 biome (test tự quét).
- [ ] Save cũ load được, mặc định là `dungeon`.
- [ ] Ảnh `screenshots/v09-<biome>.jpg` cho 6 biome, mỗi ảnh có liquid và prop, cùng ảnh modal chọn biome.
