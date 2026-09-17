import { readFileSync, writeFileSync } from 'node:fs'

function count(text, needle) {
  return text.split(needle).length - 1
}

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = count(text, before)
  if (found === 0) {
    if (text.includes(after)) return
    throw new Error(`${path}: expected pattern not found: ${before.slice(0, 120)}`)
  }
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}`)
  text = text.split(before).join(after)
  writeFileSync(path, text)
}

function replaceRegex(path, regex, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const matches = [...text.matchAll(new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`))]
  if (matches.length === 0) {
    if (typeof after === 'string' && text.includes(after)) return
    throw new Error(`${path}: regex not found: ${regex}`)
  }
  if (matches.length !== expected) throw new Error(`${path}: expected ${expected} regex match(es), found ${matches.length}`)
  text = text.replace(regex, after)
  writeFileSync(path, text)
}

// Agent/runtime authorities.
replaceExact(
  'AGENTS.md',
  "Gameplay has a canonical portrait width of `390` logical units. The authored MASTER is `390 × 844`. The official exploitable viewport is `360 × 650` CSS pixels; projected into the authored MASTER, its reference gameplay window is `390 × 704.17` logical units. It can be vertically anchored `top`, `center` or `bottom` inside the MASTER according to the mechanic; `center` is the default. Exact windows, terminology and screen behavior are defined in `docs/MINIFUGG_ZONES.md`.",
  "Gameplay has a canonical portrait width of `390` logical units. New production uses a `390 × 850` authored MASTER and a `390 × 710` guaranteed gameplay window. It can be vertically anchored `top`, `center` or `bottom` inside the MASTER according to the mechanic; `center` is the default. Existing approved `390 × 844` games/assets remain valid without stretching until a dedicated migration. Exact windows, terminology and screen behavior are defined in `docs/MINIFUGG_ZONES.md`."
)
replaceExact(
  'AGENTS.md',
  "On mobile, scale uniformly **from the useful width**. The 390 logical units must use the full intended game width; a shorter browser/app viewport changes only the vertical crop and must not silently shrink the game horizontally. On PC or big screen, scale uniformly from the official `360:650` reference ratio (`704.17` logical units high at authored width 390), capped by available width. Do not redesign or reflow critical gameplay geometry for PC vs phone. Do not position important game objects primarily with `vw`/`vh`.",
  "On mobile, scale uniformly **from the useful width**. The 390 logical units must use the full intended game width; a shorter browser/app viewport changes only the vertical crop and must not silently shrink the game horizontally. On PC or big screen, scale uniformly from the guaranteed `390 × 710` window, capped by available width. A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712` and Brave `360 × 611` are diagnostic device cases, not authored coordinate systems. Do not redesign or reflow critical gameplay geometry for PC vs phone. Do not position important game objects primarily with `vw`/`vh`."
)
replaceExact(
  'AGENTS.md',
  "A phone is the complete reference experience, but different browsers/PWA/Capacitor shells expose different useful heights. The game therefore chooses which vertical edge has priority: `top` keeps the upper gameplay stable, `center` distributes crop around the reference centre, `bottom` keeps the lower gameplay stable. The world remains one `390 × 844` coordinate system in every case. EXTRA HAUT/BAS may extend decoration beyond MASTER on unusually tall mobile viewports; they never carry required gameplay. Tablet/desktop lateral space belongs to Core; do not author extra left/right game or cover decoration. Core currency and CTA remain inside the 390-wide frame, while the rail stays over the portrait composition at the left.",
  "A phone is the complete reference experience, but different browsers/PWA/Capacitor shells expose different useful heights. The game therefore chooses which vertical edge has priority: `top` keeps the upper gameplay stable, `center` distributes crop around the reference centre, `bottom` keeps the lower gameplay stable. New production remains one `390 × 850` coordinate system; legacy `390 × 844` scenes keep their own coordinates until migrated. EXTRA HAUT/BAS may extend decoration beyond MASTER on unusually tall mobile viewports; they never carry required gameplay. Tablet/desktop lateral space belongs to Core; do not author extra left/right game or cover decoration. Core currency and CTA remain inside the 390-wide frame, while the rail stays over the portrait composition at the left."
)

