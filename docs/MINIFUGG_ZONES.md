# MiniFugg — Zones MiniFugg

**Zones MiniFugg** est le vocabulaire canonique des compositions portrait. Il remplace les noms de gabarits variables employés dans les discussions, les briefs de DA et les intégrations. Le guide visuel est disponible sur `/?usr=moigod&lab=layout`.

## Cadre commun

Toute surface utilise une largeur logique de `390`. Le master artistique maximal mesure `390 × 844` et se découpe verticalement ainsi :

| Nom | Coordonnées | Rôle |
| --- | ---: | --- |
| **HAUT** | `x 0→390`, `y 0→91` | Extension verticale. Elle peut être révélée ou recadrée. Aucun élément indispensable. |
| **CENTRE** | `x 0→390`, `y 91→753` | Zone minimale commune `390 × 662`, toujours visible et exploitable. Toute action et information indispensable y tient. |
| **BAS** | `x 0→390`, `y 753→844` | Extension verticale. Elle peut être révélée ou recadrée. Aucun élément indispensable. |

Sur mobile, la largeur disponible commande l’échelle : les 390 unités occupent la largeur utile. La hauteur visible varie avec le navigateur ou le shell ; HAUT et BAS absorbent cet écart. Sur PC et grand écran, la hauteur disponible commande l’échelle du portrait afin d’obtenir la plus grande largeur proportionnelle possible. L’espace latéral restant appartient au Core ; une DA de jeu ou de cover ne reçoit pas de décor latéral supplémentaire.

Les contrôles Core sont contenus dans le même cadre horizontal de 390 unités. **MONNAIE** et **JOUER** ne dépassent jamais ses bords. **RAIL** reste à gauche, par-dessus CENTRE, y compris sur PC. Les zones Core sont des masques d’occupation : une image peut continuer dessous, mais elle ne doit pas y placer un sujet, un titre ou un détail nécessaire.

## Noms par écran

Les noms de base HAUT, CENTRE et BAS sont communs à tous les écrans. Les zones fonctionnelles emploient uniquement les noms suivants :

| Écran | Zones fonctionnelles |
| --- | --- |
| **Home** | **MARQUE**, **SCÈNE**, **ENTRER** |
| **Cover** | **MONNAIE**, **RAIL**, **JOUER** |
| **CoverBeta** | **BÊTA**, **MONNAIE**, **RAIL**, **JOUER** |
| **CoverCaca** | **CACA**, **MONNAIE**, **RAIL**, **JOUER** |
| **Game** | **RETOUR** ; le gameplay indispensable reste dans **CENTRE** |
| **GameOver** | **RETOUR**, **RÉSULTAT**, **SCORE**, **REJOUER**, **CLASSEMENT** |
| **Ladder** | **RETOUR**, **CLASSEMENT**, **PÉRIODE**, **SCORES** |

Ces noms décrivent une fonction, pas un style. Les cadres montrés par le laboratoire servent à expliquer les occupations et les ancrages ; ils ne constituent pas une DA à recopier.

## Règle de production

Avant une création de DA, une cover, une intégration Phaser ou un écran Core :

1. nommer l’écran parmi les sept modèles ci-dessus ;
2. composer le contenu essentiel dans CENTRE ;
3. réserver les masques Core de cet écran ;
4. prolonger uniquement le décor dans HAUT et BAS ;
5. vérifier une vue mobile par largeur et une vue PC par hauteur dans le laboratoire.

Le brief transmis à un générateur indique le modèle, les zones calmes et les éléments séparés à livrer. Une référence approuvée reste prioritaire pour le style ; les Zones MiniFugg déterminent seulement le cadrage, l’occupation et le comportement de l’écran.
