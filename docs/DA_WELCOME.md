# DA WELCOME — Scène d'entrée de l'application

La composition suit le modèle Home de [Zones MiniFugg](MINIFUGG_ZONES.md) et ses noms MARQUE, SCÈNE et ENTRER. Le contenu essentiel reste dans CENTRE ; HAUT et BAS absorbent uniquement les différences de hauteur.

## Périmètre

Appliquer `DA_CORE.md`. Ici, « Welcome » désigne l'arrivée dans **MiniFugg**, avant le feed. Ce n'est ni la jaquette d'un jeu, ni une page publicitaire, ni une deuxième version du feed.

L'expérience doit évoquer un écran d'entrée de jeu vidéo moderne : un lieu immédiatement identifiable, un téléphone tenu par le joueur, une invitation à entrer. Ne pas fabriquer une affiche fermée sans relation avec l'action suivante.

## Direction visuelle verrouillée

Employer un univers low-poly stylisé, chaleureux et lumineux selon la scène : formes simplifiées et facettées, silhouettes claires, matériaux mats, quelques sources lumineuses intentionnelles, personnages secondaires peu détaillés. Refuser le photoréalisme lifestyle, le rendu publicitaire de smartphone et la 3D générique brillante.

Le point de vue est celui du joueur. On voit son bras et sa main tenir le téléphone ; le téléphone ne flotte pas. La main, les personnes et l'environnement appartiennent au même univers graphique. Le cadrage doit ménager du calme : peu d'objets significatifs, pas un décor rempli pour démontrer la puissance du générateur.

La scène représente une situation de vie, pas l'inventaire du catalogue. Métro japonais contemporain, toilettes, café, attente, lit, bureau ou rendez-vous sont des contextes possibles. Une scène absurde peut être drôle sans devenir une accumulation de gags. Ne pas incorporer systématiquement tetrominos, dents, trains et documents pour représenter les jeux disponibles.

## Identité constante

Le logo MiniFugg reste exactement le même. Utiliser `BRAND_ASSETS.md`, sans le faire redessiner avec le décor. Fuggy doit être présent naturellement, parfois discret ou partiellement caché, sans devenir obligatoirement le personnage central.

Lire `FUGGY_MASCOT.md` et utiliser sa référence exacte pour toute nouvelle représentation. Conserver sa tête facettée claire, ses oreilles corail, son masque sombre et son langage d'yeux blancs. Ne pas transformer la mascotte en créature à dents, personnage inquiétant ou cartoon générique. Une nouvelle pose n'autorise pas une nouvelle identité.

## Le téléphone n'est pas un second jeu

Le contenu du téléphone est un élément graphique ou une petite animation de démarrage. Le traitement validé peut être repris tel quel ; ne pas le remplacer par une fausse cover interactive TetraMindFck ou une seconde interface sociale.

La chaîne est : **scène → activation du téléphone → rapprochement → véritable feed de covers**. Aucun écran de jeu intermédiaire, aucun second bouton Play obligatoire, aucune double cover et aucun débit de coin pour simplement entrer dans l'application.

Sur écran étendu, la scène de départ et la scène d'arrivée occupent le même viewport large dès le premier plan. Le décor du métro ne doit jamais rester enfermé dans un stage portrait avec des bandes latérales. Le téléphone et la main conservent leur propre repère portrait indépendant au-dessus du décor ; leur image ne doit pas être étirée pour remplir l'écran.

Le cadrage portrait validé reste une sous-partie exacte du décor large : on prolonge le wagon latéralement, surtout dans l'espace disponible à gauche, sans agrandir ni recadrer le garçon, Fuggy, le siège ou les portes. La même variante de bras et de téléphone traverse tout le raccord. Après le changement de pièce, son verre est évidé et le véritable viewport Core apparaît dans cette ouverture ; aucune seconde main ne doit remplacer la première.

Dans la scène métro retenue, Fuggy ne doit plus être assis sur le banc. Le point de vue doit identifier immédiatement le joueur comme assis et placer le lecteur en face de lui avec une posture crédible. Le bras visible est continu depuis le bord du cadre jusqu'au poignet. La composition large doit rester exploitable en trois plans séparables — premier plan du joueur, intérieur et passagers, extérieur par les fenêtres — afin de permettre un parallaxe à vitesses distinctes.

