# MiniFugg — Référence des tailles et formats d’assets

Le guide interactif est disponible sur `/?usr=moigod&lab=layout`. Il affiche le vocabulaire de [Zones MiniFugg](MINIFUGG_ZONES.md), les modèles d’écran, le simulateur et le calculateur d’assets.

## Dimensions

Pour toute **nouvelle production portrait**, le MASTER mesure `390 × 850` unités logiques. La fenêtre garantie mesure `390 × 710`. Dans le cas centré, HAUT et BAS font exactement `70` unités chacun.

À densité de rendu 2, un nouveau fond ou une nouvelle cover MASTER ne dépasse normalement pas `780 × 1700` pixels. Pour un composant affiché à `W × H` unités, le dérivé runtime maximal reste `ceil(W × 2) × ceil(H × 2)`.

### Assets historiques

Les assets déjà approuvés en `390 × 844` et leurs dérivés `780 × 1688` restent valides. Ils sont **legacy, pas invalides** : ne pas les étirer, les régénérer ou leur ajouter artificiellement six pixels uniquement pour changer leur étiquette de format. Ils continuent d’être utilisés avec leur géométrie historique jusqu’à une reprise explicitement décidée.

Les anciennes résolutions d’appareil (`360 × 650`, `360 × 656`, `390 × 712`, `360 × 611`, etc.) servent aux tests physiques et navigateurs. Elles ne sont plus la source des dimensions logiques MiniFugg.

## Formats validés

| Usage | Format cible | Règle |
| --- | --- | --- |
| source, master approuvé, masque ou donnée exigeant une fidélité stricte | **PNG** | original conservé, jamais recompressé destructivement |
| sprite, panneau, atlas, décor courant avec ou sans alpha | **WebP lossless** | format runtime par défaut après comparaison au PNG |
| grande cover ou grand fond statique | **AVIF** puis WebP/PNG de repli | seulement si le gain est réel et le décodage testé sur les shells cibles |
| JPG/JPEG | **interdit pour toute nouvelle production** | les fichiers existants sont legacy et remplacés lors de leur migration |

Phaser charge les formats que le navigateur/WebView sait décoder. Les replis PNG/WebP couvrent les shells cibles.

Le poids transféré et la mémoire sont deux problèmes distincts : une image décodée ordinaire occupe encore environ `largeur × hauteur × 4` octets en mémoire. Recadrer l’alpha au contenu, scinder les atlases dépassant 2048 pixels quand c’est utile et archiver séparément les masters de travail plus grands.

## Comportement par écran

- **Mobile :** la largeur utile pilote l’échelle uniforme. Une hauteur courte recadre HAUT/BAS ; une hauteur très longue peut révéler EXTRA HAUT/BAS.
- **PC/grand écran :** la hauteur de la fenêtre `390 × 710` pilote ; le MASTER déborde verticalement et les côtés restent au Core.
- **Toujours fixe :** coordonnées, hitboxes, rapports de taille et cadre logique de 390 unités.
- **Variable :** échelle physique, hauteur utile du navigateur/shell, recadrage vertical, éventuel EXTRA et sidecars Core latéraux.

Les statistiques de résolution servent à choisir les tests, mais la mesure décisive reste le viewport réel dans chaque mode. Elles ne définissent pas le MASTER.

## État de migration

- **Cible :** nouveaux masters `390 × 850`, fenêtre garantie `390 × 710`, covers statiques et dérivés lossless vérifiés.
- **Compatibilité :** jeux/covers `390 × 844` conservés tels quels tant qu’ils ne sont pas repris.
- **Legacy à supprimer lors d’une vraie migration :** covers animées Phaser, anciens masters 9:16 approximatifs utilisés sans dérivé, JPG/JPEG runtime et overscan latéral propre aux jeux.
