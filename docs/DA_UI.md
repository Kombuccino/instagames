# DA UI — Interfaces partagées MiniFugg

Les écrans et masques Core emploient les noms de [Zones MiniFugg](MINIFUGG_ZONES.md). MONNAIE et JOUER restent dans le cadre horizontal de 390 unités ; RAIL reste à gauche sur CENTRE, y compris sur PC. GameOver et Ladder suivent leurs modèles dédiés. Le magazine de l'écran étendu suit aussi [DA Magazine](DA_MAGAZINE.md).

## Mission et références

Appliquer `DA_CORE.md`. Une nouvelle interface est d'abord un assemblage du système MiniFugg, pas une nouvelle DA. Ce contrat ne s'applique pas à la direction artistique interne des jeux.

Référence générale exacte :

`MiniFugg - Graphic Archive / Platform / Reference Boards / platform-ui-canonical-reference-user-supplied-2026-09-05.png`

Référence Cover + Info + Comments validée à 100 % :

`MiniFugg - Graphic Archive / Platform / Cover UI / Validated / platform-cover-info-comments-ui-validated-v2.png`

Pour ces trois surfaces, utiliser la deuxième référence ; la première explique la famille générale. Les corrections explicites ultérieures s'appliquent sans redessiner le reste. Ne pas utiliser une autre planche parce qu'elle contient un métro ou un jeu au nom familier. Une ancienne mention de « narrow side panel » n'autorise pas des demi-panneaux : Info et Comments sont des panneaux entiers.

## Langage graphique

Fond graphite, blanc légèrement chaud, gris secondaires, rouge rare et fonctionnel, or réservé aux coins et au badge 999. Surfaces plates et éditoriales, hiérarchie nette, espaces maîtrisés, peu de chrome. Les traits fins restent possibles lorsqu'ils structurent réellement ; ils ne séparent pas automatiquement toutes les lignes.

Pas de dashboard gaming néon, de glassmorphism généralisé, de cartes arrondies partout, de boutons brillants standards ou de baseline décorative en bas des panneaux. Ne pas réintroduire une grosse barre supérieure ou inférieure pour « finir » la composition.

L'expérience mobile centrale est complète. Elle garde sa géométrie lorsqu'elle est agrandie ; les éventuels sidecars desktop sont additionnels, jamais une raison de déplacer les contrôles centraux.

Sur l'expérience **écran étendu** décrite dans `PLATFORM_REDESIGN.md`, le sidecar devient une mise en scène éditoriale persistante : une une de magazine `MiniFugg Retro Gaming` fermée pendant environ 4–5 secondes, puis un magazine ouvert presque à plat à gauche du téléphone. Le téléphone reste au premier plan, à pratiquement toute la hauteur utile. Son verre fictif vise `390 × 884` et accueille le MASTER de jeu `390 × 844`, avec au plus un prolongement de fond hors des éléments critiques. Il n'a ni caméra, encoche, capteur, haut-parleur ni menton décoratif ; la main ne recouvre jamais la surface jouable.

Info, Comments et Leaderboard gardent leurs données, droits, états et actions canoniques. Sur écran étendu, ils deviennent trois rubriques dédiées dans une page de magazine unique et de taille fixe, accessibles directement par `FEATURE`, `COMMENTS`, `RANKING`. Le changement de rubrique ne modifie ni la taille, ni la perspective, ni la place du magazine. Ne jamais entasser les trois contenus dans la même vue.

Le langage éditorial combine des principes de presse vidéoludique des années 1990 : ton et humour français, hiérarchie forte et encarts explicatifs américains, densité maîtrisée, petites captures et repères colorés japonais. Il reste original, propre et cohérent entre les Fuggs. Aucun manuscrit, gribouillis, mascotte improvisée, papier sale, fausse usure, macaron Like ou marque-page Favori. Les trois familles de mise en page sont `FEATURE`, `COMMENTS` et `RANKING` ; une future rubrique `SPECIAL` pourra être étudiée séparément.