Le cadrage validé le 12 septembre 2026 avance la caméra de 20 % vers la banquette opposée. Sa source est `public/assets/generated/platform/concepts/metro-geometry-v2/06-camera-moins-20.png` et son dérivé runtime est `public/assets/generated/platform/entry-scenes/metro-sunset/camera-distance-20.webp`. La version 30 % reste une alternative de réglage ; elle ne remplace pas la valeur active sans nouvelle décision. Le même asset large est recadré sur les écrans complets.

La surface du téléphone doit suivre exactement son cadrage et sa perspective. Écran, bras et téléphone partagent les transformations utiles ; ne pas superposer un rectangle approximatif qui glisse séparément. Prévoir les occultations par la main, le cadre et les limites du zoom.

Pour le raccord vers l'écran étendu, mesurer les quatre coins du verre dans l'asset source et les projeter sur les quatre coins du verre final. La transformation doit redresser la perspective et fixer simultanément la taille et la position. Le raccord ne se règle pas avec une succession empirique de rotations et de zooms. À l'arrivée, CENTRE remplit la hauteur utile ; HAUT et BAS du MASTER se prolongent hors du viewport.

## Couches, mouvements et transition

Pour le métro, séparer les éléments selon leurs mouvements : décor extérieur qui défile, wagon, personnages/Fuggy lorsque nécessaire, bras et téléphone, contenu d'écran et éventuels effets de lumière. Reconstituer les zones cachées avant d'animer.

Le wagon peut trembler légèrement ; Fuggy assis et ses yeux suivent ce mouvement. Une expression temporaire remplace les yeux fixes au lieu de se dessiner dessus. Prévoir des pauses entre somnolence, réveil, regard et sourire exprimé uniquement par les yeux. Ne pas faire bouger tous les objets de manière indépendante.

La transition se valide en quelques états : repos, activation, approche, raccord avec le feed. Elle doit être brève, compréhensible et sans retour parasite au wagon après le raccord. Une lumière de transition n'est pas un cache-misère pour une destination non prête. Prévoir une alternative à mouvement réduit et un accès clavier approprié.

Conserver la composition centrale entre téléphone et desktop. Les prolongements de décor respectent les zones Home ; les espaces latéraux appartiennent à la composition Core validée et ne justifient pas une variante du téléphone. Choisir la réalisation canonique la plus légère qui préserve le résultat : couches raster pour une ambiance 2,5D simple, Three.js pour une vraie scène 3D.

Les scènes d'entrée animées peuvent partager entre elles un vocabulaire de réglages : taille, position, pivot, amplitude, vitesse, vibration, flottement, balancement et effets utiles. Les covers sont désormais statiques : ne pas leur imposer ce moteur et ne pas restaurer l'ancien FuggWelcome/Parallax Lab pour simuler une unification.

La musique d'ambiance et son passage vers le feed utilisent le Core Audio, sans lecteur ou contexte audio concurrent.

## Recherche, production et accès global

Une étude porte sur une scène précise ou son raccord. Montrer les états nécessaires à cette question, pas toute l'application, ses jeux et ses placeholders. Les scènes pourront varier et se débloquer ; le logo et la grammaire d'entrée restent stables. Ne pas inventer les seuils de déblocage.

Un accès futur au compte, aux favoris globaux ou aux réglages relève du Core. Ne pas l'ajouter arbitrairement au décor, dans Info jeu ou dans un coin interdit de la cover. Son placement nécessite une décision UI dédiée.

Préserver le travail parallèle sur la scène existante : lire les derniers fichiers avant toute modification. Les assets suivent `ASSET_PIPELINE.md`, les décisions sont enregistrées dans `PLATFORM_ENTRY_SCENES.md`, les références de marque dans leurs registres canoniques.

## Micro-brief à remplir

Remplir le modèle unique de [DA_CORE.md](DA_CORE.md#structure-obligatoire-du-micro-brief), y compris les textes autorisés. Ne pas inventer des enseignes dans le décor ou des labels sur une planche. Exemple de spécialisation :

> Produire [vue / couche / état de transition] de l'entrée MiniFugg dans [lieu]. Référence principale : [scène validée disponible] ; référence d'identité supplémentaire seulement si Fuggy doit être représenté. Low-poly [formes, matériaux mats, palette, lumière], composition [cadrage et zones calmes]. Préserver [bras/téléphone, identité et géométrie]. Le téléphone contient [graphisme de démarrage], pas un autre jeu ou feed. Sortie [format, alpha, couche]. Aucun catalogue de jeux, nouveau logo, réalisme photographique ou écran supplémentaire.