replaceExact('GAME_DEV_SPEC.md', '- portrait: `390 × 844`;', '- portrait: `390 × 850` for new production; existing approved portrait games may remain explicitly `390 × 844` until migrated;')
replaceExact(
  'GAME_DEV_SPEC.md',
  'The full game world/UI composition is authored against this coordinate system. MASTER is `390 × 844`; CENTRE is `390 × 662`, while HAUT/BAS are crop-sensitive parts of MASTER. A physical screen only changes the uniform display scale and visible vertical slice.',
  'The new-production portrait world/UI composition is authored against `390 × 850`. The guaranteed gameplay window is `390 × 710`; in the centered case HAUT and BAS are exactly 70 units each. A physical screen only changes the uniform display scale and visible vertical slice. Existing `390 × 844` games keep their coordinates until a dedicated migration.'
)

replaceExact('docs/GAME_ENGINE_ARCHITECTURE.md', '- portrait: **390 × 844 logical units**;', '- portrait: **390 × 850 logical units** for new production; existing approved portrait games may remain explicitly **390 × 844** until migrated;')
replaceExact(
  'docs/GAME_ENGINE_ARCHITECTURE.md',
  '`scale = mobile ? availableWidth / 390 : availableHeight / (390 × 650 / 360)`',
  '`scale = mobile ? availableWidth / 390 : min(availableHeight / 710, availableWidth / 390)`'
)
replaceExact(
  'docs/GAME_ENGINE_ARCHITECTURE.md',
  'The MASTER is `390 × 844`. The official exploitable viewport is `360 × 650`, equivalent to a `390 × 704.17` logical window in the MASTER. On mobile, only HAUT/BAS may be cropped; on a proportionally taller viewport, EXTRA HAUT/BAS may exist outside MASTER. On desktop the exploitable window fills the height and HAUT/BAS are cropped; remaining space is lateral Core space.',
  'The new-production MASTER is `390 × 850`. The guaranteed gameplay window is `390 × 710`; centered, it leaves exactly 70 logical units of HAUT and BAS. On mobile, only HAUT/BAS may be cropped; on a proportionally taller viewport, EXTRA HAUT/BAS may exist outside MASTER. On desktop the guaranteed window fills the height and HAUT/BAS are cropped; remaining space is lateral Core space. Existing approved `390 × 844` scenes remain supported without rescaling until migrated.'
)

replaceExact(
  '.agents/skills/phaser-minifugg/SKILL.md',
  '- canonical authored width: `390`; art envelope: `390 × 844`; official exploitable viewport: `360 × 650`, equivalent to `390 × 704.17` in the MASTER\n- each game declares the vertical crop priority that matches its mechanic: `top`, `center` or `bottom`; `center` is the default, Vlad is bottom-anchored\n- mobile: width controls uniform scale and the useful height only changes vertical crop/reveal; it must not silently shrink the 390-wide game\n- PC/big screen: the official `360:650` reference ratio controls uniform scale, capped by available width\n- the world always remains one `390 × 844` coordinate system; vertical anchoring is a viewport decision, never a second mobile/desktop layout',
  '- canonical authored width: `390`; new-production art envelope: `390 × 850`; guaranteed gameplay window: `390 × 710`\n- existing approved `390 × 844` games/assets remain valid without stretching until a dedicated migration\n- each game declares the vertical crop priority that matches its mechanic: `top`, `center` or `bottom`; `center` is the default, Vlad is bottom-anchored\n- mobile: width controls uniform scale and the useful height only changes vertical crop/reveal; it must not silently shrink the 390-wide game\n- PC/big screen: the `390 × 710` guaranteed window controls uniform scale, capped by available width\n- the world always remains one fixed coordinate system for that game; vertical anchoring is a viewport decision, never a second mobile/desktop layout'
)

