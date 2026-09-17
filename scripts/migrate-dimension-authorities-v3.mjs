import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found === 0) {
    if (text.includes(after)) return
    throw new Error(`${path}: expected pattern not found: ${before.slice(0, 120)}`)
  }
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}`)
  writeFileSync(path, text.split(before).join(after))
}

replaceExact(
  'docs/GAME_CREATION_PIPELINE.md',
  'Portée actuelle : créer le prototype et toute sa production en portrait selon [Zones MiniFugg](MINIFUGG_ZONES.md), sur une largeur logique de 390 et une enveloppe artistique maximale `390 × 844`.',
  'Portée actuelle : créer le prototype et toute sa production en portrait selon [Zones MiniFugg](MINIFUGG_ZONES.md), sur une largeur logique de 390, un nouveau MASTER `390 × 850` et une zone de jeu garantie `390 × 710`.'
)

replaceExact(
  'docs/GAME_ART_PRODUCTION_PIPELINE.md',
  "All assets are authored for the game's declared logical viewport, normally `390×844` portrait or `844×390` landscape.",
  "All new portrait assets are authored for the game's declared logical viewport, normally `390×850`; existing approved `390×844` portrait games/assets remain valid until a dedicated migration. Existing landscape games may retain `844×390` for maintenance."
)
replaceExact(
  'docs/GAME_ART_PRODUCTION_PIPELINE.md',
  '- Does the 390×844 (or declared viewport) composition remain unchanged across device ratios?',
  '- Does the 390×850 new-production composition (or the game’s explicitly declared legacy viewport) remain unchanged across device ratios?'
)

replaceExact(
  'docs/GAME_MIGRATION_PLAN.md',
  "2. Confirm the game's fixed logical viewport (`390×844` portrait or `844×390` landscape by default).",
  "2. Confirm the game's fixed logical viewport: new portrait production targets `390×850`; an existing approved portrait game may remain explicitly `390×844` until this migration changes its geometry; existing landscape games may retain `844×390`."
)

replaceExact(
  'docs/PHASER_SKILLS.md',
  '- MiniFugg uses a fixed portrait MASTER `390×844`: width-first uniform scaling on mobile and official `360:650` reference-ratio scaling (`704.17` logical units high at width 390) on PC. HAUT/BAS may be cropped while the exploitable window remains complete. Do not adopt generic `FIT` shrinkage or responsive reflow from a framework example.',
  '- New MiniFugg portrait production uses a fixed MASTER `390×850` with a guaranteed `390×710` gameplay window: width-first uniform scaling on mobile and 710-unit guaranteed-window scaling on PC. Existing approved `390×844` games remain supported without stretching until migrated. HAUT/BAS may be cropped while the guaranteed window remains complete. Do not adopt generic `FIT` shrinkage or responsive reflow from a framework example.'
)

replaceExact(
  'docs/STYLE_SYSTEM.md',
  '- portrait: `390 × 844` logical units;',
  '- portrait: `390 × 850` logical units for new production; existing approved `390 × 844` compositions remain valid until migrated;'
)

replaceExact(
  '.agents/skills/minifugg-art/SKILL.md',
  'python3 .agents/skills/minifugg-art/scripts/art_files.py inspect cover.png --size 390x844 --format PNG --alpha opaque',
  'python3 .agents/skills/minifugg-art/scripts/art_files.py inspect cover.png --size 390x850 --format PNG --alpha opaque'
)

replaceExact(
  'docs/WELCOME_ART_STYLES.md',
  'Compose the exact `390 × 844` MASTER and keep the title and principal subject out of MONNAIE, RAIL and JOUER.',
  'For new production, compose the exact `390 × 850` MASTER and keep the title and principal subject out of MONNAIE, RAIL and JOUER. Existing approved `390 × 844` covers remain valid and are not stretched or regenerated merely to add 6 pixels.'
)
replaceExact(
  'docs/WELCOME_ART_STYLES.md',
  'Produce a full-bleed static `390 × 844` master with the exact title as the only default text, no Core UI or CTA, and continuous expendable artwork in the lower crop zone.',
  'Produce a full-bleed static `390 × 850` master for new work with the exact title as the only default text, no Core UI or CTA, and continuous expendable artwork in the lower crop zone. Preserve any already approved `390 × 844` master unchanged unless a dedicated migration is requested.'
)

replaceExact(
  'docs/PLATFORM_VISUAL_VALIDATION.md',
  'The official exploitable phone viewport is `360 × 650`. This phone rule remains active when a mobile browser exposes a desktop-sized CSS layout viewport (for example a `980px` viewport in a desktop-site mode). On a true tablet or PC, the centered Core column keeps the same `360 × 650` ratio as gameplay: CENTRE fills the useful height and determines the displayed width.',
  'The canonical guaranteed gameplay/Core window is `390 × 710`. This phone rule remains active when a mobile browser exposes a desktop-sized CSS layout viewport (for example a `980px` viewport in a desktop-site mode). On a true tablet or PC, the centered Core column keeps the same `390 × 710` ratio as gameplay: CENTRE fills the useful height and determines the displayed width.'
)
replaceExact(
  'docs/PLATFORM_VISUAL_VALIDATION.md',
  'Regression coverage: official Chrome/Safari `360 × 650`, A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712` (about `360 × 657` normalized), A54 Brave `360 × 611` as a degraded below-minimum case, narrow-phone/desktop-layout `980 × 1663`, tablet `1024 × 768`, and desktop `1280 × 720`, including Cover → Phaser.',
  'Regression coverage: guaranteed logical window `390 × 710`, A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712`, A54 Brave `360 × 611` as a degraded below-minimum case, narrow-phone/desktop-layout `980 × 1663`, tablet `1024 × 768`, and desktop `1280 × 720`, including Cover → Phaser.'
)
replaceExact(
  'docs/PLATFORM_VISUAL_VALIDATION.md',
  'The `390 × 844` phone reference and a tall desktop frame are\ncovered by a dedicated browser regression test.',
  'The new `390 × 850` MASTER, the guaranteed `390 × 710` window, legacy `390 × 844` scenes and a tall desktop frame are\ncovered by dedicated browser regression checks.'
)

