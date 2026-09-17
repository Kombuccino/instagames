import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found === 0) {
    if (text.includes(after)) return
    throw new Error(`${path}: expected pattern not found: ${before.slice(0, 140)}`)
  }
  if (found !== 1) throw new Error(`${path}: expected one occurrence, found ${found}`)
  writeFileSync(path, text.replace(before, after))
}

replaceExact(
  'docs/DA_MAGAZINE.md',
  'Le téléphone est un support fictif dédié au jeu. Son verre utile conserve la largeur logique de `390`. Dans la Home bis alpha, sa surface active reprend directement le MASTER `390 × 844`, occupe 95 % de la hauteur PC disponible et utilise toute la largeur correspondante. Cette géométrie légèrement plus large remplace le premier essai `390 × 884` tant que la scène étendue reste en validation.',
  'Le téléphone est un support fictif dédié au jeu. Son verre utile conserve la largeur logique de `390`. Le rig actuel de la Home bis alpha a été authored en `390 × 844` : cette taille décrit l’asset expérimental existant et reste legacy compatible, sans étirement. Toute reprise ou nouvelle production vise le MASTER canonique `390 × 850` et la zone garantie `390 × 710`. Le téléphone occupe 95 % de la hauteur PC disponible et utilise toute la largeur correspondante. Cette géométrie remplace le premier essai `390 × 884` tant que la scène étendue reste en validation.'
)
replaceExact(
  'docs/DA_MAGAZINE.md',
  'Après le premier essai, la main ne doit pas être étirée pour rejoindre artificiellement les deux bords. La dérivation v2 adapte la pose au téléphone `390 × 844` : quatre doigts saisissent le bord gauche, le pouce reste sur le bord droit et aucun doigt ne recouvre la surface active.',
  'Après le premier essai, la main ne doit pas être étirée pour rejoindre artificiellement les deux bords. La dérivation v2 existante adapte la pose au rig legacy `390 × 844` : quatre doigts saisissent le bord gauche, le pouce reste sur le bord droit et aucun doigt ne recouvre la surface active. Lors d’une reprise du rig, conserver cette pose tout en recalant le verre sur le nouveau MASTER `390 × 850`.'
)

replaceExact(
  'docs/DA_UI.md',
  "Sur l'expérience **écran étendu** décrite dans `PLATFORM_REDESIGN.md`, le sidecar devient une mise en scène éditoriale persistante : une une de magazine `MiniFugg Retro Gaming` fermée pendant environ 4–5 secondes, puis un magazine ouvert presque à plat à gauche du téléphone. Le téléphone reste au premier plan à 95 % de la hauteur utile. Son verre fictif reprend directement le MASTER `390 × 844`.",
  "Sur l'expérience **écran étendu** décrite dans `PLATFORM_REDESIGN.md`, le sidecar devient une mise en scène éditoriale persistante : une une de magazine `MiniFugg Retro Gaming` fermée pendant environ 4–5 secondes, puis un magazine ouvert presque à plat à gauche du téléphone. Le téléphone reste au premier plan à 95 % de la hauteur utile. Pour toute nouvelle production son verre vise le MASTER `390 × 850` et la zone garantie `390 × 710`; les rigs expérimentaux déjà authored en `390 × 844` restent legacy compatibles jusqu’à leur reprise."
)

replaceExact(
  'docs/DA_WELCOME.md',
  'En portrait, le wagon et la main partagent le MASTER logique `390 × 844`. Leur fenêtre composée de `390 × 693,33` est centrée verticalement dans ce MASTER ; la main repose à `x = 0`, `y = 139` dans cette fenêtre.',
  'En portrait, le wagon et la main actuels partagent un rig legacy authored en `390 × 844`. Leur fenêtre composée de `390 × 693,33` et la main à `x = 0`, `y = 139` décrivent donc l’asset existant et restent inchangées tant que ce rig n’est pas repris. Toute nouvelle production suit le MASTER `390 × 850` et la zone garantie `390 × 710`.'
)

replaceExact(
  'docs/PLATFORM_ENTRY_SCENES.md',
  'In portrait, wagon and hand share one fixed `390 × 844` logical MASTER. Their `390 × 693.33` composed window is vertically centred inside it, with the hand at fixed `x = 0`, `y = 139` window coordinates.',
  'In portrait, the current wagon/hand asset uses one fixed legacy-authored `390 × 844` logical rig. Its `390 × 693.33` composed window and hand coordinates `x = 0`, `y = 139` remain factual source geometry until that rig is deliberately migrated. Any new production targets the canonical `390 × 850` MASTER and `390 × 710` guaranteed window.'
)
replaceExact(
  'docs/PLATFORM_ENTRY_SCENES.md',
  'Its uninterrupted fictional glass directly uses the canonical `390 × 844` game MASTER.',
  'Its uninterrupted fictional glass uses the canonical `390 × 850` MASTER and `390 × 710` guaranteed window for new production; the currently integrated phone rig may remain on its explicit legacy `390 × 844` source geometry until a dedicated retune.'
)

console.log('Legacy platform dimension clarifications applied.')
