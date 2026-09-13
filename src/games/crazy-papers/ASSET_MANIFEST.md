# CrazyPapers — Asset Manifest

## Static cover collection — 12 September 2026

The user explicitly approved six exact source covers across two research lots. The source PNG files below are preserved byte-for-byte. Masters and runtime files are deterministic technical derivatives only; no image was regenerated, repainted or reinterpreted during integration.

| Edition | Preserved source | Master | Runtime |
| --- | --- | --- | --- |
| Pulp Disaster | `public/assets/generated/crazy-papers/welcome/variants/sources/v1-pulp-disaster-source.png` — 853×1844 PNG — SHA-256 `724fe85692ee303a02f1095c3b4eed8df7eb44a6e54b62dd0b1a2b0a0b56bbe3` | `masters/v1-pulp-disaster-master.png` — 390×844 PNG — `7fb14c5221275ff91d2641c929b80cbbc1094167c095b80366def8ba32f10867` | `runtime/v1-pulp-disaster.webp` — 780×1688 lossless WebP — `564ae3fd0461a269588d428d0c7ce1e21a9cd067fd58166ce7a0255f8757d5bb` |
| Micro Records | `sources/v2-micro-records-source.png` — 853×1844 PNG — `26046bd8f2d74404fddcd4a52c164892b10a6df24b83cce952173c23c4304ebe` | `masters/v2-micro-records-master.png` — 390×844 PNG — `73fb1fe9dec84ad875ef2edae0845198bbccba52deb34531b75dbaeac1d11e8e` | `runtime/v2-micro-records.webp` — 780×1688 lossless WebP — `82e69378cb1e550465fa0168458d268cd04b9ad6cf4dd84a753bbce282bae839` |
| Graphic Collapse | `sources/v3-graphic-collapse-source.png` — 853×1844 PNG — `3a533a3c98191852169ee4fa88f629d476cfe992d675802e8069f958280df7f3` | `masters/v3-graphic-collapse-master.png` — 390×844 PNG — `d6f47d586e09facfd016043f0606b2db8e5a42188dcb5025ed9950a15e619d2d` | `runtime/v3-graphic-collapse.webp` — 780×1688 lossless WebP — `00cc236aef65b9effe146ee105e228661c36527426bd1d6b81fc249788ec39a4` |
| Pulp Clerk | `sources/v4-pulp-clerk-source.png` — 853×1844 PNG — `d0e9e198426eca81407f56e06de73ef9b323e9715ea304a613d41d8f07c09126` | `masters/v4-pulp-clerk-master.png` — 390×844 PNG — `c6a338ef92dbcad02f48c5f715197271c4954f5bdb3c794dd3375b5857d07043` | `runtime/v4-pulp-clerk.webp` — 780×1688 lossless WebP — `5e90ef9f9d36192a381e4b42ba69a4541860cb0b2a7f220a37b0eafa531e48a0` |
| Constructivist Clerk | `sources/v5-constructivist-clerk-source.png` — 853×1844 PNG — `135849abd66221ee913a2a8ffcc4f4f91e08a2d99f11e3134f89e20923e4cd03` | `masters/v5-constructivist-clerk-master.png` — 390×844 PNG — `1463841b8fa8de0046a5d23b40a4ad89c1b021bcd358c5b666d4c1b0e48f4e80` | `runtime/v5-constructivist-clerk.webp` — 780×1688 lossless WebP — `1864eaa9edd87810e040f7fc8cc014caff010e47971bd7a822be09cbe5f59f1e` |
| Shōwa Paper Wave | `sources/v6-showa-paper-wave-source.png` — 853×1844 PNG — `179948b55f8e3ecda96d57d0110b7bda941d2eadec777361bcb7206c174c03a0` | `masters/v6-showa-paper-wave-master.png` — 390×844 PNG — `e60995162e2ec74a4cd172ede105669449a229956bb7a74bb6a75500437bef76` | `runtime/v6-showa-paper-wave.webp` — 780×1688 lossless WebP — `83bbddbf27616c3037db1f72789326943ec1d844680424db7ec5171a87de5e95` |

## Production rules and derivative method

- Closed raster text list: the exact title `CrazyPapers`/`CRAZYPAPERS` already present in each approved source; no Core control is baked into the art.
- `scripts/build-crazy-papers-covers.py` crops only about `0.915` source pixel in total from the horizontal perimeter to reach the exact `390:844` ratio, then resamples directly from the preserved source. It never stretches the image.
- Masters are opaque, one-frame PNG files at exactly `390 × 844`.
- Runtime derivatives are opaque, one-frame `780 × 1688` WebPs with a `VP8L` lossless payload.
- Core owns MONNAIE, RAIL and JOUER. The six user-calibrated positions are `13.2%`, `26.4%`, `36%`, `bottom`, `bottom` and `55.4%`. Five title strips are read from the untouched top of the same raster and feathered over the calibrated base crop; `Constructivist Clerk` needs no title preservation layer. No raster is edited or regenerated.
- All six variants are available during the platform alpha. Their future unlock scores remain recorded in `welcome.ts`.
- No animated, CSS-layered or Phaser cover runtime exists for CrazyPapers.

## Validation state

- Artistic source approval: user-confirmed for all six images on 12 September 2026.
- File checks: source/master/runtime decoding, dimensions, opacity, hashes and lossless WebP payload are verified by the cover build and test scripts.
- Browser usage: A54 Brave `360×611`, A54 Chrome `360×656`, MASTER `390×844` and desktop `1280×720` pass with all six editions, full useful width, calibrated vertical crops, JOUER/title clearance, edition selection, play and return-to-cover checks.
- Runtime errors: none reported by the dedicated cover matrix or the generic gameplay pass.