replaceExact(
  'docs/PLATFORM_REDESIGN.md',
  '- MASTER `390 × 844`, fenêtre exploitable officielle `360 × 650` — équivalent logique `390 × 704,17` —, vocabulaire de `MINIFUGG_ZONES.md`.',
  '- Nouvelle production : MASTER `390 × 850`, zone garantie `390 × 710`, vocabulaire de `MINIFUGG_ZONES.md`. Les rigs/masters expérimentaux déjà produits en `390 × 844` restent legacy compatibles jusqu’à leur reprise dédiée.'
)
replaceExact(
  'docs/PLATFORM_REDESIGN.md',
  'La Home bis alpha `/?usr=moigod&lab=home-bis` est le prototype fonctionnel de cette direction. Sur PC, elle applique la règle canonique : la fenêtre exploitable au ratio `360 × 650` du téléphone occupe toute la hauteur utile, tandis que les marges recadrables du MASTER `390 × 844`, la coque et le bras continuent hors cadre.',
  'La Home bis alpha `/?usr=moigod&lab=home-bis` est le prototype fonctionnel historique de cette direction. Son rig de téléphone reste actuellement authored en `390 × 844` et doit être traité comme une source legacy compatible, sans étirement. Lors de sa prochaine reprise, la règle canonique est la zone garantie `390 × 710` dans le MASTER `390 × 850`; sur PC cette zone occupe toute la hauteur utile, tandis que les marges recadrables, la coque et le bras continuent hors cadre.'
)
replaceExact(
  'docs/PLATFORM_REDESIGN.md',
  'Le raccord se termine lorsque la fenêtre au ratio officiel `360 × 650` remplit la hauteur PC : l’écran MASTER reste plus haut que le viewport et sa coque sort en haut et en bas.',
  'Le raccord se termine lorsque la zone garantie canonique `390 × 710` remplit la hauteur PC : l’écran MASTER reste plus haut que le viewport et sa coque sort en haut et en bas. Le pilote actuel peut encore utiliser son rig legacy `390 × 844` jusqu’à sa reprise dédiée.'
)

replaceExact(
  'src/core/StaticCoverArt.tsx',
  "import type { GameWelcomeVariant } from './types'",
  "import { MINIFUGG_MASTER_VIEWPORT } from './runtime/gameRuntimePolicy'\nimport type { GameWelcomeVariant } from './types'"
)
replaceExact(
  'src/core/StaticCoverArt.tsx',
  'const preservedTitleHeight = Math.max(0, Math.min(844, variant.preserveTitleHeight ?? 0))',
  'const preservedTitleHeight = Math.max(0, Math.min(MINIFUGG_MASTER_VIEWPORT.height, variant.preserveTitleHeight ?? 0))'
)

console.log('Dimension authority migration applied.')
