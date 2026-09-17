# MiniFugg — Zones MiniFugg

**Zones MiniFugg** est le vocabulaire canonique des compositions portrait. Le guide visuel et ses modèles sont disponibles sur `/?usr=moigod&lab=layout`. Son outil de calage des covers est disponible sur `/?usr=moigod&lab=layout&view=cover-calibration` : il déplace la fenêtre garantie et la console Core sur les masters sans modifier les images, conserve un brouillon local et exporte les décisions en JSON.

Le banc DA/gameplay est disponible sur `/?usr=moigod&lab=layout&view=gameplay-calibration`. Il accepte une image locale ou une référence enregistrée dans `src/core/gameplayDaLabCatalog.ts`, et peut aussi ouvrir chaque jeu du registre dans son vrai runtime. Il simule les viewports de contrôle, teste les ancrages `top | center | bottom`, conserve les décisions localement et exporte un JSON avec les adaptations demandées. Une image importée reste intacte ; ses réglages d'échelle/décalage sont des indications de traduction, jamais une validation automatique ni une modification du master.

## État de la décision

- **Cible validée — 17 septembre 2026 :** largeur logique unique `390`, MASTER portrait `390 × 850`, zone de jeu garantie `390 × 710`, largeur mobile prioritaire, hauteur PC prioritaire. Aucun décor de jeu ou de cover n'est ajouté sur les côtés.
- Les jeux choisissent un ancrage vertical `top`, `center` ou `bottom` selon ce qui doit rester stable lorsque la hauteur utile varie.
- Les mesures appareil `360 × 656` (A54 Chrome), `390 × 712` (iPhone 13 Pro Safari) et `360 × 611` (A54 Brave dégradé) restent des **cas de validation**, pas des dimensions de conception.
- Les masters et jeux approuvés historiquement en `390 × 844` restent compatibles sans étirement ni régénération automatique. Ils migrent individuellement lorsqu'une passe dédiée le justifie.

## Vocabulaire commun

Le **MASTER** canonique est le cadre artistique complet de `390 × 850` unités logiques. La **ZONE JEU GARANTIE** mesure `390 × 710`. Dans le cas centré, cela donne exactement 70 unités recadrables en haut et 70 en bas :

| Nom | Coordonnées dans MASTER | Rôle |
| --- | ---: | --- |
| **HAUT** | `x 0→390`, `y 0→70` | Partie recadrable du MASTER. Décor ou information secondaire seulement. |
| **CENTRE** | `x 0→390`, `y 70→780` | Zone de jeu garantie `390 × 710`. Tout gameplay indispensable doit pouvoir y tenir dans une composition centrée. |
| **BAS** | `x 0→390`, `y 780→850` | Partie recadrable du MASTER. Décor ou information secondaire seulement. |

La zone garantie peut être ancrée différemment selon le jeu :

| Ancrage | Fenêtre logique prioritaire dans MASTER | Usage |
| --- | ---: | --- |
| `top` | `y 0→710` | jeu dont le haut doit rester stable ; la variation/coupe se fait principalement en bas |
| `center` | `y 70→780` | jeu équilibré autour du centre ; variation répartie en haut et en bas |
| `bottom` | `y 140→850` | jeu dont le bas doit rester stable ; la variation/coupe se fait principalement en haut |

`center` reste la valeur par défaut. Un ancrage différent est une **décision de composition du jeu**, pas un reflow : toutes les coordonnées du monde restent dans un seul système logique, seule la fenêtre visible se décale verticalement. Un jeu historique encore en `390 × 844` conserve ses coordonnées propres pendant sa période de compatibilité ; le runtime lui applique la même hauteur garantie de 710 sans le redimensionner vers 850.

Deux zones peuvent exister **hors du MASTER** :

| Nom | Présence | Rôle |
| --- | --- | --- |
| **EXTRA HAUT** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |
| **EXTRA BAS** | seulement si le viewport utile est plus haut que le MASTER mis à l’échelle | prolongement décoratif facultatif |

Le cyan est réservé aux zones **EXTRA**. Il ne doit jamais colorer HAUT ou BAS dans un guide. Sur PC, la hauteur de la zone garantie `390 × 710` pilote l’échelle ; le MASTER déborde verticalement selon l’ancrage choisi et il n’y a ni EXTRA HAUT ni EXTRA BAS. Les espaces restants sont latéraux et appartiennent au Core.

Sur mobile, toute la largeur utile est occupée. **La hauteur ne doit pas réduire la largeur du jeu.** La hauteur utile dépend du téléphone, des barres de chaque navigateur, du clavier, du mode PWA installé et du shell Capacitor. Si le MASTER déborde, le recadrage vertical suit l'ancrage du jeu. Un viewport plus court que le ratio garanti est un cas dégradé : il peut rogner davantage verticalement, mais ne déclenche ni nouveau layout ni réduction horizontale silencieuse.

## Pourquoi 390 × 710

Les deux références réelles qui ont servi à fixer le ratio sont :

- A54 Chrome : `360 × 656`, ratio hauteur/largeur ≈ `1,8222` ;
- iPhone 13 Pro Safari : `390 × 712`, ratio ≈ `1,8256`.

Le ratio A54 Chrome est légèrement plus contraignant. Ramené à une largeur logique de 390, il donne environ `390 × 710,67`. MiniFugg retient **390 × 710** pour garder un nombre entier simple avec une très légère marge de sécurité. Ces mesures ne doivent plus être converties à la main dans les briefs ou les outils de production.

## Zones Core par écran

| Écran | Zones fonctionnelles |
| --- | --- |
| **Home** | **MARQUE**, **SCÈNE**, **ENTRER** |
| **Cover** | **MONNAIE**, **RAIL**, **JOUER** |
| **CoverBeta** | **BÊTA**, **MONNAIE**, **RAIL**, **JOUER** |
| **CoverCaca** | **CACA**, **MONNAIE**, **RAIL**, **JOUER** |
| **Game** | **RETOUR** ; gameplay indispensable dans la fenêtre prioritaire `390 × 710` choisie par le jeu |
| **GameOver** | **RETOUR**, **RÉSULTAT**, **SCORE**, **REJOUER**, **CLASSEMENT** |
| **Ladder** | **RETOUR**, **CLASSEMENT**, **PÉRIODE**, **SCORES** |

**MONNAIE** et **JOUER** restent entièrement dans les 390 unités de largeur. **RAIL** reste à gauche, par-dessus la composition portrait, y compris sur PC. Ces zones sont des masques d’occupation, pas une direction artistique.

## Règle de production

1. Choisir le modèle d’écran.
2. Composer toute nouvelle production portrait dans le MASTER `390 × 850`.
3. Pour le gameplay, choisir explicitement l'ancrage vertical `top`, `center` ou `bottom` et garder les contrôles/informations indispensables dans la zone garantie `390 × 710`.
4. Réserver les zones Core du modèle.
5. Traiter les 140 unités restantes du MASTER comme zone de transition/recadrage et prévoir EXTRA HAUT/BAS seulement si le décor peut être prolongé sans nouvelle information.
6. Vérifier au minimum A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712`, A54 Brave `360 × 611` comme cas dégradé, MASTER entier `390 × 850` et PC 16:9. Les assets ou jeux historiques `390 × 844` sont aussi testés tels quels tant qu’ils n’ont pas été migrés.
7. Valider le blockout avant de produire la DA finale ou de migrer les écrans existants.

Une référence approuvée garde autorité sur le style. Zones MiniFugg fixe seulement le cadrage, l’occupation et le comportement de l’écran.
