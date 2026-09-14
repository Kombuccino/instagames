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

Sur l'expérience **écran étendu** décrite dans `PLATFORM_REDESIGN.md`, le sidecar devient une mise en scène éditoriale persistante : une une de magazine `MiniFugg Retro Gaming` fermée pendant environ 4–5 secondes, puis un magazine ouvert presque à plat à gauche du téléphone. Le téléphone reste au premier plan à 95 % de la hauteur utile. Son verre fictif reprend directement le MASTER `390 × 844`. Il n'a ni caméra, encoche, capteur, haut-parleur ni menton décoratif ; la main ne recouvre jamais la surface jouable.

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

L’illustration occupe tout l’écran, sans bande noire de pied. Le solde de coins reste en haut à droite. La direction retenue le 12 septembre 2026 est la troisième recherche : une monnaie pleine en métal doré, ronde à pourtour polygonal « faux low-poly », portant un grand `1` et la tête complète de Fuggy intégrée au bas-relief. Les oreilles sortent réellement du crâne et y sont raccordées par les mêmes facettes ; elles ne flottent pas autour de la pièce et ne deviennent pas deux grandes pointes décoratives. Aucun noir, trou, émail, insert coloré ou autre matière n’est ajouté : le dessin vient uniquement du bas-relief, de la frappe, de la gravure, du ciselage et des changements de plan du même métal. Ce même dessin possède deux assets transparents dédiés : une version volumique détaillée pour les animations vers le monnayeur et une version simplifiée, frontale et renforcée pour le compteur à `22–24 px`.

À gauche : Info, Like, Comments, Bookmark, Share, directement sur l'image. Aucun fond noir, cercle, pilule ou dock sous les icônes. Like, Comments et Bookmark portent un petit compteur dessous : nombres jusqu'à 9 999, puis `10k`. Le cœur actif est un seul cœur coloré propre, jamais deux icônes superposées. Le favori actif reste lisible et discret ; Share ne doit pas ressembler à un simple upload.

La cible JOUER est un petit ensemble de monnayeur physique enchâssé bord à bord dans le bas de l’interface, et non un module flottant posé sur la cover. La recherche du 12 septembre 2026 teste désormais une hiérarchie plus directe : bouton principal rétroéclairé au centre, portant éventuellement le seul mot `PLAY`, puis prix `x2 COINS` toujours à droite et directement associé à la fente verticale. Le libellé `1 PLAY` n’est plus requis dans ces essais. Le bouton doit lire comme un vrai poussoir de borne ou de flipper 1980–1990 : capot translucide, petite ampoule visible ou suggérée dans la matière, halo interne lent, course et ombre de contact crédibles. Le mécanisme conserve un relief court, des pièces moulées, des joints, vis et traces d’usage modérées ; il ne devient ni une carte d’application moderne ni une extrusion spectaculaire. Un seul clic l’enfonce puis le relâche et déclenche successivement l’entrée de deux pièces. Chaque passage produit son propre son métallique de monnayeur et un `-1` fugitif près du compteur en haut à droite. Une anomalie rare peut faire ressortir trois ou quatre pièces et créditer réellement la différence ; l’effet reste une surprise, sans libellé `BUG`. Le son passe par le bus UI du Core. Bêta adapte le coût réel à une pièce. Caca reste gratuit.

La navigation entre jeux ne reprend plus `CHANGE GAME`. Elle occupe la partie gauche de la console basse avec deux boutons rectangulaires superposés : flèche vers le haut + `PREV GAME`, puis flèche vers le bas + `NEXT GAME`, conformément au défilement vertical du feed. Cette géométrie, son intégration au pied de l’écran et ses libellés la distinguent du RAIL social, qui reste une colonne d’icônes blanches directement posées sur la cover. Ni flèches gauche/droite, ni `SWIPE TO PLAY`, ni logo/bouton système en bas à droite, ni gros logo MiniFugg en overlay. La petite signature intégrée à l'illustration reste possible.

La passe exploratoire industrielle du 12 septembre 2026 compare six familles 1980–1990 en conservant cette organisation : pinball noir/ambre, candy cabinet ivoire/rouge, borne européenne bordeaux à bouton carré, coque technique translucide fumée, borne familiale bleu nuit et façade graphite à large touche rectangulaire. L’utilisateur retient la sixième comme base de développement : façade graphite et gris chaud, filet rouge, grand bouton `PLAY` rectangulaire rétroéclairé, prix ivoire et fente à droite. Les originaux de recherche restent sous `artifacts/coin-controls-2026-09-12/industrial-panel-exploration/` ; leur damier peint les exclut de l’intégration.

