import { readFileSync, writeFileSync } from 'node:fs'

function replaceExact(path, before, after, expected = 1) {
  let text = readFileSync(path, 'utf8')
  const found = text.split(before).length - 1
  if (found !== expected) throw new Error(`${path}: expected ${expected} occurrence(s), found ${found}`)
  writeFileSync(path, text.replace(before, after))
}

replaceExact(
  'src/core/ProductionLab.tsx',
  "const LINEFUGG_PROOF_ROOT = '/assets/generated/linefugg/production-lab'",
  "const LINEFUGG_PROOF_ROOT = '/assets/generated/linefugg/production-lab'\nconst LINEFUGG_REBIRTH_DA_ROOT = '/assets/generated/linefugg/rebirth/da'"
)

replaceExact(
  'src/core/ProductionLab.tsx',
  "    {\n      id: 'P4', state: 'proto', title: 'Trois lignes · avant validation', status: 'Capture du proto classique',\n      context: 'Les trois lignes sont posées mais la partie n’est pas encore validée.',\n      facts: ['Trois résultats intermédiaires', 'Total visible', 'Undo encore disponible', 'Validation manuelle obligatoire'],\n      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 4080, image: `${LINEFUGG_PROOF_ROOT}/proto-three-lines.png`, preview: 'proto', anchor: 'center',\n    },\n  ]",
  "    {\n      id: 'P4', state: 'proto', title: 'Trois lignes · avant validation', status: 'Capture du proto classique',\n      context: 'Les trois lignes sont posées mais la partie n’est pas encore validée.',\n      facts: ['Trois résultats intermédiaires', 'Total visible', 'Undo encore disponible', 'Validation manuelle obligatoire'],\n      source: 'capture Playwright du runtime classique', x: SCREEN_X.proto, y: 4080, image: `${LINEFUGG_PROOF_ROOT}/proto-three-lines.png`, preview: 'proto', anchor: 'center',\n    },\n    {\n      id: 'D1', state: 'da', title: 'DA validée · registre éditorial imprimé', status: 'Validée le 17 septembre 2026',\n      context: 'Première DA Rebirth validée. Elle traduit l’état P4 en feuille imprimée tactile : grille dominante, trois tracés colorés, registre des résultats, total et deux actions finales.',\n      facts: ['MASTER 390×850', 'Zone garantie 390×710', 'Grille 7×7 prioritaire', 'Trois tracés lisibles simultanément', 'Valeurs de la maquette = référence visuelle, pas données canoniques'],\n      source: 'ChatGPT image generation · 17 septembre 2026', x: SCREEN_X.da, y: 420, image: `${LINEFUGG_REBIRTH_DA_ROOT}/linefugg-rebirth-editorial-paper-lab-390x850.webp`, preview: 'proto', anchor: 'center',\n    },\n  ]"
)

