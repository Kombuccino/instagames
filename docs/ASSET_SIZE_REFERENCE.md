# MiniFugg — Référence des tailles et formats d’assets

Le guide interactif est disponible sur `/?usr=moigod&lab=layout`. Il affiche le vocabulaire de [Zones MiniFugg](MINIFUGG_ZONES.md), les modèles Home, Cover, CoverBeta, CoverCaca, Game, GameOver et Ladder, deux captures utiles mesurées sur Galaxy A54, un simulateur et un calculateur d’assets.

## Dimensions

Le MASTER portrait mesure `390 × 844` unités logiques. CENTRE mesure `390 × 662`, de `y 91` à `y 753`. HAUT et BAS appartiennent au MASTER et peuvent être recadrés. EXTRA HAUT/BAS sont hors MASTER et n’apparaissent que sur un viewport proportionnellement plus haut.

Les captures du 8 septembre 2026 donnent environ `360 × 611` CSS dans Brave et `360 × 656` dans Chrome sur le même A54. Ces nombres sont des **pixels CSS de viewport utile**, pas des pixels physiques ni une taille d’image. Le mode PWA ou Capacitor donnera encore une autre hauteur utile.

À densité de rendu 2, un fond ou une cover MASTER ne dépasse normalement pas `780 × 1688` pixels. Pour un composant affiché à `W × H` unités, le dérivé runtime maximal est `ceil(W × 2) × ceil(H × 2)`. Recadrer l’alpha au contenu, scinder les atlases dépassant 2048 pixels quand c’est utile et archiver séparément les masters de travail plus grands.

## Formats validés

| Usage | Format cible | Règle |
| --- | --- | --- |
| source, master approuvé, masque ou donnée exigeant une fidélité stricte | **PNG** | original conservé, jamais recompressé destructivement |
| sprite, panneau, atlas, décor courant avec ou sans alpha | **WebP lossless** | format runtime par défaut après comparaison au PNG |
| grande cover ou grand fond statique | **AVIF** puis WebP/PNG de repli | seulement si le gain est réel et le décodage testé sur les shells cibles |
| JPG/JPEG | **interdit pour toute nouvelle production** | les fichiers existants sont legacy et remplacés lors de leur migration |

Phaser charge les formats que le navigateur/WebView sait décoder. Cette politique reste compatible avec les navigateurs modernes, PWA, Capacitor Android/iOS et Electron/Steam définis par MiniFugg. Les replis PNG/WebP couvrent le petit parc ancien que nous ne ciblons pas en priorité.

Le poids transféré et la mémoire sont deux problèmes distincts : WebP/AVIF réduisent fortement le téléchargement et le stockage, mais une image décodée ordinaire occupe encore environ `largeur × hauteur × 4` octets en mémoire. Les textures GPU compressées pourront constituer une optimisation ultérieure pour les jeux très chargés, avec un repli lossless obligatoire.

## Comportement par écran

- **Mobile :** la largeur utile pilote l’échelle uniforme. Une hauteur courte recadre HAUT/BAS ; une hauteur très longue révèle EXTRA HAUT/BAS.
- **PC/grand écran :** la hauteur utile pilote. Le MASTER entier est visible et atteint la largeur proportionnelle maximale. Les côtés restent au Core.
- **Toujours fixe :** coordonnées, hitboxes, rapports de taille, CENTRE et zones Core dans les 390 unités.
- **Variable :** échelle physique, hauteur utile du navigateur/shell, recadrage HAUT/BAS, éventuel EXTRA et sidecars Core latéraux.

Les résolutions de marché servent à choisir les tests, mais la mesure décisive est `window.innerWidth × window.innerHeight` dans chaque mode réel. Les statistiques de résolution ne donnent pas la hauteur utile après les barres du navigateur.

## État de migration

- **Cible :** covers statiques, nouveaux dérivés WebP lossless/AVIF vérifiés, cadrage commun width-first mobile et height-first PC.
- **Actuel :** mélange de covers statiques recadrées par le Core et de covers Phaser en `FIT`, plus plusieurs PNG surdimensionnés.
- **Legacy à supprimer :** covers animées Phaser, anciens masters 9:16 utilisés sans dérivé, JPG/JPEG runtime et overscan latéral propre aux jeux.

La refonte plateforme commence par les templates/blockouts. Les écrans de production et les jeux ne sont repris en série qu’après validation de cette expérience.
