# MiniFugg — Refonte plateforme par blockouts

Mis à jour le 8 septembre 2026. Ce document sépare l'état actuel, les décisions déjà validées et le prochain travail de conception. Il évite de transformer une idée encore à décrire en migration prématurée.

## Décisions validées

- Production portrait uniquement.
- MASTER `390 × 844`, CENTRE `390 × 662`, vocabulaire de `MINIFUGG_ZONES.md`.
- Mobile : utiliser toute la largeur utile ; le navigateur, la PWA ou l'app déterminent la hauteur réellement disponible.
- PC/grand écran : CENTRE utilise toute la hauteur utile pour obtenir la largeur proportionnelle maximale ; HAUT/BAS sont recadrés et les côtés appartiennent au Core.
- Aucun décor latéral propre à une cover ou à un jeu.
- Covers finales statiques rendues par Core ; abandon de toute nouvelle production de covers animées.
- Nouvelle production graphique : PNG master, WebP lossless runtime, AVIF validé pour les grandes images statiques, aucun nouveau JPEG.

## État actuel

L'application fonctionne, mais combine plusieurs générations de layout : Core responsive, stages Phaser en `FIT`, jeux DOM/CSS legacy, covers statiques recadrées et covers Phaser animées. Cette coexistence explique les tailles incohérentes, l'espace perdu sur mobile et les alignements différents entre Home, Cover et Game.

Les templates du laboratoire couvrent Home, Cover, CoverBeta, CoverCaca, Game, GameOver et Ladder. Ils constituent le banc d'essai commun ; ils ne valident pas encore l'expérience finale.

## Deux familles d'expérience — direction du 8 septembre 2026

La refonte doit partager les mêmes jeux, données, identité et composants entre deux familles, sans prétendre que leur mise en scène est identique.

### Écran complet

Le téléphone, la PWA installée et les fenêtres trop étroites emploient l'expérience centrale portrait. Home mène à Cover puis au jeu ; Info, Comments et Ladder conservent leurs panneaux MiniFugg. Ils partagent les données avec le magazine sans imiter un site Web externe. GameOver conserve sa surface dédiée et doit recevoir une DA Core spécifique. Le contrat détaillé vit dans `DA_MAGAZINE.md`.

### Écran étendu

Un écran suffisamment large emploie l'espace latéral comme partie de l'expérience Core :

1. la scène Home low-poly s'étend sur le viewport entier ;
2. après l'entrée, la main rapproche le téléphone au tout premier plan ; il se place à droite et utilise 95 % de la hauteur utile car cover et gameplay s'y déroulent réellement ; le verre reprend directement le MASTER `390 × 844`, sans caméra, encoche, capteur ni menton, entouré d'un cadre fictif minimal ;
3. le métro s'assombrit progressivement tandis qu'une chambre avec bureau apparaît ; le téléphone et la main forment le raccord visuel continu ; une fois arrivé, le décor de chambre ne subsiste qu'en bordure ;
4. à gauche, le magazine `MiniFugg Retro Gaming` est d'abord fermé : sa première de couverture reste lisible pendant environ 4–5 secondes ;
5. le magazine s'ouvre ensuite sur le premier Fugg, avec une seule page active posée presque à plat et réellement lisible ; le reste de l'objet est replié dessous et laisse deviner un fragment arrondi de la cover du jeu ; trois onglets donnent accès aux pages de même taille `FEATURE`, `COMMENTS` et `RANKING` ;
6. cover puis gameplay restent dans le téléphone ; changer de Fugg remplace la cover dans l'écran fixe et tourne la page du magazine, sans faire glisser le téléphone, la main, le bureau ou le décor.

La une est toujours la même. Elle met en scène Fuggy canonique dans une pose amusante low-poly, avec le masthead MiniFugg exact et des accroches courtes en anglais. Elle ne sélectionne plus de jeu, de favori ou de contenu dynamique.

Le magazine est une autre composition des mêmes données Core, pas un second système social. Ses pages fixes mêlent humour éditorial français, encarts et hiérarchie américains, densité maîtrisée, petites captures et repères colorés japonais. Les trois grilles sont `FEATURE`, `COMMENTS` et `RANKING`, en anglais. Aucun gribouillis, texte manuscrit, mascotte improvisée, papier sale, vieillissement artificiel, Like ou Favori. Le nom du jeu est recomposé en texte vivant dans la typographie éditoriale du magazine. Cette présentation n'impose pas une DA rétro aux jeux affichés dans le téléphone. Le contrat détaillé vit dans `DA_MAGAZINE.md`.

