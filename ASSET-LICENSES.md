# Asset provenance

## 0x72 — 16×16 DungeonTileset II v1.7

- Author: Robert / 0x72
- Official source: https://0x72.itch.io/dungeontileset-ii
- Download: official itch.io upload 9911410, `0x72_DungeonTilesetII_v1.7.zip`, downloaded 2026-11-15 (Asia/Saigon).
- License: Creative Commons Zero v1.0 Universal (CC0). https://creativecommons.org/publicdomain/zero/1.0/
- The author's page explicitly states “You can use this tileset for whatever you like (CC-0).” and lists “Asset license: Creative Commons Zero v1.0 Universal”.
- Local files: `dist/assets/frames/*.png`, unchanged individual frames from the archive.
- Presentation adds nearest-neighbor scaling, procedural lighting, particles and UI; these are application code.

## Audio — Kenney CC0

10 local OGG clips are included in `dist/assets/audio`. Sources: [RPG Audio](https://kenney.nl/assets/rpg-audio) and [Digital Audio](https://kenney.nl/assets/digital-audio). Both packs are CC0. Exact original filenames, mappings and bundled license paths are recorded in `AUDIO-SOURCES.md`.

## Fonts and generated presentation

The v0.2 interface uses system fonts (Segoe UI/Consolas); no remote font request is required. Barrels, status symbols, telegraphs, lighting and UI frames are drawn by application code.

No Gemini-generated or other AI-generated raster images have been included in v0.2. Future artwork must match 0x72's pixel scale and palette. Variants reuse/tint the original sprites; they are not new animation sets.

## Bổ sung kho quái/vũ khí (2026-11-15)

Đã kiểm tra lại trang tác giả https://0x72.itch.io/dungeontileset-ii : CC0. Không tải pack pha phong cách khác. Đưa thêm các frame nguyên gốc đã đóng gói vào gameplay: imp, chort, wogol, orc_warrior, orc_shaman, masked_orc, lizard_m, lizard_f, tiny_zombie, big_zombie; elf_f cho cung thủ. Weapon frames gồm bow/bow_2, throwing_axe, knife, red/green_magic_staff, double_axe, katana, baton_with_spikes, spear, saw_sword, hammer. Vẫn dùng animation idle/run gốc; projectile và dấu cấp rương do renderer vẽ.