// DA authorities.
replaceExact(
  'docs/DA_GAME.md',
  'Toute étude ou intégration suit le modèle Game de [Zones MiniFugg](MINIFUGG_ZONES.md) : MASTER 390 × 844, boucle indispensable dans CENTRE, HAUT/BAS recadrables, éventuel prolongement uniquement dans EXTRA HAUT/BAS, masque RETOUR réservé au Core.',
  'Toute étude ou intégration suit le modèle Game de [Zones MiniFugg](MINIFUGG_ZONES.md) : nouvelle production en MASTER 390 × 850, gameplay indispensable dans la zone garantie 390 × 710, HAUT/BAS recadrables, éventuel prolongement uniquement dans EXTRA HAUT/BAS, masque RETOUR réservé au Core. Une référence historique 390 × 844 reste exploitable telle quelle tant qu’elle n’est pas migrée.'
)
replaceExact(
  'docs/DA_GAME.md',
  'Utiliser la largeur logique 390 et le MASTER `390 × 844`. Adapter par mise à l\'échelle uniforme pilotée par la largeur sur mobile et par la hauteur de CENTRE sur PC, sans composition différente. Les dimensions des textures peuvent être supérieures ; elles ne changent pas les coordonnées du jeu.',
  'Utiliser la largeur logique 390, le nouveau MASTER `390 × 850` et la zone garantie `390 × 710`. Adapter par mise à l\'échelle uniforme pilotée par la largeur sur mobile et par la hauteur de la zone garantie sur PC, sans composition différente. Une référence existante `390 × 844` conserve son système de coordonnées jusqu’à sa migration. Les dimensions des textures peuvent être supérieures ; elles ne changent pas les coordonnées du jeu.'
)

replaceExact(
  'docs/DA_COVER.md',
  'Pour une cover finale : illustration autonome portrait, plein cadre, master PNG lossless exactement `390 × 844` (pas un 9:16 approximatif).',
  'Pour toute nouvelle cover finale : illustration autonome portrait, plein cadre, master PNG lossless exactement `390 × 850` (pas un 9:16 approximatif). Les masters approuvés `390 × 844` restent valides et ne sont pas régénérés uniquement pour ajouter 6 pixels.'
)
replaceExact('docs/DA_COVER.md', 'La cover finale est une composition raster statique. Produire un master lossless `390 × 844`, garder titre et sujet dans les zones sûres du modèle Cover, puis fabriquer les dérivés runtime prévus par `ASSET_SIZE_REFERENCE.md`.', 'La cover finale est une composition raster statique. Pour une nouvelle production, produire un master lossless `390 × 850`, garder titre et sujet dans les zones sûres du modèle Cover, puis fabriquer les dérivés runtime prévus par `ASSET_SIZE_REFERENCE.md`. Une cover historique `390 × 844` reste une source valide et doit être calibrée sans étirement.')
replaceExact('docs/DA_COVER.md', 'Sortie statique : master PNG lossless `390 × 844`, puis dérivé WebP lossless ou AVIF validé.', 'Sortie statique : nouveau master PNG lossless `390 × 850` (ou master historique approuvé `390 × 844` conservé tel quel), puis dérivé WebP lossless ou AVIF validé.')

