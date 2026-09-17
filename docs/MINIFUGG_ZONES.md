# MiniFugg — Zones MiniFugg

**Zones MiniFugg** est le vocabulaire canonique des compositions portrait. Le guide visuel et ses modèles sont disponibles sur `/?usr=moigod&lab=layout`. Son outil de calage des covers est disponible sur `/?usr=moigod&lab=layout&view=cover-calibration` et le banc DA/gameplay sur `/?usr=moigod&lab=layout&view=gameplay-calibration`.

## État de la décision

- **Cible validée — 17 septembre 2026 :** MASTER portrait `390 × 850`, fenêtre garantie `390 × 710`, soit exactement `70` unités de réserve en HAUT et `70` en BAS dans le cas centré.
- La largeur mobile reste prioritaire ; sur PC, la hauteur de la fenêtre garantie pilote. Les jeux peuvent choisir un ancrage vertical `top`, `center` ou `bottom` sans reflow.
- Les tailles réelles observées sur Chrome/Safari/Brave restent des **cas de diagnostic**, pas le contrat de production.
- **Compatibilité :** les jeux, captures et assets déjà approuvés en `390 × 844` restent valides et ne sont ni étirés ni régénérés par principe. Leur ancien monde logique peut rester déclaré explicitement jusqu’à une migration propre au jeu.
- **Legacy à éliminer :** `FIT` universel qui réduit le jeu sur mobile, masters 9:16 approximatifs pour les nouvelles productions, overscan latéral de jeu, dimensions appareil utilisées comme source de vérité.

## Vocabulaire commun

Le **MASTER** de toute nouvelle production portrait mesure `390 × 850` unités logiques.

| Nom | Coordonnées dans MASTER | Rôle |
| --- | ---: | --- |
| **HAUT** | `x 0→390`, `y 0→70` | Réserve recadrable ; décor ou information secondaire. |
| **CENTRE** | `x 0→390`, `y 70→780` | Fenêtre garantie `390 × 710`. Toute boucle indispensable doit y tenir dans le cas centré. |
| **BAS** | `x 0→390`, `y 780→850` | Réserve recadrable ; décor ou information secondaire. |

La fenêtre garantie mesure toujours `390 × 710`. Elle peut être ancrée différemment selon le jeu :

| Ancrage | Fenêtre logique prioritaire | Usage |
| --- | ---: | --- |
| `top` | `y 0→710` | le haut doit rester stable ; la coupe se fait principalement en bas |
| `center` | `y 70→780` | variation répartie symétriquement |
| `bottom` | `y 140→850` | le bas doit rester stable ; la coupe se fait principalement en haut |

`center` reste la valeur par défaut. L’ancrage est une décision de cadrage, jamais un second layout : les coordonnées du jeu ne changent pas avec le navigateur.

Deux zones peuvent exister **hors du MASTER** : **EXTRA HAUT** et **EXTRA BAS**. Elles ne portent que du décor facultatif lorsqu’un viewport mobile est proportionnellement plus haut que le MASTER mis à l’échelle. Sur PC, l’espace restant est latéral et appartient au Core.

### Compatibilité 390 × 844

Le catalogue contient des jeux et assets approuvés avant cette simplification. Un monde `390 × 844` reste un monde legacy valide : il garde ses coordonnées et ses pixels. Le runtime lui applique la même fenêtre garantie de hauteur `710`, ce qui laisse `67` unités de réserve de chaque côté dans le cas centré. Ce décalage de `3` unités par bord n’autorise ni étirement, ni recadrage destructif, ni régénération automatique d’un asset validé.

Les nouvelles productions utilisent `390 × 850`. Un jeu legacy passe à `850` uniquement quand sa géométrie ou sa DA est réellement migrée et vérifiée.

## Comportement d’écran

Sur mobile, toute la largeur utile est occupée : `scale = largeur utile / 390`. Une hauteur courte recadre verticalement selon l’ancrage ; elle ne réduit pas silencieusement la largeur du jeu.

Sur PC et grand écran, la fenêtre `390 × 710` remplit la hauteur utile, plafonnée par la largeur disponible. Le MASTER déborde en haut/bas selon l’ancrage. Les côtés restent au Core.

Les mesures `360 × 650`, `360 × 656`, `390 × 712`, `360 × 611`, etc. servent uniquement aux contrôles navigateur/appareil. Elles ne définissent plus la géométrie MiniFugg.

## Zones Core par écran

| Écran | Zones fonctionnelles |
| --- | --- |
| **Home** | **MARQUE**, **SCÈNE**, **ENTRER** |
| **Cover** | **MONNAIE**, **RAIL**, **JOUER** |
| **CoverBeta** | **BÊTA**, **MONNAIE**, **RAIL**, **JOUER** |
| **CoverCaca** | **CACA**, **MONNAIE**, **RAIL**, **JOUER** |
| **Game** | **RETOUR** ; gameplay indispensable dans la fenêtre garantie choisie par le jeu |
| **GameOver** | **RETOUR**, **RÉSULTAT**, **SCORE**, **REJOUER**, **CLASSEMENT** |
| **Ladder** | **RETOUR**, **CLASSEMENT**, **PÉRIODE**, **SCORES** |

**MONNAIE** et **JOUER** restent entièrement dans les `390` unités de largeur. **RAIL** reste à gauche par-dessus la composition portrait, y compris sur PC. Ces zones sont des masques d’occupation, pas une direction artistique.

## Règle de production

1. Choisir le modèle d’écran.
2. Composer le nouveau MASTER `390 × 850`.
3. Garder le gameplay indispensable dans une fenêtre `390 × 710` et choisir explicitement `top`, `center` ou `bottom`.
4. Réserver les zones Core du modèle.
5. Traiter HAUT/BAS comme réserves recadrables et EXTRA comme décor facultatif hors MASTER.
6. Vérifier la fenêtre logique `390 × 710`, plusieurs navigateurs/téléphones réels, un cas court dégradé, le MASTER entier `390 × 850` et un PC 16:9.
7. Pour un asset ou jeu historique `390 × 844`, tester la compatibilité sans le modifier avant de décider d’une migration.

Une référence approuvée garde autorité sur le style. Zones MiniFugg fixe seulement le cadrage, l’occupation et le comportement de l’écran.
