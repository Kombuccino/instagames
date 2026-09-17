# MiniFugg — Référence des tailles et formats d’assets

Le guide interactif est disponible sur `/?usr=moigod&lab=layout`. Il affiche le vocabulaire de [Zones MiniFugg](MINIFUGG_ZONES.md), les modèles Home, Cover, CoverBeta, CoverCaca, Game, GameOver et Ladder, les références appareil, un simulateur et un calculateur d’assets.

## Dimensions

Pour toute nouvelle production portrait :

- MASTER artistique : `390 × 850` unités logiques ;
- zone de jeu garantie : `390 × 710` ;
- cas centré : HAUT `70`, CENTRE `710`, BAS `70`.

Les références physiques qui ont servi à fixer ce ratio sont A54 Chrome `360 × 656` et iPhone 13 Pro Safari `390 × 712`. A54 Brave `360 × 611` reste un cas dégradé. Ces nombres sont des **pixels CSS de viewport utile**, pas des tailles d’images à utiliser comme masters. Ils servent aux tests, pas à la conception quotidienne.

Les masters et jeux approuvés historiquement en `390 × 844` restent valides. Ne pas les étirer ni les régénérer uniquement pour ajouter 6 pixels. Les outils doivent conserver leur taille source réelle et les comparer au nouveau contrat `390 × 850 / 390 × 710`.

À densité de rendu 2, un nouveau fond ou une nouvelle cover MASTER ne dépasse normalement pas `780 × 1700` pixels. Pour un composant affiché à `W × H` unités, le dérivé runtime maximal est `ceil(W × 2) × ceil(H × 2)`. Recadrer l’alpha au contenu, scinder les atlases dépassant 2048 pixels quand c’est utile et archiver séparément les masters de travail plus grands.

Un asset historique `390 × 844` peut conserver son dérivé existant `780 × 1688` tant qu’il n’est pas repris dans une passe de migration dédiée.

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
- **PC/grand écran :** la hauteur de la zone garantie `390 × 710` pilote. Cette zone occupe toute la hauteur utile, le reste du MASTER est recadré et les côtés restent au Core.
- **Toujours fixe :** largeur logique 390, coordonnées, hitboxes, rapports de taille et zones Core.
- **Variable :** échelle physique, hauteur utile du navigateur/shell, recadrage HAUT/BAS, éventuel EXTRA et sidecars Core latéraux.

Les résolutions de marché servent à choisir les tests, mais la mesure décisive est `window.innerWidth × window.innerHeight` dans chaque mode réel. Les statistiques de résolution ne donnent pas la hauteur utile après les barres du navigateur.

## État de migration

- **Cible :** nouveaux masters `390 × 850`, zone garantie `390 × 710`, covers statiques, dérivés WebP lossless/AVIF vérifiés, cadrage commun width-first mobile et zone-garantie-height PC.
- **Compatibilité :** assets et jeux approuvés `390 × 844` conservés tels quels jusqu’à une migration dédiée.
- **Legacy à supprimer au fil des migrations :** covers animées Phaser, anciens masters 9:16 utilisés sans dérivé, JPG/JPEG runtime et overscan latéral propre aux jeux.

La refonte plateforme commence par les templates/blockouts. Les écrans de production et les jeux ne sont repris en série qu’après validation de cette expérience.