// Labs: only targeted constants/labels; no structural rewrite.
replaceExact(
  'src/core/LayoutLab.tsx',
  "import { MINIFUGG_PORTRAIT_CENTRE_HEIGHT, MINIFUGG_REFERENCE_VIEWPORT } from './runtime/gameRuntimePolicy'",
  "import { MINIFUGG_MASTER_VIEWPORT, MINIFUGG_PORTRAIT_CENTRE_HEIGHT, MINIFUGG_REFERENCE_VIEWPORT } from './runtime/gameRuntimePolicy'"
)
replaceExact('src/core/LayoutLab.tsx', "const STAGE = { width: 390, height: 844, label: 'PORTRAIT + COVER' } as const", "const STAGE = { ...MINIFUGG_MASTER_VIEWPORT, label: 'PORTRAIT + COVER' } as const")
replaceExact('src/core/LayoutLab.tsx', "{ id: 'phone-reference', label: 'MASTER entier', width: 390, height: 844 },", "{ id: 'phone-reference', label: 'MASTER entier', ...MINIFUGG_MASTER_VIEWPORT },")
replaceExact('src/core/LayoutLab.tsx', "['Fond complet portrait', '390 × 844', '780 × 1688', 'WebP lossless ; PNG de repli/source'],", "['Fond complet portrait', '390 × 850', '780 × 1700', 'WebP lossless ; PNG de repli/source'],")
replaceExact('src/core/LayoutLab.tsx', "['Cover statique', '390 × 844', '780 × 1688', 'AVIF ou WebP validé ; aucun contrôle Core'],", "['Cover statique', '390 × 850', '780 × 1700', 'AVIF ou WebP validé ; masters 390 × 844 historiques compatibles'],")
replaceExact('src/core/LayoutLab.tsx', "context.fillText('ZONE EXPLOITABLE - 360 x 650', safe.x + safe.width / 2, safe.y + safe.height / 2)", "context.fillText('ZONE JEU GARANTIE - 390 x 710', safe.x + safe.width / 2, safe.y + safe.height / 2)")
replaceExact('src/core/LayoutLab.tsx', '<span className="mf-layout-guide__master">MASTER · 390 × 844</span>', '<span className="mf-layout-guide__master">MASTER · 390 × 850</span>')
replaceExact('src/core/LayoutLab.tsx', '<small>360 × 650 · zone exploitable officielle.</small>', '<small>390 × 710 · zone de jeu garantie.</small>')
replaceExact('src/core/LayoutLab.tsx', "['MASTER', 'Le cadre artistique complet 390 × 844.'],", "['MASTER', 'Le cadre artistique complet 390 × 850.'],")
replaceExact('src/core/LayoutLab.tsx', "['CENTRE', 'Zone exploitable officielle 360 × 650.'],", "['CENTRE', 'Zone de jeu garantie 390 × 710.'],")
replaceExact('src/core/LayoutLab.tsx', 'max="844" value={width}', 'max="850" value={width}')
replaceExact('src/core/LayoutLab.tsx', 'max="844" value={height}', 'max="850" value={height}')
replaceExact('src/core/LayoutLab.tsx', '<li><b>Anciens masters 9:16 :</b> ils sont plus larges que 390 × 844 et perdent environ 18 % de leur largeur en plein cadre. Il faut les recadrer avec une vraie zone sûre, sans altérer les originaux validés.</li>', '<li><b>Masters historiques 390 × 844 :</b> ils restent valides et ne sont jamais étirés vers 850. Les calibrateurs affichent leur taille source réelle ; une migration artistique n’est faite que lors d’une passe dédiée.</li>')

replaceExact('src/core/layoutLab.css', 'height: calc(100cqw * 844 / 390)', 'height: calc(100cqw * 850 / 390)')
replaceExact('src/core/layoutLab.css', 'height: 8.28%', 'height: 8.235294%', 2)
replaceExact('src/core/layoutLab.css', 'inset: 8.28% 0', 'inset: 8.235294% 0')
replaceExact('src/core/layoutLab.css', 'width: calc(100cqh * 360 / 650); height: calc(100cqh * 844 * 360 / 390 / 650)', 'width: calc(100cqh * 390 / 710); height: calc(100cqh * 850 / 710)')
replaceExact('src/core/layoutLab.css', 'width: calc(100cqh * 360 / 650); height: 100cqh', 'width: calc(100cqh * 390 / 710); height: 100cqh', 2)

