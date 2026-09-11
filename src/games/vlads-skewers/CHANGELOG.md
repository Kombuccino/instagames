# Les Brochettes de Vlad — Changelog

## [0.3.1] — 2026-09-11 19:48 Europe/Paris

- Le feed utilise maintenant les cinq dérivés runtime lossless exactement `390 × 844` avec `fit: cover`, au lieu des sources grand format affichées en `contain`.
- Chaque ingrédient embroché reçoit immédiatement l'orientation qu'il avait au moment du percement ; le dernier ingrédient d'une recette complète ne peut plus être remis à plat avant la livraison automatique.

## [0.3.0] — 2026-09-11 19:05 Europe/Paris

- Mise en production des cinq covers validées le 10 septembre 2026 dans le feed MiniFugg.
- Les cinq éditions utilisent les PNG approuvés exacts synchronisés par le pipeline Drive → GitHub ; aucune régénération, recoloration ou compression destructive n'est appliquée.
- Présentation statique Core avec `fit: contain`, rotation `seeded`, toutes les éditions disponibles immédiatement.
- Migration cover passée de `update-required` à `current`.

## [0.2.0] — 2026-09-08 14:48 Europe/Paris

- L'embrochement ne fonctionne plus qu'en remontant par dessous et conserve exactement le point de pénétration : une prise excentrée produit une brochette visiblement bancale.
- Ajout du score cumulatif `1 + 2 + 6 + 24 + 120`, puis du multiplicateur moyen de beauté `×0,8` à `×3,5` calculé selon le centrage de chaque ingrédient.
- Les coups descendants lacèrent et affolent les ingrédients sans les capturer ; les membres embrochés deviennent des ragdolls à deux articulations soumis à la gravité.
- Une brochette terminée part immédiatement vers le client tandis qu'une nouvelle pique jouable apparaît ; la commande a été compactée et la patience remplacée par une petite horloge sectorielle.

Références : `Vlad-DA1.png`, `Vlad-DA-Piques.png`, `VLAD-DA-pixelisee.png` et décisions validées dans `ART_DIRECTION.md`.

Vérifié : build de production, scénarios navigateur téléphone tactile et bureau souris, score déterministe de `383`, puis contrôle du bundle déployé.

Livraison : `ec0c049` sur `main`.
