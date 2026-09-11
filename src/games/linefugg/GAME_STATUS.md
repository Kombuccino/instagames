# LineFugg — Suivi de création

Mis à jour : 11 septembre 2026 à 20:01 Europe/Paris. Version livrée : `0.5.2`. Changelog : `CHANGELOG.md`.

Runtime Phaser 4.2.1, stage 390 × 844. Prototype, game design et équilibre validés par l'utilisateur. Direction gameplay : **Orbital Accounting**. Cover runtime : current ; quatre jaquettes statiques approuvées, masters PNG conservés et dérivés WebP lossless actifs.

## Décisions acquises

Règles validées : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation possible après trois lignes, puis validation explicite pour terminer. Depuis le 10 septembre : négatifs limités à −1…−4, diviseurs plus rares, retirage déterministe des cases libres après chaque ligne, flip en cascade et teinte des cases libres selon la prochaine ligne.

DA gameplay : laiton, bleu encre, parchemin, nombres prioritaires, mécanisme céleste, trois indicateurs de cinq points. Les quatre covers restent des interprétations éditoriales distinctes du gameplay. Musiques acquises : MF-MUS-0008 et MF-MUS-0009.

Références : [ART_DIRECTION.md](ART_DIRECTION.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [CHANGELOG.md](CHANGELOG.md), [pipeline commun](../../../docs/GAME_CREATION_PIPELINE.md).

## État actuel

| Lot | État | Reste |
| --- | --- | --- |
| Prototype / GD / équilibre | Validés utilisateur | Rien à rouvrir sans nouvelle demande |
| Gameplay Phaser | Fonctionnel et vérifié | Profilage téléphone physique seulement |
| DA gameplay | Intégrée | Acceptation visuelle finale utilisateur toujours distincte |
| Inputs / responsive | Vérifiés en émulation | Contrôle appareil réel recommandé |
| Animations / FX | Intégrés et bornés | Aucun changement demandé |
| Audio | Musiques conservées | Écoute finale du mix/SFX restant à faire |
| Covers | 4 statiques intégrées | Aucune animation prévue dans le contrat actuel |
| Assets runtime | Optimisés partiellement | 12 images importées passées en WebP lossless ; 3 textures générées locales restent PNG |
| Livraison | `0.5.2` sur `main` | Déploiement applicatif distinct de GitHub |

## Optimisation images — 11 septembre 2026

Les 12 images importées actives couvertes par cette passe — fond, plateau, armillaire, cellules ×/÷, boutons Valider actif/inactif, décor du registre et quatre covers — ont désormais des dérivés **WebP lossless** synchronisés via le Drive privé puis utilisés par le runtime.

Poids cumulé de ces 12 sources PNG : **21,578,385 octets**. Poids cumulé des dérivés runtime : **9,083,568 octets**, soit **57,9 % de transfert en moins** sur ce lot. Les PNG sources et masters approuvés n'ont pas été écrasés ni régénérés.

Le fond CSS utilise directement `orbital-environment.webp`. `orbitalArt.ts` redirige uniquement les sept imports Phaser concernés vers leurs WebP ; les coordonnées de frames et le plafond de résolution restent identiques. Les quatre covers utilisent `welcome/variants/runtime/*.webp` en `fit: contain`, sans changement de sélection, d'overlay Core ou de composition.

Contrôles effectués : décodage des dérivés, dimensions, présence d'encodage WebP lossless `VP8L`, inspection visuelle des principaux dérivés, synchronisation Drive → GitHub réussie. Le workflow **LineFugg static covers** a exécuté avec succès le build puis `scripts/test-linefugg-covers.mjs`, qui vérifie notamment que les PNG masters restent intacts mais ne sont plus demandés par le runtime. Le build global GitHub est également réussi sur la livraison.

Les textures locales `public/assets/generated/linefugg/ui/accounting-panels.png`, `glass-indicators.png` et `validate-amber-source.png` restent en PNG. Elles sont toujours réduites à la résolution utile après chargement Phaser, mais leur poids réseau pourra encore être diminué lors d'une passe locale/Codex sans régénérer leur art.

## Vérifications de référence

`scripts/test-linefugg-browser.mjs` couvre la boucle gameplay, le tracé tactile, l'annulation, la validation, le reroll déterministe, les états visuels et plusieurs formats d'écran. `scripts/test-linefugg-covers.mjs` couvre les quatre covers, téléphone/tablette/desktop, sélection, lancement/retour, intégrité des masters et chargement des WebP.

Le coût RGBA des textures gameplay après décodage reste de l'ordre de la mesure précédente (~14,875 Mio hors fond CSS, textes et buffers) : la conversion WebP réduit surtout **transfert et stockage**, pas la mémoire RGBA d'une texture déjà décodée.

## Prochaines actions

1. Revue utilisateur du rendu gameplay final si elle n'a pas encore été donnée.
2. Profilage sur téléphone physique et écoute du mix audio.
3. Convertir les trois textures générées locales en dérivés runtime lossless depuis un checkout local, sans toucher aux masters.

Aucun blocage technique connu. Ne pas rouvrir le gameplay validé pour une simple optimisation de fichiers.
