# MiniFugg — Référence des tailles d’assets

Cette fiche complète `GAME_LAYOUT_SYSTEM.md` et `GAME_ART_PRODUCTION_PIPELINE.md`. Sa représentation interactive est disponible dans l’application avec :

`/?usr=moigod&lab=layout`

La page permet d’ouvrir séparément le gabarit d’un jeu ou d’une cover, sans interface autour, de télécharger les deux variantes PNG, de simuler les écrans courants et de calculer la taille maximale d’un asset à partir de sa zone logique. Les contrôles Core restent ancrés à la fenêtre comme en production.

Les vues isolées séparent trois contrats :

- **fenêtre minimale jouable A54** : `390 × 662`, correspondant à toute la surface commune réellement visible dans Brave et Chrome avec leur interface ouverte ;
- **fond de jeu / cover mobile** : composition `390 × 844`, remplissage uniforme de la surface avec crop centré ;
- **overlays Core** : ancrés à la fenêtre, indépendamment du plan artistique.

Les captures réelles fournies le 8 septembre 2026 mesurent environ `360 × 611` CSS dans Brave et `360 × 656` dans Chrome sur le même Galaxy A54. Rapportée à une largeur logique de 390, leur intersection donne `390 × 662`. La zone verte occupe donc toute la largeur et les coordonnées verticales `y 91 → 753` dans le master `390 × 844`. Brave affiche pratiquement cette zone entière ; Chrome révèle environ 49 unités logiques supplémentaires réparties en haut et en bas. Les zones orange/rouge ne réduisent pas la zone minimale : elles montrent séparément où le Core peut se superposer.

## Le cadre de production

| Usage | Stage logique | Dérivé raster runtime maximal à densité 2 |
| --- | ---: | ---: |
| gameplay portrait et cover | 390 × 844 | 780 × 1688 |

Depuis la décision du 8 septembre 2026, toute nouvelle production est en portrait. Le paysage reste seulement une compatibilité technique pour les jeux existants qui en dépendent ; il n’entre plus dans les briefs, gabarits ou lots d’assets courants.

Le master `390 × 844` reste la composition artistique maximale. Le gameplay place toute sa boucle essentielle dans la fenêtre minimale `390 × 662`, puis peut employer la hauteur supplémentaire pour davantage de décor, d’anticipation ou d’espace de mouvement sans déplacer les éléments essentiels. Il ne doit pas créer des marges internes qui réduisent encore cette fenêtre. Sur écran large, le stage/cover canonique est conservé et l’espace restant appartient au Core ou au décor d’accompagnement : on ne détruit pas une composition portrait avec un crop vertical massif. Le bouton Retour, le rail, la monnaie et le CTA sont des masques d’occupation distincts.

## Règle de dimensionnement

Pour un composant qui occupe `W × H` unités logiques :

- fichier runtime maximal : `ceil(W × 2) × ceil(H × 2)` pixels ;
- transparence recadrée au contenu utile ;
- master de travail éventuellement supérieur, archivé séparément ;
- le jeu ne charge pas le master surdimensionné ;
- une feuille d’atlas runtime reste de préférence sous 2048 × 2048, sinon elle est scindée.

Cette règle est un maximum, pas une cible obligatoire. Une texture volontairement franche, une forme procédurale ou un pixel art construit sur une grille plus basse peut utiliser moins de pixels. Le rapport avec la taille affichée doit rester volontaire et cohérent entre les assets du même jeu.

## État dynamique

Le fond permanent ne contient jamais score, vies, recette, clients, ingrédients, contrôle ou état mutable. Les panneaux authored peuvent fournir le cadre et la matière ; Phaser fournit les valeurs et les états. Les états visuels importants d’un bouton, personnage ou objet sont livrés séparément ou dans un atlas mesuré.

## Différences selon l’écran

Toujours visible et fixe : stage canonique, géométrie, gameplay, HUD authored dans la scène, hitboxes, caméra et rapports de taille.

Variable : échelle uniforme, densité physique, marges Core, sidecars optionnels et overscan décoratif. Aucun élément variable ne porte une information indispensable.

## Données d’écran et tendance

Référence au 8 septembre 2026 : les six premières résolutions de viewport mobile publiées par StatCounter représentent 42,48 % des pages vues mesurées dans le monde en août 2026. Elles se regroupent principalement autour des ratios 19,5:9 et 20:9 ; `390 × 844` appartient à cette famille. Source : [StatCounter Global Stats](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide).

Chez les joueurs PC, l’enquête Steam d’août 2026 reste dominée par `1920 × 1080` (50,52 %) et `2560 × 1440` (21,86 %). Le portage PC doit donc conserver le stage portrait par mise à l’échelle uniforme et utiliser les côtés pour le Core ou un décor optionnel, sans étirer ni recomposer le gameplay. Source : [Steam Hardware Survey](https://store.steampowered.com/hwsurvey).

La tendance structurante est la multiplication des fenêtres redimensionnables : tablettes, appareils pliables, écran partagé et modes bureau. Android recommande de répondre à la taille de fenêtre disponible plutôt qu’au modèle physique. MiniFugg traite donc le Core comme adaptatif et le stage de jeu comme fixe. Source : [guide Android officiel](https://developer.android.com/develop/adaptive-apps/guides/support-different-display-sizes).

## Test plein écran mobile

- Android / Chrome : ouvrir le site HTTPS, choisir « Installer l’application » ou « Ajouter à l’écran d’accueil », puis lancer MiniFugg depuis son icône.
- iPhone / Safari : utiliser Partager puis « Sur l’écran d’accueil », puis lancer MiniFugg depuis son icône. iOS utilise le mode autonome ; le mode `fullscreen` du manifeste retombe sur ce mode.
- Le plein écran demandé par le navigateur sert seulement d’aperçu et n’est pas fiable sur iPhone. L’installation PWA est le test web le plus proche de l’app ; un build Capacitor reste la validation du shell natif.

Le dépôt possède déjà les métadonnées iOS et le wordmark canonique. La planche d’exploration favicon/app-icon est archivée, mais aucune option n’est encore enregistrée comme icône canonique dans `docs/BRAND_ASSETS.md`. Le manifeste PWA et ses fichiers 192/512 doivent être branchés après ce choix, sans redessiner la marque.

## Écarts de plateforme encore ouverts

- Les covers statiques utilisent actuellement un remplissage CSS par recadrage, alors que les covers Phaser conservent 390 × 844 en `FIT`. Le cadrage doit être unifié dans le Core.
- Les anciens masters 9:16 sont plus larges que 390 × 844. En plein cadre actuel, environ 18 % de leur largeur disparaît. Les originaux validés doivent rester intacts et recevoir un dérivé cadré avec une zone sûre.
- Les migrations doivent encore réduire plusieurs textures et atlases existants produits très au-dessus de leur taille d’affichage.
- L’overscan appartient uniquement à la surface décorative du jeu. Il ne doit jamais remplacer ou agrandir la scène canonique.
