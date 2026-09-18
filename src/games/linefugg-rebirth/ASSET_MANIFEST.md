# LineFugg Rebirth — sources T02

Source : archive `MiniFugg-T02-composants.zip` validée visuellement pour intégration le 18 septembre 2026 ; les légers alignements et la taille du total restent sujets à retouche. Ce n'est pas le master éditorial 260 × 567 du premier prototype.

47 PNG d'origine et manifeste détaillé conservés dans l'archive privée `MiniFugg - Graphic Archive/Games/linefugg/layer-refinement-tests` (Drive file `1PjuYZnrv6vq-mYP-P6VKJw8D0YsGTMta`). Le nouvel import n'écrase aucun fichier classique.

| Fichier runtime | Taille | Empreinte Git blob | Usage |
| --- | --- | --- | --- |
| `/assets/imported/linefugg/rebirth/t02-atlas.png` | 2048 × 1537, 2 681 612 octets | `e6c65b9dbfc827c84b1a229a3e79dd06361f8bf4` | Atlas RGBA T02 utilisé pour la première intégration ; pixels préservés |
| `/assets/imported/linefugg/rebirth/t02-atlas.webp` | 2048 × 1537, 1 920 428 octets | `576e2f2b7548148b4d7a1ad875c1f2558feac5c7` | Dérivé lossless disponible, non nécessaire au premier chargement |

Transport effectué dans le dossier privé `Fugg/linefugg/rebirth`, puis importer GitHub Actions. Aucun hotlink Drive, aucun asset classique remplacé. Les coordonnées des 47 frames sont dans `art.ts`, issues exactement du JSON T02. Les variantes de boutons partagent cadrage et ancrage ; le moteur n'en modifie pas les dimensions entre états.

Les positions source T02 sont adaptées à l'espace logique fixe ; chaque surface conserve son ratio propre. Les cellules et leurs hitboxes partagent une seule géométrie, mesurée sur le plateau vide. Le papier uni est une couleur du moteur, selon l'acceptation utilisateur.

Glyphes 0–9, +, ×, ÷, = et point : sprites blancs teintés au rendu. La provenance des glyphes (extraits ou construits localement) demeure celle du pack T02. Les textes Undo/Validate sont statiques dans les sprites dans ce pilote. Le registre et le total ont été nettoyés dans T02 ; ils ne contiennent plus les valeurs de la maquette.

Textures de routes : nœud + segment, red/purple/gold, fusionnés dans une RenderTexture par ligne avant transparence. Pas d'accumulation d'opacité au raccord des morceaux. Budget maximal : quatre RenderTextures de la zone du plateau à densité 2, plus l'atlas partagé ; détruites avec la scène.
