# LineFugg — TODO

Backlog durable du jeu. Voir `docs/TODO_NOTES.md`.

## Priorité / prochaine passe

## Gameplay / GD

## Graphismes / DA / FX

- Process validé pour les prochaines intégrations : après validation de la DA, générer les éléments isolés sur un fond chroma `#00FF00` parfaitement uniforme, sans ombre portée ni halo sur le fond. Extraire ensuite ce chroma en alpha RGBA par script, contrôler les pixels transparents/semi-transparents/opaques, puis seulement découper les composants et construire les atlas. Ne plus demander de « damier transparent » ni faire confiance à une transparence annoncée sans inspection technique.
- Conserver les supports et leur contenu séparés : cases vides d'un côté, tileset raster unique pour `0…9`, `+`, `−`, `×`, `÷`, `.`, `=` de l'autre. Ne jamais cuire un signe dans une case.
- Revoir Solar Origami v3 dans le jeu réel ; les atlas v3 sont actifs sans modification des règles. Remplacer le fond et les petits débris hérités du v2 uniquement si la revue le demande.

## Audio

## Covers / présentation

## Bugs / technique

## À explorer / idées