La passe d’états suivante développe cette base et deux alternatives demandées, faux low-poly et pixel art 16-bit, dans `artifacts/coin-controls-2026-09-12/control-panel-states/`. Chaque famille possède six PNG transparents indépendants : `play-idle`, `play-glow-medium`, `play-glow-peak`, `play-pressed`, `prev-pressed` et `next-pressed`, plus une planche transparente et une prévisualisation WebP animée. La boucle proposée monte lentement de repos à halo moyen puis fort, redescend, et réserve une course brève à l’appui ; elle évite le clignotement d’alarme. Les boutons de navigation ne pulsent pas et signalent l’activation par une course courte et une ombre comprimée. Les fichiers ont un alpha réel après extraction sur fond vert et passent le contrôle technique ; ce sont encore des recherches d’états à valider visuellement, pas des assets runtime intégrés.

Après retour utilisateur, la famille 90s devient la direction préférée et le panneau complet animé est rejeté parce que sa géométrie bouge entre les images. La passe corrective `artifacts/coin-controls-2026-09-12/control-panel-production-study/` sépare donc coque fixe, capot `PLAY`, touches `PREV GAME`/`NEXT GAME`, bouton Core de retour/fermeture, compteur sans valeur imprimée, et quatre orientations de la pièce. Seuls les poussoirs changent de profondeur ; la coque, les vis, le prix et la fente restent immobiles. Le premier pictogramme abstrait de retour est rejeté comme incompréhensible ; la correction en haut à gauche utilise une grande flèche vers la gauche et le mot `EXIT`, avec repos, focus et enfoncement. Le compteur, en haut à droite des covers seulement, garde la pièce Fuggy à gauche et une fenêtre noire où Core dessine le solde vivant.

La séquence où une pièce descendait du compteur jusqu’à la fente est explicitement rejetée. Le compteur et le monnayeur produisent deux signaux synchronisés mais spatialement séparés : juste sous le compteur, un premier `-1`, puis un second ; en bas, deux grandes pièces apparaissent seulement juste au-dessus de la fente, tournent rapidement de face vers la tranche et disparaissent derrière son masque. Chaque disparition déclenche son `cling` et le décrément réel ; la seconde suit environ 180 ms plus tard. La restitution rare reprend uniquement cette petite trajectoire locale en sens inverse. La première intégration runtime du 12 septembre 2026 reprend ce découpage : façade fixe sur toute la largeur réelle du cadre, compteur HTML vivant, deux trajectoires locales et deux sons UI. Dans le feed principal, MONNAIE et JOUER appartiennent à une couche Core fixe unique : les covers et leur RAIL défilent verticalement en dessous, sans déplacer ni recréer visuellement la console ou le compteur. Le mode embarqué reste distinct pour les maquettes qui affichent réellement le Core dans un téléphone. Les contrôles se calent sur les cavités visibles du châssis `2099 × 534`, jamais sur le simple rectangle opaque de leurs PNG : PREV/NEXT sont recentrés dans leurs deux logements et PLAY remplit symétriquement le logement central. PLAY utilise un unique tileset horizontal à quatre cellules rigoureusement identiques — repos, halo moyen, halo fort, enfoncé — dérivées d’un même capot de référence. Les trois cellules lumineuses sont recadrées dans des calques parfaitement superposés, sans interpolation de la position du tileset. L’asset nommé `play-idle` montre encore l’ampoule à faible intensité : l’état de repos runtime lui applique donc un étalonnage ambre sombre, sans halo, qui conserve le capot et le mot `PLAY` lisibles dans leur logement. Il ne devient ni noir plein ni invisible et n’introduit pas un cinquième dessin susceptible de se désaligner. Le bouton reste allumé environ 70 % du cycle et éteint environ 30 % ; l’allumage est direct et l’extinction prend environ 48 ms, sans respiration progressive. Au clic, seul l’assemblage du capot descend brièvement dans son logement et se comprime très légèrement avant un retour amorti ; la boîte, le cadre, le texte, la console et le compteur restent immobiles. Toute limite interne à 390 px est supprimée et la console suit l’échelle du cadre Core sur mobile comme sur PC. Cette intégration ne doit jamais changer l’échelle des covers : les affiches gardent leur cadrage `cover` validé et remplissent le cadre ; la console peut recouvrir uniquement leur BAS sacrifiable.

