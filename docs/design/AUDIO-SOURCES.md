# Audio sources — Kenney CC0

Downloaded and verified on **2026-11-15 (Asia/Saigon)** from the creator's official website. All ten selected files are unchanged Ogg Vorbis clips; only filenames were shortened. Total selected audio is approximately **122 KB**.

## License evidence

**Author:** Kenney Vleugels / Kenney.nl.

- **RPG Audio**: https://kenney.nl/assets/rpg-audio — the official page lists `License: Creative Commons CC0`, 50 files. The downloaded archive includes `License.txt`, retained locally as `dist/assets/audio/License-Kenney-RPG.txt`.
- **Digital Audio**: https://kenney.nl/assets/digital-audio — the official page lists `License: Creative Commons CC0`, 60 files. The downloaded archive includes `License.txt`, retained locally as `dist/assets/audio/License-Kenney-Digital.txt`.
- **License:** Creative Commons Zero v1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/.

Both original license files explicitly permit personal and commercial use; attribution to Kenney is appreciated but not mandatory. These are sound assets, independent from the game's 0x72 visual assets.

Official downloads were obtained using the page's current **Continue without donating → signed download link** flow. Old public archive URLs now return HTML and were not treated as audio files.

## Selected files and suggested events

Paths below are relative to `dist/assets/audio/`.

| Local file | Original archive file | Pack | Duration | Suggested game event |
|---|---|---|---:|---|
| `ui-click.ogg` | `Audio/metalClick.ogg` | RPG Audio | 0.446 s | Card selection, small UI confirmation |
| `sword.ogg` | `Audio/knifeSlice.ogg` | RPG Audio | 0.600 s | Melee swing |
| `hit.ogg` | `Audio/chop.ogg` | RPG Audio | 0.240 s | Physical hit/damage |
| `coin.ogg` | `Audio/handleCoins.ogg` | RPG Audio | 0.846 s | Coins looted, trade or expedition reward |
| `build.ogg` | `Audio/bookPlace1.ogg` | RPG Audio | 0.277 s | Room blueprint placed/build confirmed |
| `trap.ogg` | `Audio/metalLatch.ogg` | RPG Audio | 0.261 s | Corridor trap mechanically triggers |
| `boss.ogg` | `Audio/doorClose_4.ogg` | RPG Audio | 0.603 s | Heavy boss gate/arena activation; this is a heavy door slam, not a monster voice |
| `magic.ogg` | `Audio/zap1.ogg` | Digital Audio | 1.019 s | Magical projectile; use quietly to suit pixel fantasy |
| `heal.ogg` | `Audio/powerUp3.ogg` | Digital Audio | 1.149 s | Healing, summon or level-up |
| `reinforcement.ogg` | `Audio/lowThreeTone.ogg` | Digital Audio | 1.019 s | Reinforcement arrival warning; not advance disclosure of composition |

## Integration notes

- These are **event sound effects**, not ambient loops or a music soundtrack. No ambient asset was selected or claimed.
- Use a browser user gesture to unlock audio and provide a visible mute/volume control.
- Keep battle event gains low and apply global/per-event rate limits: larger legions must not start dozens of overlapping sounds on the same frame. Spatial attenuation to the camera/visible region is suitable.
- At ×2/×4 simulation speed, rate limits should follow audio wall time; avoid multiplying playback rate unless deliberately desired.
- The original clips have been checked for valid `OggS` container headers, Vorbis sample rates and final granule durations. Audio balance/audition should still be checked in the actual game.

## Scope

Only these ten Ogg files and two original license texts are bundled. Temporary downloaded archives and expanded source packs were removed after selection. No external runtime audio service is required.
