# Les Brochettes de Vlad — Suivi

Mis à jour : 7 septembre 2026. Base initialement inspectée : `62947acacd03ecb3ae487160c9a2faa246417990` ; contrat artistique courant dans `ART_DIRECTION.md`.

Phase : production artistique / recherche de covers. La DA gameplay pixel art est choisie mais le jeu reste `legacy-dom` et verrouillé pour migration Phaser. La cover C graphique est validée ; A/B/D restent à explorer.

Registre constaté : `status: fugg`, stage logique 390 × 844, migration Phaser requise, cover `update-required` avec placeholder. Aucun changement de registre, gameplay, runtime ou déploiement dans cette passe.

## Décisions acquises

- Référence gameplay : `VLAD-DA-pixelisee.png`, rôle univers/matière uniquement, pas gabarit de cover.
- Gameplay visuel : pixel art construit, aliments avec visages/bras/jambes dessinés en surimpression, progression joyeux → panique → morts/inertes une fois embrochés, main/bras vampiriques, clients spectateurs à droite, trois piques de miss à gauche, livraison automatique, FX de percement/combos jusqu'à ×5. Détails complets dans `ART_DIRECTION.md`.
- Titre des covers par défaut : **`Vlad's Skewers`**. Le français est réservé à une édition française explicite.
- Les covers doivent interpréter la fantaisie du jeu, pas recopier la scène gameplay. Les légumes anthropomorphes peuvent être totalement absents ; éviter la foule de personnages qui donne une impression Disney/cartoon familial.
- Simplification demandée : une idée forte, peu d'objets, respiration, médium imprimé identifiable, rendu plus premier degré que le gameplay et crédible comme jaquette fin 80s/début 90s.

## Cover validée

**C — affiche graphique / éditoriale** : validée explicitement par l'utilisateur le 7 septembre 2026 pour sa composition, ses contrastes, sa respiration et sa qualité de design.

Master exact : `vlad-cover-c-graphic-poster-approved-2026-09-07.png`, 941 × 1672 RGB PNG, SHA-256 local `582db78b3abd6d9724cb6261fa6c1563f3e5a4542ed5a3d639c982dabb5c1872`.

Archive privée : `MiniFugg - Graphic Archive/Games/vlads-skewers/covers-validated/`, Drive fichier `1blXf0mUKernZn8eQpa8oWXEpFQTOehKM`, dossier `1o5SBto8zGF_fx7FaUTvn9wcEjBpaF7OZ`.

Ne pas régénérer cette cover pour la « finaliser ». Une future production/animation doit préserver exactement ce master.

## Covers rejetées / enseignement

Les deux premières et la quatrième du dernier lot sont rejetées : trop proches du gameplay, mêmes personnages, trop de légumes vivants à yeux/pattes, composition trop riche et trop explicative. Elles ont été archivées dans `Games/vlads-skewers/covers-rejected/`.

Trois tentatives de relance ont ensuite produit à tort des planches 2×2 au lieu de masters individuels. Elles sont elles aussi rejetées et archivées dans `covers-rejected/round3-generator-boards/`. Ne pas utiliser ces planches comme références positives.

Enseignement : une bonne cover Vlad n'a pas besoin de montrer la brochette, la recette, les clients et tous les ingrédients. La promesse peut passer par Vlad, la cuisine, une cloche, une main, une ombre, un signe de restaurant, une table ou une métaphore. La cover C prouve qu'une image plus simple et plus éditoriale fonctionne mieux.

## État des lots

| Lot | État | Critère de sortie |
| --- | --- | --- |
| DA gameplay pixel art | Validé artistiquement | Migration Phaser + assets/FX + tests encore à faire |
| Cover C graphique | **Validé** | Master à préserver ; intégration Core non faite |
| Cover A pulp européen | À refaire | Interprétation simple, premier degré, pas inventaire gameplay |
| Cover B micro-ordinateur | À refaire | Vraie logique de jaquette/annonce de l'époque, peu d'éléments |
| Cover D régionale | À refaire | Réinterprétation éditoriale crédible, pas pseudo-localisation |
| Import/runtime covers | Non effectué | Après choix des masters, pipeline assets + branchement Core |

## Prochaine action

Produire A, B et D comme **trois masters portrait individuels**. C reste intacte. Si l'outil tente de fabriquer une planche comparative, rejeter cette sortie plutôt que la présenter comme cover.

Aucun build ou test gameplay n'était pertinent pour cette passe de recherche graphique. Aucun asset de cover n'a été importé dans `Fugg` ni branché au runtime.