replaceExact(
  'src/core/ProductionLab.tsx',
  "    { id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute nouvelle DA vise le MASTER 390×850 et garde le gameplay indispensable dans la zone garantie 390×710.', facts: ['390×710 garanti', 'Références 390×844 historiques compatibles', 'Pas de reflow PC/mobile'], source: 'MINIFUGG_ZONES.md', x: 1190, y: 1070, links: [] },\n  ]",
  "    { id: 'P-viewport', ownerScreenId: 'P1', title: 'Contrat d’écran', kind: 'text', body: 'Toute nouvelle DA vise le MASTER 390×850 et garde le gameplay indispensable dans la zone garantie 390×710.', facts: ['390×710 garanti', 'Références 390×844 historiques compatibles', 'Pas de reflow PC/mobile'], source: 'MINIFUGG_ZONES.md', x: 1190, y: 1070, links: [] },\n    { id: 'D-style', ownerScreenId: 'D1', title: 'Découpe 1 · matière et grille', kind: 'image', body: 'Papier ivoire imprimé, trame et encre sèche. La grille 7×7 reste la masse dominante et les nombres conservent le contraste maximal.', facts: ['Pas de chrome futuriste', 'Texture matérielle sobre', 'Grille avant décor'], source: 'DA validée 17/09/2026', x: 3100, y: 560, links: [screenLink('D-style-grid', 'D1', 195, 275, 'grille + matière')] },\n    { id: 'D-lines', ownerScreenId: 'D1', title: 'Découpe 2 · les trois tracés', kind: 'image', body: 'Les trois lignes sont des encres/transparences colorées qui traversent les cases sans masquer les valeurs. Les points et flèches rendent l’ordre immédiatement lisible.', facts: ['3 identités couleur', 'Direction visible', 'Intersection lisible'], source: 'DA validée 17/09/2026', x: 4000, y: 650, links: [screenLink('D-lines-board', 'D1', 195, 320, 'tracés')] },\n    { id: 'D-ledger', ownerScreenId: 'D1', title: 'Découpe 3 · registre des résultats', kind: 'image', body: 'Sous la grille, chaque ligne possède une rangée typographique compacte avec son identité couleur, sa formule et son résultat. Cette zone doit rester vivante et moteur-owned.', facts: ['3 lignes de résultat', 'Typographie fonctionnelle', 'Aucun faux texte décoratif'], source: 'DA validée 17/09/2026', x: 3100, y: 1040, links: [screenLink('D-ledger-rows', 'D1', 195, 545, 'résultats')] },\n    { id: 'D-total', ownerScreenId: 'D1', title: 'Découpe 4 · total', kind: 'image', body: 'Le total forme une rupture de hiérarchie nette entre le registre et les commandes, sans devenir plus important que la grille.', facts: ['Somme finale moteur-owned', 'Valeur large et isolée'], source: 'DA validée 17/09/2026', x: 4000, y: 1160, links: [screenLink('D-total-value', 'D1', 285, 655, 'total')] },\n    { id: 'D-controls', ownerScreenId: 'D1', title: 'Découpe 5 · Undo / Validate', kind: 'image', body: 'Deux commandes physiques simples concluent la lecture : Undo à gauche, Validate à droite. Leur forme et matière peuvent être traduites en assets/états, mais leur logique reste celle du prototype.', facts: ['Undo toujours disponible avant validation', 'Validate explicite après 3 lignes', 'États interactifs à produire'], source: 'DA validée 17/09/2026', x: 3100, y: 1380, links: [screenLink('D-controls-undo', 'D1', 108, 770, 'Undo'), screenLink('D-controls-validate', 'D1', 280, 770, 'Validate')] },\n    { id: 'D-corrections', ownerScreenId: 'D1', title: 'À corriger avant runtime', kind: 'text', body: 'La validation porte sur la direction artistique et la hiérarchie. Les nombres, formules, résultats et détails exacts de la maquette ne deviennent pas des données de jeu : la planche de traduction devra reprendre un état réel LineFugg et vérifier chaque valeur.', facts: ['DA validée ≠ état fonctionnel validé', 'Recomposer avec données réelles', 'Pas de texte ou score cuit dans le fond'], source: 'validation utilisateur 17/09/2026 + DA_GAME.md', x: 4000, y: 1510, links: [screenLink('D-corrections-screen', 'D1', 195, 545, 'contenu fonctionnel')] },\n  ]"
)

replaceExact(
  'src/core/ProductionLab.tsx',
  "    summary: 'Rebirth repart du vrai LineFugg classique. Le Plan montre des captures statiques de situations réelles ; DA et Release restent vides.',",
  "    summary: 'Rebirth repart du vrai LineFugg classique. Le Proto reste la vérité fonctionnelle ; la première DA Rebirth est validée et découpée dans le Lab. Release reste vide tant qu’aucune mini-tranche intégrée n’existe.',"
)