replaceExact(
  'src/core/CoverCalibrationLab.tsx',
  "import { MINIFUGG_PORTRAIT_CENTRE_HEIGHT, MINIFUGG_REFERENCE_VIEWPORT } from './runtime/gameRuntimePolicy'",
  "import { MINIFUGG_MASTER_VIEWPORT, MINIFUGG_PORTRAIT_CENTRE_HEIGHT, MINIFUGG_REFERENCE_VIEWPORT } from './runtime/gameRuntimePolicy'"
)
replaceExact('src/core/CoverCalibrationLab.tsx', 'const MASTER = { width: 390, height: 844 } as const', 'const MASTER = MINIFUGG_MASTER_VIEWPORT')
replaceExact('src/core/CoverCalibrationLab.tsx', 'Il représente exactement la fenêtre exploitable officielle 360 × 650', 'Il représente exactement la zone de jeu garantie 390 × 710')
replaceExact('src/core/CoverCalibrationLab.tsx', '<span className="mf-cover-calibration-master-label">MASTER · 390 × 844</span>', '<span className="mf-cover-calibration-master-label">CIBLE · 390 × 850</span>')
replaceExact('src/core/coverCalibrationLab.css', 'aspect-ratio: 390 / 844', 'aspect-ratio: 390 / 850')

replaceExact(
  'src/core/GameplayCalibrationLab.tsx',
  "  MINIFUGG_PORTRAIT_CENTRE_HEIGHT,\n  MINIFUGG_REFERENCE_VIEWPORT,",
  "  MINIFUGG_MASTER_VIEWPORT,\n  MINIFUGG_PORTRAIT_CENTRE_HEIGHT,\n  MINIFUGG_REFERENCE_VIEWPORT,"
)
replaceExact('src/core/GameplayCalibrationLab.tsx', 'const MASTER = { width: 390, height: 844 }', 'const MASTER = MINIFUGG_MASTER_VIEWPORT')
replaceExact('src/core/GameplayCalibrationLab.tsx', "{ id: 'mobile-app', label: 'Téléphone · app', width: 390, height: 844, axis: 'width' },", "{ id: 'mobile-app', label: 'Téléphone · app', ...MINIFUGG_MASTER_VIEWPORT, axis: 'width' },")
replaceExact('src/core/GameplayCalibrationLab.tsx', '⚠ Cette DA n’a pas le ratio MASTER 390 × 844.', '⚠ Cette DA n’a pas le ratio cible MASTER 390 × 850.')
replaceExact('src/core/GameplayCalibrationLab.tsx', 'min={-182} max={182}', 'min={-140} max={140}')

replaceExact(
  'src/core/GameplayCalibrationRuntime.tsx',
  "import { gameRegistry } from './gameRegistry'\nimport type { GameFinishPayload } from './types'",
  "import { gameRegistry } from './gameRegistry'\nimport { MINIFUGG_LEGACY_PORTRAIT_VIEWPORT } from './runtime/gameRuntimePolicy'\nimport type { GameFinishPayload } from './types'"
)
replaceExact('src/core/GameplayCalibrationRuntime.tsx', 'x: rect.left + point.x / 390 * rect.width,\n    y: rect.top + point.y / 844 * rect.height,', 'x: rect.left + point.x / MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.width * rect.width,\n    y: rect.top + point.y / MINIFUGG_LEGACY_PORTRAIT_VIEWPORT.height * rect.height,')
replaceExact('src/core/GameplayCalibrationRuntime.tsx', '// Real runtime interactions, expressed in the canonical 390 × 844 stage.\n      // L1: long diagonal. L2: vertical. L3: horizontal crossing L1 and L2 once each.', '// LineFugg remains on its approved legacy 390 × 844 coordinates until its dedicated geometry migration.\n      // L1: long diagonal. L2: vertical. L3: horizontal crossing L1 and L2 once each.')

