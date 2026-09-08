# Les Brochettes de Vlad — Changelog

## [0.2.0] — 2026-09-08 14:48 Europe/Paris

- L'embrochement ne fonctionne plus qu'en remontant par dessous et conserve exactement le point de pénétration : une prise excentrée produit une brochette visiblement bancale.
- Ajout du score cumulatif `1 + 2 + 6 + 24 + 120`, puis du multiplicateur moyen de beauté `×0,8` à `×3,5` calculé selon le centrage de chaque ingrédient.
- Les coups descendants lacèrent et affolent les ingrédients sans les capturer ; les membres embrochés deviennent des ragdolls à deux articulations soumis à la gravité.
- Une brochette terminée part immédiatement vers le client tandis qu'une nouvelle pique jouable apparaît ; la commande a été compactée et la patience remplacée par une petite horloge sectorielle.

Références : `Vlad-DA1.png`, `Vlad-DA-Piques.png`, `VLAD-DA-pixelisee.png` et décisions validées dans `ART_DIRECTION.md`.

Vérifié : build de production, scénarios navigateur téléphone tactile et bureau souris, score déterministe de `383`, puis contrôle du bundle déployé.

Livraison : `ec0c049` sur `main`.