Cette exception de présentation ne s'applique pas à l'écran complet et ne duplique pas les composants métier. Les textes, commentaires, rangs, compteurs et états restent des composants HTML/CSS vivants posés sur les surfaces papier ; ils ne sont jamais cuits dans une image.

Sur écran complet, le joueur conserve les panneaux MiniFugg Info, Comments et Leaderboard. Ils partagent les données du jeu avec le magazine, mais ne deviennent pas un faux site Web éditorial. Cette continuité maintient le joueur dans l'application et dans le contexte du jeu. Voir `DA_MAGAZINE.md`.

La une est fixe : Fuggy canonique dans une pose amusante au sein du monde low-poly, avec des accroches courtes et drôles entièrement en anglais. Elle ne reprend aucun jeu, favori ou état du catalogue. Le masthead adapte le logo canonique uniquement par l'ajout séparé de `RETRO GAMING` ; ne pas régénérer ou redessiner le mot-symbole MiniFugg.

## Un système sémantique, pas un CSS par écran

Utiliser les tokens et primitives de `src/core/platformUi.css` décrits dans `PLATFORM_UI_SYSTEM.md`. Lire leur état réel avant d'intégrer ; ne pas inventer une deuxième échelle de tailles.

Les titres utilisent H1/H2/H3 ; les descriptions ordinaires, le body ; les métadonnées, le rôle meta ; les pseudos, le même rôle player-name partout. Les avatars, badges, onglets, listes, champs et actions proviennent également du système central.

**Description du jeu et description du développeur : même style descriptif. Pseudo dans Comments, Leaderboard ou petite fiche Creator : même traitement.** Un texte d'aide court peut avoir un rôle distinct d'une description longue si leurs usages doivent évoluer séparément ; cette distinction se documente centralement, elle ne justifie pas une copie par écran.

Créer une primitive seulement pour une différence réelle de fonction ou d'apparence validée. Le CSS local peut gérer une géométrie, une transition ou un comportement spécifique, pas réinventer la typographie et les identités. Les corrections remplacent les règles canoniques ; pas d'empilement de fichiers correctifs.

Les effets et CSS d'un jeu ne modifient jamais les panneaux Core. Réciproquement, le Core n'impose pas son style aux objets du jeu.

## Cover : overlay verrouillé

L'illustration occupe tout l'écran, sans bande noire de pied. Le solde de coins reste en haut à droite, avec les pièces pixellisées communes.

À gauche : Info, Like, Comments, Bookmark, Share, directement sur l'image. Aucun fond noir, cercle, pilule ou dock sous les icônes. Like, Comments et Bookmark portent un petit compteur dessous : nombres jusqu'à 9 999, puis `10k`. Le cœur actif est un seul cœur coloré propre, jamais deux icônes superposées. Le favori actif reste lisible et discret ; Share ne doit pas ressembler à un simple upload.

Le CTA est un cartouche léger : `INSERT COIN x2`, deux pièces superposées horizontalement après `x2`, puis `>>`, sur une ligne. Respecter l'ordre de superposition de la référence. Bêta : `INSERT COIN x1` et une pièce. Caca : accès gratuit. Texte neutre lisible sur des covers très différentes, animation d'invitation mesurée.

`CHANGE GAME` reste petit, distinct du CTA, en bas à gauche. Ni `SWIPE TO PLAY`, ni logo/bouton système en bas à droite, ni gros logo MiniFugg en overlay. La petite signature intégrée à l'illustration reste possible.

## Info : panneau entier et scrollable

Conserver les onglets Info/Comments dans la même famille. L'ordre est : sélection des covers ; titre et créateur ; description ; version et dernière mise à jour ; high score personnel et accès au leaderboard ; règles ; section créateur.

La cover active doit être évidente. Les autres covers débloquées sont sélectionnables ; les verrouillées utilisent gris/pixellisation pour garder la surprise. Pendant l’Alpha publique, toutes les variantes réellement disponibles dans le catalogue sont débloquées et sélectionnables ; ne pas inventer de variantes absentes.