replaceExact('src/core/ProductionLab.tsx', 'const MASTER_HEIGHT = 844', 'const MASTER_HEIGHT = 850')
replaceExact(
  'src/core/ProductionLab.tsx',
  "const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; cssHeight?: number }> = [\n  { id: 'off', label: 'Sans repère' },\n  { id: 'minimum', label: 'Minimum jouable 360×650', cssHeight: 650 },\n  { id: 'a54', label: 'A54 Chrome 360×656', cssHeight: 656 },\n  { id: 'iphone', label: 'iPhone 13 Pro ≈360×657', cssHeight: 657 },\n  { id: 'brave', label: 'A54 Brave 360×611', cssHeight: 611 },\n]",
  "const REFERENCE_OPTIONS: Array<{ id: ReferenceMode; label: string; logicalHeight?: number }> = [\n  { id: 'off', label: 'Sans repère' },\n  { id: 'minimum', label: 'Zone garantie 390×710', logicalHeight: 710 },\n  { id: 'a54', label: 'A54 Chrome 360×656', logicalHeight: MASTER_WIDTH * 656 / 360 },\n  { id: 'iphone', label: 'iPhone 13 Pro 390×712', logicalHeight: 712 },\n  { id: 'brave', label: 'A54 Brave 360×611', logicalHeight: MASTER_WIDTH * 611 / 360 },\n]"
)
replaceExact('src/core/ProductionLab.tsx', "{ id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute future DA conserve le stage 390×844 et la fenêtre minimale MiniFugg.', facts: ['Fenêtre officielle 360×650 = 390×704,17', 'Pas de reflow PC/mobile'],", "{ id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute nouvelle DA vise le MASTER 390×850 et garde le gameplay indispensable dans la zone garantie 390×710.', facts: ['390×710 garanti', 'Références 390×844 historiques compatibles', 'Pas de reflow PC/mobile'],")
replaceExact(
  'src/core/ProductionLab.tsx',
  "  if (!option?.cssHeight) return null\n  const height = Math.min(MASTER_HEIGHT, MASTER_WIDTH * option.cssHeight / 360)",
  "  if (!option?.logicalHeight) return null\n  const height = Math.min(MASTER_HEIGHT, option.logicalHeight)"
)
replaceExact('src/core/ProductionLab.tsx', '<small>390 × 844 · {screen.status}</small>', '<small>390 × 850 cible · {screen.status}</small>')
replaceExact('src/core/ProductionLab.css', '.mfpl-screen-art{position:relative;width:390px;height:844px', '.mfpl-screen-art{position:relative;width:390px;height:850px')
replaceExact('src/core/ProductionLab.css', '.mfpl-annotation-draw{position:absolute;inset:0;width:390px;height:844px;z-index:17', '.mfpl-annotation-draw{position:absolute;inset:0;width:390px;height:850px;z-index:17')

replaceExact('src/core/coinConsole90s.css', 'width: min(100vw, calc(100dvh * 360 / 650));', 'width: min(100vw, calc(100dvh * 390 / 710));')

replaceExact(
  'docs/PRODUCTION_LAB_V1.md',
  'Chaque écran conserve la géométrie authored MiniFugg `390 × 844`. Le Lab peut superposer les viewports de contrôle : minimum officiel `360 × 650`, A54 Chrome `360 × 656`, iPhone 13 Pro normalisé ≈ `360 × 657`, A54 Brave `360 × 611`.',
  'Chaque nouvel écran de référence vise la géométrie MiniFugg `390 × 850` et la zone garantie `390 × 710`. Le Lab peut superposer les cas de contrôle A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712` et A54 Brave `360 × 611`. Les captures et assets historiques `390 × 844` restent affichables tels quels et sont signalés comme sources legacy plutôt que redimensionnés silencieusement.'
)

console.log('Dimension migration v3 applied successfully.')