replaceExact(
  'src/games/linefugg/GAME_STATUS.md',
  "En parallèle, **LineFugg — Rebirth** est traité comme un nouveau chantier de production à partir de ce jeu classique pris comme prototype évolué. Rebirth n’a actuellement **ni DA ni Release** : le Production Lab doit d’abord décrire honnêtement le prototype, ses situations, ses règles, ses états et ses dépendances avant toute nouvelle recherche artistique.",
  "En parallèle, **LineFugg — Rebirth** est traité comme un nouveau chantier de production à partir de ce jeu classique pris comme prototype évolué. Le 17 septembre 2026, l’utilisateur a validé la première DA Rebirth : **registre éditorial imprimé / papier tactile**, sur l’état fonctionnel P4. Le Production Lab contient désormais cette DA et son découpage sémantique. **Release reste vide** tant qu’aucune mini-tranche de traduction n’est réellement intégrée."
)
replaceExact(
  'src/games/linefugg/GAME_STATUS.md',
  "- **DA** : vide tant qu’aucune nouvelle direction n’est réellement produite ;\n- **Release** : vide tant qu’aucune intégration Rebirth n’existe.\n\nProchaine action : finir la lecture sémantique du prototype dans le Lab, puis seulement lancer une nouvelle exploration DA Rebirth à partir de ce contrat visible.",
  "- **DA** : première direction validée — registre éditorial imprimé, référence Lab `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp` ;\n- **Release** : vide tant qu’aucune intégration Rebirth n’existe.\n\nProchaine action : utiliser le découpage DA du Lab comme planche de traduction, corriger les valeurs/formules sur un état réel puis intégrer une mini-tranche représentative avant toute production complète."
)

replaceExact(
  'src/games/linefugg/ART_DIRECTION.md',
  "# LineFugg — Art Direction\n\nStatus: canonical gameplay art direction approved 2026-09-06.",
  "# LineFugg — Art Direction\n\n## Rebirth — direction validée le 17 septembre 2026\n\nLa nouvelle direction gameplay de **LineFugg — Rebirth** est validée : **registre éditorial imprimé / papier tactile**. Référence de revue intégrée au Production Lab : `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp`.\n\nCette validation porte sur le médium, la hiérarchie et la grammaire visuelle : papier ivoire imprimé, encre sèche/trame discrète, grille 7×7 dominante, trois tracés translucides colorés, registre typographique des trois calculs, total isolé, Undo et Validate comme objets simples. Elle ne valide pas les nombres/formules exacts dessinés par la maquette : la traduction runtime doit les reconstruire depuis un état réel LineFugg et garder toute donnée dynamique moteur-owned.\n\nLe Production Lab découpe cette référence en cinq unités : grille/matière, tracés, registre des résultats, total, contrôles. Cette découpe est la planche de traduction de départ avant mini-tranche. Aucune Release Rebirth n’est encore intégrée.\n\n## Direction classique conservée comme référence historique\n\nStatus: canonical gameplay art direction approved 2026-09-06."
)

replaceExact(
  'src/games/linefugg/ASSET_MANIFEST.md',
  "# LineFugg — Production asset manifest\n\nÉtat canonique : 11 septembre 2026, version `0.5.3`, direction **Orbital Accounting**.",
  "# LineFugg — Production asset manifest\n\n## Rebirth — référence DA validée\n\n- `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp` — dérivé de revue 390×850 de la DA validée le 17 septembre 2026 ; usage Production Lab uniquement, pas texture runtime finale.\n- Source de génération : image ChatGPT du 17 septembre 2026, `gen_id 629be15a-5355-4579-9149-4bc42942535c`, sortie originale 849×1851. Le dérivé Lab a été redimensionné proportionnellement vers 390×850 ; aucun élément n’a été redessiné.\n- Découpage sémantique : grille/matière, trois tracés, registre des résultats, total, Undo/Validate. Les données visibles de la maquette sont indicatives et doivent être remplacées par les vraies valeurs moteur lors de la mini-tranche.\n- Statut : **DA validée / Release non intégrée**.\n\nÉtat canonique classique : 11 septembre 2026, version `0.5.3`, direction **Orbital Accounting**."
)

console.log('LineFugg Rebirth DA Lab patch applied.')
