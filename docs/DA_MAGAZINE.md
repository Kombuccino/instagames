# DA Magazine — MiniFugg Retro Gaming

Mis à jour le 8 septembre 2026. Ce document est l'autorité visuelle et éditoriale du magazine affiché dans l'expérience écran étendu. Il complète `DA_CORE.md` et `DA_UI.md`. Aucun nouveau modèle de page ou artwork de magazine ne doit être produit avant d'en respecter les règles.

## Intention

Le magazine doit donner envie de lire et de feuilleter. C'est un exemplaire neuf, propre, désirable, posé devant le joueur. Il traduit les données Core du Fugg actif dans le langage d'un grand magazine de jeux vidéo des années 1990, sans copier un titre existant. Le magazine physique appartient au monde low-poly de la chambre : pages facettées, pli et tranche simplifiés, arêtes légèrement chanfreinées et éclairage par plans. Une texture de papier photoréaliste posée dans un décor low-poly est insuffisante.

La grammaire peut puiser dans trois familles :

- France : ton éditorial, humour, titres vivants et personnalité de la rédaction ;
- États-Unis : rubriques immédiatement identifiables, encarts utiles, hiérarchie forte et place donnée aux scores ;
- Japon : densité maîtrisée, petites captures, repères colorés et informations compactes.

Le résultat reste MiniFugg : net, composé, tactile et lisible. Les différences entre ces influences passent par la grille, la couleur, les cadres et la hiérarchie typographique, jamais par une accumulation décorative.

Corpus de recherche initial, à employer pour analyser les principes et non pour copier des pages : archives françaises Joystick/Génération 4 sur `abandonware-magazines.org`, GamePro et Nintendo Power sur `retromags.com`, scans Famitsu/Dengeki de 1995 recensés sur `virtual-boy.com`. Avant la DA finale, constituer un board resserré de pages précises avec les raisons de chaque sélection.

## Refus absolus

- aucun gribouillis, zigouigoui, étoile dessinée, flèche manuscrite ou commentaire écrit à la main ;
- aucune fausse écriture spontanée de générateur d'images ;
- aucun papier jauni, taché, déchiré, froissé, moisi ou excessivement usé ;
- aucune mascotte improvisée ou petit dessin destiné à combler un vide ;
- aucun faux logo de jeu : dans l'article, le nom du jeu est composé avec la typographie du magazine ; une jaquette reproduite emploie son asset approuvé sans le redessiner ;
- aucun texte produit dans un raster, sauf logo de jeu approuvé déjà rasterisé ;
- aucun grand artwork qui prive les informations de leur place ;
- aucun contenu figé qui empêcherait traduction, mise à jour ou données propres au joueur.

## Objet et matière

Le magazine paraît neuf ou très récemment ouvert. Papier blanc chaud propre, impression nette, aplats francs, photos/captures propres, ombres de pli discrètes et reflet léger possible. La tranche, les pages et le pli central donnent la sensation physique. L'âge vient du langage graphique de l'époque, pas de salissures artificielles.

Les caractères proviennent de familles typographiques normales et plausibles pour la presse de l'époque : grotesques condensées pour les grands titres, sans sérif nette pour le corps, sérif éventuelle pour une citation. Toutes les fontes doivent être réellement licenciées et intégrables sur le Web. Aucun faux manuscrit.

## Architecture dynamique

Le magazine est un habillage React/HTML/CSS des données Core. Les textures de papier, cadres non textuels et ombres peuvent être rasterisées. Titres, paragraphes, règles, versions, créateurs, commentaires, scores, dates, badges, compteurs, légendes et états sont du texte vivant.

La langue éditoriale du magazine est l'anglais. Les données restent localisables pour de futurs usages, mais la page écran étendu est composée en anglais. Ne jamais réduire la police jusqu'à l'illisibilité pour conserver une image de référence.

## Gabarit physique retenu

Une seule page active est visible. Le reste du magazine est replié dessous ; son bord forme un rouleau plus rond qui révèle un fragment reconnaissable de la cover approuvée du jeu. `FEATURE`, `COMMENTS` et `RANKING` remplacent le contenu dans ce même rectangle. Les trois états conservent exactement largeur, hauteur, angle et perspective. Aucun classement ne déplie une deuxième page.

Le changement de Fugg ne déplace jamais le bureau, le téléphone, la main ou le magazine. La cover est remplacée dans l'écran fixe pendant que la page du magazine tourne. Seules l'ancienne et la nouvelle page existent pendant cette courte transition. Une fois le gameplay lancé, la molette, la navigation des jeux et `CHANGE GAME` sont suspendus jusqu'au retour à la Cover.

Trois onglets physiques donnent un accès direct aux rubriques :

