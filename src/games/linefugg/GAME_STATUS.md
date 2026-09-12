# LineFugg — Suivi de création

Mis à jour : 12 septembre 2026 à 12:46 Europe/Paris. Version : `0.6.0`. Changelog : `CHANGELOG.md`.

Runtime Phaser 4.2.1, stage 390 × 844. Prototype, game design et équilibre validés par l'utilisateur. Direction gameplay : **Orbital Accounting**. Cover runtime : current ; quatre références approuvées conservées et quatre restaurations statiques plein cadre actives.

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
| Covers | 4 statiques `390×844` intégrées, ancrées en haut | Revue visuelle utilisateur du lot remis aux normes |
| Assets runtime | Optimisés | Tous les visuels gameplay actifs sont en WebP lossless pré-dimensionné ; PNG sources conservés hors chemin actif |
| Livraison | `0.6.0` | Déploiement applicatif distinct de la publication GitHub |

## Optimisation images runtime — 11 septembre 2026

Le gameplay ne référence plus de PNG lourds. Fond CSS, plateau, armillaire, cases spéciales, boutons Valider, ornements du registre, console, indicateurs et verre orange sont tous servis en **WebP lossless pré-dimensionné**. Les PNG sources et les masters approuvés restent conservés ; aucune illustration n'a été régénérée.

Le payload des **11 images nécessaires au gameplay est de 4 573 098 octets (4,57 Mo / 4,36 Mio)**, fond compris. Les quatre covers ne sont pas comptées : elles appartiennent au feed Core et sont chargées séparément du lancement Phaser.

Les trois derniers assets locaux ont été dérivés sans régénération : `accounting-panels.webp` 681 024 octets (1024×683), `glass-indicators.webp` 671 796 octets (1024²), `validate-amber-source.webp` 89 910 octets (256²), contre 5,73 Mo pour leurs trois PNG sources. Leur alpha et leurs pixels visibles après décodage sont identiques à la version runtime redimensionnée avant encodage lossless.

`OrbitalImageFile` et son redimensionnement Canvas au chargement sont retirés : Phaser charge directement les textures préparées. `scripts/test-linefugg-runtime-assets.mjs` verrouille le format des 11 fichiers, leur budget cumulé et l'absence de PNG dans les URLs Phaser actives.

## Vérifications

La version `0.5.5` allège toute la composition sans modifier le gameplay : plateau `280 × 280`, console basse mieux espacée, typographie et FX proportionnés, commandes Annuler/Valider de même diamètre. Le bouton Retour Core suit désormais la même échelle effective que Valider sur PC. Les assertions navigateur verrouillent les limites de la composition et l'égalité des commandes sur téléphone, tablette et PC.

Passe finale sur état combiné : test de budget/formats réussi, `npm run build` réussi, puis matrice LineFugg sur six profils téléphone/tablette/PC et mouvement réduit réussie sans erreur HTTP/JavaScript. Les captures `empty`, `drag`, `reroll`, une ligne, trois lignes et résultat ont été produites ; contrôle visuel de `empty` et `three` conforme à la DA, sans asset manquant ni dégradation évidente.

Les matrices historiques plus larges de `scripts/test-linefugg-browser.mjs` et `scripts/test-linefugg-covers.mjs` restent les références de non-régression multi-écrans. Le coût RGBA après décodage n'est pas réduit par WebP à dimensions identiques ; cette passe cible surtout réseau, stockage et suppression du redimensionnement client.

## Prochaines actions

1. Revue utilisateur du rendu gameplay final si elle n'a pas encore été donnée.
2. Profilage sur téléphone physique et écoute finale du mix/SFX.

Aucun blocage technique connu. L'optimisation des images runtime de LineFugg est terminée ; ne pas rouvrir gameplay ou DA pour une simple optimisation de fichiers.

## Remise aux normes des covers — 12 septembre 2026

- Base : `abdb1b464f1376ecce39aaccb6301e6dc19204f8` sur `origin/main` ; lot limité aux quatre jaquettes approuvées et à leur configuration Core.
- Demande : reprendre le pilote TetraMindFck sans réinterprétation. Les quatre PNG du 7 septembre restent les références exactes ; ImageGen a reçu une image cible à la fois et un brief de prolongement vers le bas uniquement.
- Sorties : quatre sources opaques plein cadre, quatre masters PNG `390×844` et quatre WebP lossless `780×1688` sous `public/assets/generated/linefugg/welcome/variants/`.
- Contrôle artistique agent : titres, sujets, palettes, médiums et compositions globales préservés ; aucun CTA, logo, slogan, faux cadre ou bande de remplissage. La zone JOUER recouvre seulement le décor bas continu.
- Contrôle technique : PNG/WebP décodés, opaques, mono-frame ; WebP `VP8L`. `npm run build` réussi. Les quatre éditions ont été ouvertes, sélectionnées et capturées en navigateur sur mobile court `360×611`, MASTER `390×844` et bureau `1280×720`, sans erreur HTTP/JavaScript ; lancement puis retour cover également vérifiés.
- Validation utilisateur : références historiques approuvées ; application du procédé à tous les originaux autorisée le 12 septembre 2026 ; revue finale du lot livré encore distincte.
