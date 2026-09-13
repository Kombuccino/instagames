# Les Brochettes de Vlad — Suivi

Mis à jour : 12 septembre 2026 à 23:24 Europe/Paris. Version de cette passe : `0.4.1`. Changelog : `CHANGELOG.md`. Référence artistique canonique : `ART_DIRECTION.md`.

## État

- Registre : `fugg`, portrait `390 × 844`, runtime `phaser-2d`, migration gameplay `current`, cover `current`.
- Cadrage gameplay : Vlad utilise l'ancrage vertical Core `bottom`. Les 390 unités de largeur restent la référence fixe ; le grill, la main et les flammes basses restent attachés au bas visible, tandis que les différences de hauteur navigateur/PWA/app sont absorbées par le haut du MASTER.
- Brochette : longueur `110 / 150 / 190 / 230` unités pour `2 / 3 / 4 / 5` ingrédients, largeur `10`; les ingrédients glissent depuis la pointe jusqu'à la garde puis s'empilent vers l'apex.
- Membres : chaque bras/jambe embroché utilise deux corps Matter et deux contraintes. La gravité reste en coordonnées monde et la pile/les collisions de gameplay restent séparées de ces corps invisibles.
- Inertie : pas d'impulsion artificielle souris/doigt ; l'ancrage Matter est déplacé avec `updateVelocity=false`, les contraintes sont amorties et les vitesses invisibles bornées.
- Clients `0.4.1` : les portraits sont ramenés à une taille uniforme de `82`, sans agrandissement spécial du client actif, et reculés à `x=355` pour rester dans les loges comme dans `Vlad-DA1.png`. Leur ligne de base reste celle de chaque tablette ; l'animation d'attente est limitée à un très léger mouvement.
- Bave `0.4.1` : chaque portrait utilise un ancrage bouche propre en coordonnées locales du sprite. La goutte part du bord de la bouche, jamais de la tablette, de la joue ou de l'oreille.
- Commande `0.4.1` : bulle réduite à `136 × 58`, broche horizontale et icônes resserrées, horloge de patience compacte juste sous la demande. Le contenu pilote l'encombrement au lieu de conserver un grand panneau vide.
- Commentaires `0.4.1` : aucune phrase parlée lors d'un embrochement. Les impacts gardent uniquement leur onomatopée ; les petites phrases humoristiques sont réservées aux aliments ratés qui arrivent sur le grill, puis disparaissent rapidement.
- Validation : une recette complète reste dans la main pendant `1 s`, protégée contre tout nouveau contact, puis part automatiquement.
- Sang : grosse goutte construite sur grille de `2 px`, contour bordeaux très sombre, rouge saturé et reflet clair.
- Collision : seule l'extrémité logique du harpon embroche. Aucune hitbox visible.
- Orientation : chaque ingrédient conserve l'angle capturé au percement.
- Covers : les 5 références validées restent l'autorité ; leurs restaurations statiques plein cadre `390×844`, sans bandes floues, sont actives dans le feed.

## Architecture transversale

`PhaserGameHost` accepte une configuration `physics` optionnelle. Vlad active Matter explicitement ; les autres jeux ne sont pas affectés.

La fenêtre de gameplay `390 × 662` reste ancrable `top | center | bottom` sans modifier le monde logique `390 × 844` ni les 390 unités de largeur. Vlad reste `bottom`.

## Passe gameplay `0.4.1`

- Base inspectée : `63468fedabe845d069d99fcdd6937d35e256f215` sur `main`.
- Référence : `GFX/crea-chatgpt/game/Vlad-DA1.png` et les règles déjà consignées dans `ART_DIRECTION.md` pour les loges, la ligne de base et la bave à la bouche.
- Fichiers : `VladsSkewersPresentation.ts`, `VladsSkewers.tsx`, `definition.ts`, `CHANGELOG.md`, `GAME_STATUS.md`.
- Portée : présentation uniquement ; règles, score, collisions, physique Matter, longueurs de brochette et protection de fin inchangés.

## Vérification attendue avant publication

- `test:repository` et build TypeScript/Vite verts ;
- cinq clients maximum restent visuellement contenus dans leurs loges, avec le client actif au même gabarit que les autres ;
- bave visible uniquement au niveau de la bouche de chaque portrait ;
- commande lisible de 2 à 5 ingrédients sans grand vide ;
- un embrochement ne crée aucune phrase de légume, seulement l'onomatopée d'impact ;
- une arrivée sur le grill peut afficher une seule petite remarque discrète ;
- aucune régression sur la physique des membres, l'empilement à la garde, la seconde protégée, le score ou les covers.

## Passe covers `0.4.0`

- Base inspectée : `abdb1b464f1376ecce39aaccb6301e6dc19204f8` sur `origin/main`.
- Demande : appliquer aux autres originaux validés le procédé accepté sur TetraMindFck, sans réinterprétation. ImageGen a reçu une seule référence à la fois et uniquement le prolongement décoratif nécessaire.
- Sources : les cinq PNG approuvés du 10 septembre restent intacts sous `public/assets/imported/vlads-skewers/welcome/variants/`.
- Sorties : cinq sources restaurées, cinq masters PNG `390×844` et cinq WebP lossless `780×1688` sous `public/assets/generated/vlads-skewers/welcome/variants/`.
- Corrections : fin des bandes floues/mirroirs ; continuation naturelle du manteau et du feu, du velours, de la cape imprimée, de la vallée ou de l'échoppe. Sur la variante japonaise, seul le titre `ヴラッドの串焼き` reste ; le petit panneau secondaire est nettoyé.
- Contrôles : artistique agent conforme ; technique conforme (opaque, mono-frame, dimensions attendues, WebP `VP8L`) ; `npm run build` réussi. Les cinq éditions ont été ouvertes, sélectionnées et capturées en navigateur sur mobile court `360×611`, MASTER `390×844` et bureau `1280×720`, sans erreur HTTP/JavaScript. Dans chaque état, JOUER reste dans la zone basse sacrifiable et ne masque aucun titre/logo.
- Validation utilisateur : références historiques approuvées ; application du procédé à tous les originaux autorisée le 12 septembre 2026 ; revue finale du lot livré encore distincte.