La correction de tempo du 13 septembre 2026 remplace la répartition précédente du cycle : le bouton reste désormais allumé environ `1,5 s`, puis éteint environ `0,5 s`, dans une boucle totale de `2 s`. Les transitions validées restent brèves, environ `48 ms` chacune ; les deux rendus, l’alignement et la course mécanique ne changent pas.

La correction des pièces du 13 septembre 2026 remplace la rotation saccadée en quatre images : chaque insertion utilise une unique pièce dorée lisible en trois-quarts, qui apparaît déjà à proximité immédiate de la fente. Elle glisse horizontalement sur une courte course et disparaît progressivement derrière le masque de la fente ; aucun chiffre flottant sur la pièce, trajet depuis le compteur ou changement d’orientation par frames n’est affiché.

La validation du 14 septembre 2026 remplace toutes les recherches de monnaie antérieures par une référence canonique unique : `public/assets/generated/platform/ui/coin-console-90s/sources/coin-fuggy-user-reference.png`, nettoyée sans redessin dans `masters/coin-fuggy-reference.png`. C’est une pièce ronde en or facetté, portant la tête géométrique de Fuggy au centre, `IN FUGG WE THRUST` sur l’arc supérieur, `1 FUGGY` et `2026` en partie basse. Ce dessin exact doit être repris partout ; aucun générateur ne doit en improviser une variante. Le compteur et les petits badges utilisent sa dérivée frontale lossless ; le monnayeur utilise une dérivée mécanique en trois-quarts calculée depuis le même master. Les tailles de référence dans le Core sont `20 px`, `14 px` pour les badges compacts, environ `27 × 31 px` dans le logement du compteur à la largeur logique `390`, et une cellule transparente `96 × 96 px` pour l’insertion locale.

Le solde numérique du compteur est fixé à `22 px` sur téléphone comme sur PC. Il ne suit pas la largeur du cadre et ne doit plus être réduit par une unité `cqw` ou une règle mobile.

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

Pendant le jeu : presque tout l'écran appartient au gameplay. Garder le petit contrôle Core de retour/fermeture vers la même cover. Une expérimentation mobile du 13 septembre 2026 ajoute juste à côté un second contrôle de même taille pour demander ou quitter le plein écran natif du navigateur. Il reste désactivé lorsque l'API n'est pas disponible ; quitter le jeu quitte aussi le plein écran. Pas de gros header, rail social ou compteur de coins permanent.

À la fin : conserver le gameplay figé, légèrement assombri, derrière le résultat. **Aucun morceau de cover ni logo MiniFugg.** Score, meilleur score, classement disponible, leaderboard, replay au coût réel et `RAGE QUIT`.

`TOP 5`, `TOP 46` ou `> TOP 100` ne s'affichent que si la donnée existe et correspond au score/périmètre annoncé. Ne pas inventer un rang pour remplir la maquette intégrée. Replay reprend le vocabulaire du cartouche à coins, pas un bouton mobile générique.

## Livrables et micro-brief

Produire les maquettes UI en PNG. Les implémenter ensuite comme vrais composants React/HTML/CSS avec textes traduisibles et états interactifs ; une image de maquette n'est pas une interface fonctionnelle. Prévoir focus, état pressé, sélection, indisponibilité, chargement, vide et erreur selon le composant.

> Produire uniquement [panneau/composant] dans l'état [état]. Référence exacte disponible : [image validée pertinente]. Reprendre ses typographies, espacements, couleurs et primitives. Contenu et ordre : [contenu demandé]. Modifier seulement [delta]. Panneau [entier / composant isolé selon la demande]. Ne pas redessiner la cover, le logo, les autres écrans ou le gameplay. Aucun placeholder de jeu étranger au besoin. Sortie PNG ; signaler les données d'exemple.

Pour l'intégration, consulter aussi `PLATFORM_UI_SYSTEM.md`, `PLATFORM_VISUAL_VALIDATION.md`, `GAMEPLAY_SHELL.md`, `DISCOVERY_NAVIGATION.md` et `PLATFORM_ECONOMY.md`. Les données produit et comportements réels restent leurs responsabilités.