- `FEATURE` ;
- `COMMENTS` ;
- `RANKING`.

Ils restent assez grands et contrastés pour être compris et actionnés. Leur position exacte sera validée sur un blockout fonctionnel. Le tourné de page est court et peut être désactivé avec la réduction de mouvement.

## Une fixe

La couverture de `MiniFugg Retro Gaming` est une illustration fixe et réutilisée à chaque entrée. Elle ne dépend plus du jeu actif, des favoris ou du catalogue. Fuggy en est le sujet principal, dans une pose amusante fondée sur sa référence canonique et dans le même monde low-poly que la chambre, la main et la scène d'entrée.

Le masthead réemploie le logo MiniFugg canonique avec `RETRO GAMING` comme qualificatif séparé. Les accroches de couverture sont courtes, drôles et entièrement en anglais. Une fois validée, cette une est figée. Elle ne contient ni Like, ni Favori, ni information dynamique.

## Feature — modèle minimal

La Feature présente le jeu à partir d'un modèle volontairement court. Ce modèle doit rester viable pour 1, 10 ou 100 jeux sans création d'une page raster par jeu.

Contenu obligatoire :

1. nom du jeu recomposé avec la typographie éditoriale du magazine ;
2. titre éditorial ou baseline courte ;
3. description courte, issue des métadonnées réelles du jeu ;
4. une capture éditoriale compacte prise dans le jeu réel et dans un état `showcase` reproductible ;
5. version, première sortie si elle est connue et dernière mise à jour ;
6. un bloc `HOW TO PLAY` sous forme de trois puces courtes au maximum.

Contenu facultatif : un seul détail visuel issu d'un asset officiel existant, ou une petite reproduction d'une jaquette approuvée ; une citation éditoriale originale et non signée. Les règles complètes restent dans le panneau Info du Core et ne sont pas une obligation du magazine.

La page gauche est d'abord éditoriale : le texte et sa hiérarchie occupent une place réelle. La capture ne dépasse pas environ un quart de page et ne devient jamais le sujet dominant. Elle montre une partie déjà engagée : plateau nourri, mécanique principale lisible et, si possible, un effet caractéristique. Une capture prise dans les premières secondes ou un état presque vide est rejeté. La page ne devient jamais une galerie. Aucun encart décoratif sans source réelle, comme une fausse planète ou une fausse interface, n'est autorisé.

La note, le verdict humoristique et le meilleur score sont retirés de la Feature. Ne pas les inventer pour remplir la page. Les scores appartiennent à la rubrique Ranking et aux interfaces Core prévues pour eux.

## Commentaires

La page donne la place aux conversations : commentaires, réponses, réactions, badges et réponse du créateur. Les blocs sont sobres et typographiques. La variété vient de leur taille, de leur ordre, de la couleur des rubriques et de quelques citations mises en avant, jamais d'annotations manuscrites.

Le composant reste capable de paginer ou défiler lorsqu'il y a davantage de contenu. Les règles d'identité et de modération restent celles de `DA_UI.md`.

## Classement

Le Classement emploie la même page fixe que Feature et Comments. C'est la rubrique la plus structurée : podium ou tête de classement, périodes et joueur courant épinglé lorsque nécessaire. Il peut paginer ou défiler sans modifier les dimensions du magazine et conserve les mêmes données et règles de confiance.

Les colonnes, drapeaux éventuels, rangs et variations sont des composants dynamiques. Les commentaires décoratifs manuscrits sont interdits. Une seule petite capture de jeu ou un motif officiel peut accompagner la page si la place le permet.

## Données propres à chaque jeu

Chaque Fugg final fournit au magazine :

- un titre et une baseline ;
- une description courte ;
- une capture compacte du gameplay réel dans un état `showcase` défini ;
- sa version, sa date de première sortie si elle est connue et sa date de mise à jour ;
- facultativement, un détail provenant d'un asset officiel déjà présent.

Le pipeline de livraison du jeu doit déclarer un seed et une commande ou un état de démonstration qui produisent la capture `showcase`. Cet état n'altère ni les règles ni les sauvegardes. La capture est vérifiée, optimisée selon `ASSET_PIPELINE.md` et déclarée dans le manifeste. Une valeur inconnue reste absente ou affiche un libellé explicite comme `NOT PUBLISHED`; elle n'est jamais inventée. Ne pas demander une nouvelle illustration décorative lorsque la capture et les assets existants suffisent.

## Écran complet

Sur téléphone, PWA ou fenêtre étroite, aucun magazine physique, décor de chambre ou faux site Web éditorial n'est affiché. Le joueur reste dans les panneaux MiniFugg existants : Info, Comments et Leaderboard. Leur contenu peut partager les mêmes données que la Feature, mais leur navigation et leur identité visuelle restent celles du Core. Cette continuité évite de donner l'impression d'avoir quitté le jeu.

