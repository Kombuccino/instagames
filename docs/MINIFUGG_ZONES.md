# MiniFugg — Zones MiniFugg

**Zones MiniFugg** est le vocabulaire canonique des compositions portrait. Le guide visuel et ses modèles sont disponibles sur `/?usr=moigod&lab=layout`. Son outil de calage des covers est disponible sur `/?usr=moigod&lab=layout&view=cover-calibration` : il déplace la fenêtre minimale et la console Core sur les masters sans modifier les images, conserve un brouillon local et exporte les décisions en JSON.

Le banc DA/gameplay est disponible sur `/?usr=moigod&lab=layout&view=gameplay-calibration`. Il accepte une image locale ou une référence enregistrée dans `src/core/gameplayDaLabCatalog.ts`, et peut aussi ouvrir chaque jeu du registre dans son vrai runtime. Il simule les viewports de contrôle, teste les ancrages `top | center | bottom`, conserve les décisions localement et exporte un JSON avec les adaptations demandées. Une image importée reste intacte ; ses réglages d'échelle/décalage sont des indications de traduction, jamais une validation automatique ni une modification du master.

## État de la décision

- **Cible validée — 13 septembre 2026 :** fenêtre exploitable officielle `360 × 650`, largeur mobile prioritaire, hauteur PC prioritaire, aucun décor de jeu ou de cover ajouté sur les côtés ; les jeux peuvent choisir un ancrage vertical `top`, `center` ou `bottom` selon l'endroit qui doit rester stable quand la hauteur utile varie.
- **À tester en blockout :** nouvelle expérience Home/Cover/mobile/PC avant de modifier en série les scènes et les jeux.
- **Legacy à éliminer :** mise à l’échelle `FIT` universelle qui réduit inutilement le jeu sur mobile, bandes cyan dessinées dans le master, overscan latéral propre aux jeux et compositions 9:16 non recadrées.

## Vocabulaire commun

Le **MASTER** est le cadre artistique complet de `390 × 844` unités logiques. Il contient trois zones de référence :

| Nom | Coordonnées dans MASTER | Rôle |
| --- | ---: | --- |
| **HAUT** | `x 0→390`, `y 0→69,92` | Partie recadrable du MASTER. Décor ou information secondaire seulement dans une composition centrée. |
| **CENTRE** | `x 0→390`, `y 69,92→774,08` | Équivalent logique de la fenêtre officielle `360 × 650`, soit `390 × 704,17`. |
| **BAS** | `x 0→390`, `y 774,08→844` | Partie recadrable du MASTER. Décor ou information secondaire seulement dans une composition centrée. |

La mesure produit reste toujours `360 × 650`. Le runtime la convertit dans le MASTER de largeur logique 390 en une fenêtre de `390 × 704,17`, qui peut être ancrée différemment selon le jeu :

| Ancrage | Fenêtre logique prioritaire dans MASTER | Usage |
| --- | ---: | --- |
| `top` | `y 0→704,17` | jeu dont le haut doit rester stable ; la variation/coupe se fait principalement en bas |
| `center` | `y 69,92→774,08` | jeu équilibré autour du centre ; variation répartie en haut et en bas |
| `bottom` | `y 139,83→844` | jeu dont le bas doit rester stable ; la variation/coupe se fait principalement en haut |

`center` reste la valeur par défaut. Un ancrage différent est une **décision de composition du jeu**, pas un reflow : toutes les coordonnées du monde restent en `390 × 844`, seule la fenêtre visible se décale verticalement. Vlad utilise `bottom` afin que le grill, la main et la prise restent stables tandis que le haut du décor absorbe les écarts de navigateur.

Deux zones peuvent exister **hors du MASTER** :

| Nom | Présence | Rôle |
| --- | --- | --- |
| **EXTRA HAUT** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |
| **EXTRA BAS** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |

Le cyan est réservé aux zones **EXTRA**. Il ne doit jamais colorer HAUT ou BAS dans un guide. Sur PC, la hauteur correspondant au ratio officiel `360 × 650` pilote ; le MASTER déborde verticalement selon l'ancrage choisi et il n'y a ni EXTRA HAUT ni EXTRA BAS. Les espaces restants sont latéraux et appartiennent au Core.

Sur mobile, toute la largeur utile est occupée. **La hauteur ne doit pas réduire la largeur du jeu.** La hauteur utile dépend du téléphone, des barres de chaque navigateur, du clavier, du mode PWA installé et du shell Capacitor. Si le MASTER déborde, le recadrage vertical suit l'ancrage du jeu. Une fenêtre plus courte que `360 × 650` à largeur normalisée est un cas dégradé : elle peut rogner davantage verticalement, mais ne déclenche ni nouveau layout ni réduction horizontale silencieuse.

## Zones Core par écran

| Écran | Zones fonctionnelles |
| --- | --- |
| **Home** | **MARQUE**, **SCÈNE**, **ENTRER** |
| **Cover** | **MONNAIE**, **RAIL**, **JOUER** |
| **CoverBeta** | **BÊTA**, **MONNAIE**, **RAIL**, **JOUER** |
| **CoverCaca** | **CACA**, **MONNAIE**, **RAIL**, **JOUER** |
| **Game** | **RETOUR** ; gameplay indispensable dans la fenêtre prioritaire officielle `360 × 650` choisie par le jeu |
| **GameOver** | **RETOUR**, **RÉSULTAT**, **SCORE**, **REJOUER**, **CLASSEMENT** |
| **Ladder** | **RETOUR**, **CLASSEMENT**, **PÉRIODE**, **SCORES** |

**MONNAIE** et **JOUER** restent entièrement dans les 390 unités de largeur. **RAIL** reste à gauche, par-dessus la composition portrait, y compris sur PC. Ces zones sont des masques d’occupation, pas une direction artistique.

## Règle de production

1. Choisir le modèle d’écran.
2. Composer le MASTER `390 × 844`.
3. Pour le gameplay, choisir explicitement l'ancrage vertical `top`, `center` ou `bottom` et garder les contrôles/informations indispensables dans la fenêtre officielle `360 × 650` — équivalent logique `390 × 704,17`.
4. Réserver les zones Core du modèle.
5. Traiter le reste du MASTER comme zone de transition/recadrage et prévoir EXTRA HAUT/BAS seulement si le décor peut être prolongé sans nouvelle information.
6. Vérifier la référence officielle `360 × 650`, A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712` — environ `360 × 657` normalisé —, A54 Brave `360 × 611` comme cas dégradé, MASTER entier `390 × 844` comme référence documentaire et PC 16:9 avec le ratio officiel plein écran.
7. Valider le blockout avant de produire la DA finale ou de migrer les écrans existants.

Une référence approuvée garde autorité sur le style. Zones MiniFugg fixe seulement le cadrage, l’occupation et le comportement de l’écran.