Ne pas placer de logo ou vignette devant le titre du jeu. La date de création est facultative lorsqu'elle existe. La ligne `version · dernière mise à jour` est obligatoire et vient des métadonnées réelles du jeu : version livrée et date/heure Europe/Paris de cette livraison. Elle ne peut jamais être une valeur générique écrite dans le composant. Le changelog lié doit permettre de retrouver les évolutions de cette version. Aucun Difficulty, Tags, Avg. Session, Platforms ou filtre de catalogue non demandé.

La section créateur contient nom, description, lien éventuel, nombre de jeux et grille de ses jeux. Afficher les vingt premiers, puis permettre les vingt suivants. La page peut dépasser la hauteur du viewport ; ne pas compresser tout son contenu pour le faire tenir sur une image.

## Comments : conversations, pas tableau

Panneau entier avec scroll, réponses imbriquées et compositeur compact. Pas de traits horizontaux entre chaque commentaire. Réaction par petit cœur monochrome, secondaire ; menu `...` pour les actions de signalement.

Les réponses du créateur se distinguent avec le badge Creator. Le badge des membres concernés est **999**, pas Paid ou Fugg+. Les avatars gratuits restent simples ; ceux des créateurs et des 999 peuvent être plus travaillés. Le pseudo ne change pas de style pour autant.

Les identités et badges reflètent de vrais droits, pas une supposition à partir d'un pseudo. Dans une maquette, des données fictives identifiées sont possibles ; elles ne deviennent jamais de faux commentaires ou de faux membres en production.

## Leaderboard et navigation

Même panneau et mêmes lignes d'identité que le reste. Onglets `DAY / WEEK / FRIENDS`, texte centré et petit trait rouge centré sous l'onglet actif. Les états indisponibles doivent être explicites si une fonction n'est pas encore raccordée.

Scroll jusqu'aux cent premiers, sans séparateurs horizontaux entre joueurs. Mettre discrètement en avant le joueur courant. Sa ligne épinglée apparaît seulement lorsque sa vraie ligne n'est pas visible ; hors Top 100, elle nécessite un rang réellement disponible.

La flèche revient au contexte d'origine : Info avec son scroll, ou Game Over. Pas de retour « Social » inventé, pas de tagline en bas.

## Gameplay shell et Game Over

Pendant le jeu : presque tout l'écran appartient au gameplay. Garder uniquement le petit contrôle Core de retour/fermeture vers la même cover. Pas de gros header, rail social ou compteur de coins permanent.

À la fin : conserver le gameplay figé, légèrement assombri, derrière le résultat. **Aucun morceau de cover ni logo MiniFugg.** Score, meilleur score, classement disponible, leaderboard, replay au coût réel et `RAGE QUIT`.

`TOP 5`, `TOP 46` ou `> TOP 100` ne s'affichent que si la donnée existe et correspond au score/périmètre annoncé. Ne pas inventer un rang pour remplir la maquette intégrée. Replay reprend le vocabulaire du cartouche à coins, pas un bouton mobile générique.

## Livrables et micro-brief

Produire les maquettes UI en PNG. Les implémenter ensuite comme vrais composants React/HTML/CSS avec textes traduisibles et états interactifs ; une image de maquette n'est pas une interface fonctionnelle. Prévoir focus, état pressé, sélection, indisponibilité, chargement, vide et erreur selon le composant.

> Produire uniquement [panneau/composant] dans l'état [état]. Référence exacte disponible : [image validée pertinente]. Reprendre ses typographies, espacements, couleurs et primitives. Contenu et ordre : [contenu demandé]. Modifier seulement [delta]. Panneau [entier / composant isolé selon la demande]. Ne pas redessiner la cover, le logo, les autres écrans ou le gameplay. Aucun placeholder de jeu étranger au besoin. Sortie PNG ; signaler les données d'exemple.

Pour l'intégration, consulter aussi `PLATFORM_UI_SYSTEM.md`, `PLATFORM_VISUAL_VALIDATION.md`, `GAMEPLAY_SHELL.md`, `DISCOVERY_NAVIGATION.md` et `PLATFORM_ECONOMY.md`. Les données produit et comportements réels restent leurs responsabilités.
