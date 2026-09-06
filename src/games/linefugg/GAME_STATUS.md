# LineFugg — Suivi de création

Mis à jour : 7 septembre 2026. Base inspectée : `589f24f` sur `main`.

Phase : reprise de l'intégration artistique après audit. Maturité : jeu jouable, finition Fugg à revoir et vérifier.
Statut registre : `fugg` historique, inchangé par cet audit. Runtime : `phaser-2d`, stage portrait `390 × 844`, migration `current`, non verrouillée. Cover : `update-required`, placeholder.
Livraison : implémentation existante présente sur `main` ; correspondance du site déployé avec ce commit non vérifiée dans cette passe documentaire.
Séquence initiale : jeu existant ; historique du compteur inconnu, aucun nouveau compteur.

## Intention et décisions retenues

Tracer trois lignes de cinq cases maximum sur une grille 7 × 7 pour maximiser le total. Les lignes sont droites, horizontales, verticales ou diagonales ; chaque paire partage au plus une case. Calcul dans le sens du tracé. Grille quotidienne déterministe. Après trois lignes, annulation/redessin restent possibles ; seule la validation explicite termine la partie.

DA **Orbital Accounting** approuvée le 6 septembre 2026 : instrument céleste en laiton, bleu encre, parchemin, nombres prioritaires. Pas de texte décoratif ou de nom du jeu dans le gameplay. Trois indicateurs avec cinq points chacun, présents une seule fois. Musiques canoniques : MF-MUS-0008 et MF-MUS-0009.

Le 7 septembre, l'utilisateur demande de poursuivre la reprise, précédée d'une notice commune à tous les jeux. Il demande explicitement que les instructions acquises soient conservées pour les covers et animations, sans rendu générique « ChatGPT style ». Cette passe livre la notice et le suivi ; elle ne corrige pas encore le renderer.

Références : [ART_DIRECTION.md et contrat artistique](ART_DIRECTION.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [notice commune](../../../docs/GAME_CREATION_PIPELINE.md), discussion ChatGPT [Game : LineFugg](https://chatgpt.com/c/6a96d2e6-ad54-83eb-9d9e-c74fe69d955d).

## Avancement

| Lot | État | Réalisé / preuve | Reste / critère de sortie |
| --- | --- | --- | --- |
| Prototype et boucle Core | À vérifier | Jeu Phaser jouable, règles et liaison Core dans les sources | Rejouer entrée → trois lignes → annulation → validation → reprise ; vérifier un seul finish |
| GD et équilibre | À vérifier | Règles retenues documentées, calcul quotidien existant | Essais de difficulté/plaisir, limites des opérations et scores ; ne pas changer le GD pour faciliter le décor |
| Composition et inputs | À faire | Stage canonique ; code : grille utile de 282 unités dans un panneau plus large | Revoir blockout, taille tactile et zones de calcul ; le document DA vise environ 370 unités de grille, écart à résoudre |
| DA | Validé | Choix Orbital Accounting et master identifiés dans ART_DIRECTION.md | Conserver cette direction ; validation de l'intégration reste distincte |
| Assets / intégration | À faire | Pack v5 importé et utilisé, manifeste existant | Corriger ratios et zones utiles des bandes, chevauchements des textes et alignement du dock ; mesurer les contrats avant toute régénération |
| Animations / éclairages / FX | À faire | Tracés lumineux, impulsions et feedback présents dans LineFuggScene.ts | Séparer les accessoires actuellement peints dans le fond pour les animer ; sélectionner les effets utiles, vérifier lisibilité/coût/mouvement réduit |
| SFX / musique / mix | À vérifier | Pistes retenues ; lecteur géré via l'audio Core dans les sources | Auditer événements SFX et écouter le mix, transitions, mute, suspension/reprise ; ne pas régénérer les musiques choisies par défaut |
| Cover / transition | À faire | Placeholder et état de migration constatés au registre | Après stabilisation du gameplay, produire une principale fidèle ; couches animées et repli statique selon choix, runtime partagé |
| Performance / multi-écran / QA | À vérifier | Inspection des sources et diagnostic visuel antérieur | Nouvelle matrice de captures conservées, mesures de textures/chargement, petit écran et appareil physique ; aucun budget mobile validé à ce stade |
| Curation / livraison | À vérifier | `status: fugg` déjà publié dans le code | Revue de qualité finale puis vérification de la version déployée ; ne pas confondre statut historique et acceptation artistique |

## Prochaines actions

1. Vérifier le `main` et les éventuels travaux parallèles. Refaire un blockout lisible dans le stage canonique : grille, trois formules avec résultats, total et contrôles. Montrer les états chargés et les scores longs.
2. Mesurer les bounds utiles, ouvertures, zones extensibles et ancrages du pack. Compléter le manifeste ; choisir ce qui se réutilise et les éléments à reproduire. Tester un composant représentatif intégré avant tout le pack.
3. Réaliser les assets nécessaires dans la DA acquise, intégrer les composants et quelques mouvements caractéristiques, puis tester la boucle et le son. Traiter la cover définitive après stabilisation de cette promesse visuelle.

Décisions attendues : aucune pour écrire la notice ou commencer le diagnostic/blockout. Une modification importante de la composition approuvée sera présentée avec son compromis lisibilité/décor. Aucune nouvelle DA à choisir.
Travaux parallèles : l'utilisateur a signalé une discussion ChatGPT pour la refonte et une tâche Codex pour l'audio ; l'audio partagé est déjà intégré à la base inspectée. Leur activité actuelle reste à consulter avant de modifier les mêmes fichiers. Cette passe ne change que la documentation.
Blocages : aucun pour la documentation et le blockout. Vérifier l'accès effectif à la génération et au pipeline Drive avant de promettre la livraison d'un nouveau pack.

## Vérifications et limites

- 7 septembre 2026, base `589f24f` : registre, scène et documents relus. `BOARD_SIZE = 282` et centres d'indicateurs indépendants constatés. Les bandes de calcul sont forcées à 372 unités de large ; leurs proportions et bounds utiles doivent être contrôlés avant correction.
- La capture fournie par l'utilisateur montre la densité décorative, les bandes écrasées, les collisions de lecture et les indicateurs décalés. Elle étaye le diagnostic visuel mais n'identifie pas le commit déployé.
- Des observations navigateur antérieures sur les états initial, une ligne et trois lignes orientent l'audit. Elles ne constituent pas une matrice multi-appareil conservée ni une validation de la boucle complète. À reproduire avec preuves durables lors de l'implémentation.
- Pas de build, test gameplay ou écoute finale exécuté dans cette passe documentaire. Les anciens résultats de build ne valident pas les futures corrections artistiques.
- Budgets de fluidité, chargement et mémoire : à fixer puis mesurer sur les cibles retenues. Une estimation RGBA des images n'est pas une mesure de mémoire GPU.

## Derniers changements / enseignements

7 septembre 2026 — fiche initialisée et contrat artistique relié à la notice commune. Une référence approuvée n'est pas un asset runtime ; conserver les proportions utiles, partager les ancrages entre art et état, produire séparément les pièces à animer. FIT et build réussi ne prouvent ni ergonomie ni fidélité. Le prochain passage reprend ces décisions sans faire répéter l'utilisateur.