Le Game Over relève également du Core. Il doit recevoir un template MiniFugg dédié fondé sur `DA_UI.md`; les cartes arrondies génériques et l'esthétique d'assistant ou de tableau de bord sont rejetées.

## Téléphone et main

Le téléphone est un support fictif dédié au jeu. Son verre utile conserve la largeur logique de `390`. Dans la Home bis alpha, sa surface active reprend directement le MASTER `390 × 844`, occupe 95 % de la hauteur PC disponible et utilise toute la largeur correspondante. Cette géométrie légèrement plus large remplace le premier essai `390 × 884` tant que la scène étendue reste en validation. Il n'y a ni caméra, ni encoche, ni capteur, ni haut-parleur, ni menton. Le cadre reste très fin.

Dans l'état `FEATURE`, le téléphone affiche la Cover active avec l'overlay Core complet : MONNAIE, RAIL, JOUER et CHANGE GAME. Il ne duplique pas la capture de gameplay du magazine. Lorsque le joueur lance la partie, le téléphone passe au gameplay et le magazine peut rester ouvert sans répéter l'image jouée en direct.

La main et le bras proviennent du modèle low-poly existant `public/assets/imported/platform/entry-scenes/metro-moment-v1/arms/arm-01.png`. Ne pas inventer une main réaliste ou un nouveau modèle. Une dérivation peut retirer les caméras du téléphone et ajuster le cadre, mais elle conserve la géométrie, les facettes, la peau pêche, les ongles mauves, la manche lavande et la prise à cinq doigts. Aucun doigt ne recouvre la zone jouable.

## Ordre de production

1. créer une seule coque low-poly : chambre discrète, bureau, magazine, pages, ombres, téléphone et main canonique ;
2. poser par-dessus un composant HTML/CSS unique avec grille, fontes, onglets et données vivantes ;
3. ajouter au schéma du jeu les six champs obligatoires et la capture reproductible ;
4. vérifier TetraMindFck, Vlad et LineFugg comme jeux de référence, avec les trois rubriques strictement identiques en dimensions et perspective ;
5. tester les trois rubriques avec données extrêmes ;
6. vérifier l'accessibilité et la réduction de mouvement.

À l'échelle d'un jeu, la rédaction des données et le choix de la capture sont manuels. À dix jeux, un validateur signale les champs et captures manquants. À cent jeux, une route de capture déterministe produit automatiquement l'image à partir d'un seed et d'un état déclarés ; l'humain ne valide plus que le cadrage et les exceptions. Le magazine complet n'est jamais généré ou peint jeu par jeu.

Les concepts raster v3 du 8 septembre 2026 valident certaines idées de composition, mais leur style de page est rejeté : annotations manuscrites, dessins de remplissage, papier sale et faux logo ne doivent pas être repris. `room-magazine-dossier-clean-concept-v4.png` est également rejeté : il abandonne le monde et la main low-poly, ressemble à une publicité américaine, manque d'article éditorial et conserve Like/Favori. `room-magazine-dossier-lowpoly-concept-v5.png` conserve une composition utile mais le magazine reste trop réaliste. `mobile-webzine-dossier-concept-v1.png` est rejeté : il ressemble trop à un site contemporain et rompt la continuité avec les panneaux du jeu. Les v6 révèlent trois défauts : pages inégales, capture trop grande et gameplay dupliqué dans le téléphone. Les v7 corrigent ces points. La v8 Tetra valide la page unique ; son classement dépliant est rejeté. La v9 renforce les facettes et le rouleau révélant la cover. La Home bis traduit ce principe en texte vivant et garantit par test des dimensions identiques entre jeux et rubriques.

## Pilote de coque de production — 12 septembre 2026

Une première coque réelle remplace le décor CSS provisoire dans la route `lab=home-bis` : chambre et bureau low-poly opaques, magazine physique propre et vide, page React dynamique, téléphone jouable et dérivation transparente de la main canonique à cinq doigts. Les sources PNG sont conservées avec des dérivés WebP lossless utilisés au runtime.

Cette passe est **intégrée et testée, mais pas encore acceptée artistiquement par l'utilisateur**. Elle sert à décider rapidement si l'expérience étendue mérite une production complète. Le passage Cover → gameplay ne doit jamais faire défiler ou déplacer la scène ; le conteneur utilise `overflow: clip` pour empêcher le recentrage automatique du navigateur sur les contrôles internes. À `1024 × 768`, l'expérience reste utilisable mais devient dense : ce format constitue la limite actuelle du mode étendu et ne valide pas encore son breakpoint définitif.
