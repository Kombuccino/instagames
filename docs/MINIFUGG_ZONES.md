# MiniFugg — Zones MiniFugg

**Zones MiniFugg** est le vocabulaire canonique des compositions portrait. Le guide visuel et ses modèles sont disponibles sur `/?usr=moigod&lab=layout`.

## État de la décision

- **Cible validée — 8 septembre 2026 :** largeur mobile prioritaire, hauteur PC prioritaire, aucun décor de jeu ou de cover ajouté sur les côtés.
- **À tester en blockout :** nouvelle expérience Home/Cover/mobile/PC avant de modifier en série les scènes et les jeux.
- **Legacy à éliminer :** mise à l’échelle `FIT` universelle qui réduit inutilement le jeu sur mobile, bandes cyan dessinées dans le master, overscan latéral propre aux jeux et compositions 9:16 non recadrées.

## Vocabulaire commun

Le **MASTER** est le cadre artistique complet de `390 × 844` unités logiques. Il contient trois zones :

| Nom | Coordonnées dans MASTER | Rôle |
| --- | ---: | --- |
| **HAUT** | `x 0→390`, `y 0→91` | Partie recadrable du MASTER. Décor ou information secondaire seulement. |
| **CENTRE** | `x 0→390`, `y 91→753` | Zone commune `390 × 662`, toujours visible. Toute action et information indispensable y tient. |
| **BAS** | `x 0→390`, `y 753→844` | Partie recadrable du MASTER. Décor ou information secondaire seulement. |

Deux zones peuvent exister **hors du MASTER** :

| Nom | Présence | Rôle |
| --- | --- | --- |
| **EXTRA HAUT** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |
| **EXTRA BAS** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |

Le cyan est réservé aux zones **EXTRA**. Il ne doit jamais colorer HAUT ou BAS dans un guide. Sur PC, la hauteur de CENTRE pilote : CENTRE occupe toute la hauteur, HAUT/BAS sont recadrés, et il n’y a ni EXTRA HAUT ni EXTRA BAS. Les espaces restants sont latéraux et appartiennent au Core.

Sur mobile, les 390 unités occupent toute la largeur utile. La hauteur utile dépend du téléphone, des barres de chaque navigateur, du clavier, du mode PWA installé et du shell Capacitor. Si elle est courte, HAUT/BAS sont recadrés symétriquement ou selon un ancrage explicitement choisi ; CENTRE reste entière. Si elle dépasse le MASTER mis à l’échelle, EXTRA HAUT/BAS peuvent apparaître.

## Zones Core par écran

| Écran | Zones fonctionnelles |
| --- | --- |
| **Home** | **MARQUE**, **SCÈNE**, **ENTRER** |
| **Cover** | **MONNAIE**, **RAIL**, **JOUER** |
| **CoverBeta** | **BÊTA**, **MONNAIE**, **RAIL**, **JOUER** |
| **CoverCaca** | **CACA**, **MONNAIE**, **RAIL**, **JOUER** |
| **Game** | **RETOUR** ; gameplay indispensable dans **CENTRE** |
| **GameOver** | **RETOUR**, **RÉSULTAT**, **SCORE**, **REJOUER**, **CLASSEMENT** |
| **Ladder** | **RETOUR**, **CLASSEMENT**, **PÉRIODE**, **SCORES** |

**MONNAIE** et **JOUER** restent entièrement dans les 390 unités de largeur. **RAIL** reste à gauche, par-dessus CENTRE, y compris sur PC. Ces zones sont des masques d’occupation, pas une direction artistique.

## Règle de production

1. Choisir le modèle d’écran.
2. Composer le MASTER `390 × 844` et garder l’essentiel dans CENTRE.
3. Réserver les zones Core du modèle.
4. Considérer HAUT/BAS comme recadrables ; prévoir EXTRA HAUT/BAS seulement si le décor peut être prolongé sans nouvelle information.
5. Vérifier au minimum A54 Brave `360 × 611`, A54 Chrome `360 × 656`, MASTER entier `390 × 844` comme référence documentaire et PC 16:9 avec CENTRE plein écran.
6. Valider le blockout avant de produire la DA finale ou de migrer les écrans existants.

Une référence approuvée garde autorité sur le style. Zones MiniFugg fixe seulement le cadrage, l’occupation et le comportement de l’écran.