La page `FEATURE` réserve sa surface au nom du jeu composé dans la police du magazine, une baseline, une description courte, une capture compacte d'une partie avancée, trois puces `HOW TO PLAY`, la version, la première sortie connue et la dernière mise à jour. Elle n'affiche ni logo raster du jeu, ni high score, ni note, ni verdict. `COMMENTS` donne la place aux conversations et réactions. `RANKING` emploie exactement le même gabarit pour le podium, le classement et la ligne du joueur. Chaque rubrique remplace la précédente dans la page active.

La Home bis alpha `/?usr=moigod&lab=home-bis` est le prototype fonctionnel de cette direction. Elle utilise une surface de téléphone au ratio canonique `390 × 844`, à 95 % de la hauteur utile PC, et lance le vrai jeu dans ce téléphone sans quitter la scène. Bureau, magazine, main et téléphone forment une scène unique persistante : molette, navigation latérale et `CHANGE GAME` ne changent que le contenu du téléphone et la page. Ces commandes sont verrouillées pendant le gameplay. Le premier essai `390 × 884` reste une hypothèse documentée, pas la géométrie de cette alpha.

Les onglets permettent de sauter directement à une rubrique ; le tourné de page reste court et peut être réduit ou supprimé selon les préférences de mouvement.

Un marque-page ou contrôle discret permettant de revenir à Home peut être étudié plus tard. Il ne doit pas prendre de place dans la première validation de composition.

Premières recherches raster, non validées comme production :

- `/assets/generated/platform/concepts/extended-screen-v1/metro-room-phone-occlusion-concept-v2.png` — transition recommandée ;
- `/assets/generated/platform/concepts/extended-screen-v1/metro-room-transition-concept-v1.png` — première étude conservée pour comparaison, dissolution carrée refusée ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-closed-concept-v2.png` — une fermée avec logo exact et coverlines ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-info-concept-v3.png` — cadrage téléphone et structure Dossier utiles, DA de page rejetée ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-comments-concept-v3.png` — structure Commentaires utile, DA de page rejetée ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-ladder-concept-v3.png` — meilleure structure Classement, DA de page rejetée ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-open-concept-v2.png` — étude ouverte antérieure, remplacée par les trois variantes v3 ;
- `/assets/generated/platform/concepts/extended-screen-v1/room-magazine-dossier-clean-concept-v4.png` — première candidate propre conforme à `DA_MAGAZINE.md`, à valider avant déclinaisons ;
- `/assets/generated/platform/concepts/extended-screen-v1/minifugg-retro-gaming-masthead-v1.png` — étude de masthead réutilisable fondée sur le logo exact.

La transition recommandée emploie le téléphone et la main agrandis comme masque naturel : le métro perd netteté et exposition derrière eux, le centre passe presque au noir, puis la lumière chaude du bureau révèle la chambre dans leur sillage. La dissolution numérique en carrés de la première étude est écartée. Un fondu noir uniforme avec téléphone stable reste le repli à mouvement réduit.

## Legacy à éliminer après remplacement validé

- `FIT` universel qui réduit un stage au lieu d'utiliser toute la largeur mobile ;
- overscan et décor latéral propres aux jeux/covers ;
- covers animées Phaser et anciens systèmes CSS/parallax ;
- masters 9:16 branchés sans dérivé `390 × 844` contrôlé ;
- images surdimensionnées ou JPEG ;
- correctifs responsive différents dans chaque jeu.

Le legacy reste actif tant que son remplacement n'est pas vérifié. Git conserve ensuite l'historique ; le code de production obsolète est supprimé.

## Prochaine phase

1. Recueillir la description complète de l'expérience souhaitée par l'utilisateur pour Home, découverte/Cover, mobile et PC large.
2. Traduire cette description en blockouts simples dans le laboratoire, sans DA finale et sans modifier les jeux.
3. Tester les blockouts dans Brave/Chrome sur A54, en PWA/app et sur PC large ; mesurer `window.innerWidth × window.innerHeight`.
4. Valider navigation, hiérarchie, zones Core, crop, sidecars et passage Cover → Game.
5. Écrire le plan de migration par surface et par jeu.
6. Migrer une surface pilote, vérifier, puis étendre par lots.

Tant que l'étape 4 n'est pas validée, ne pas lancer une reprise générale des scènes ou des jeux. Les corrections bloquantes et travaux déjà autorisés continuent normalement.
