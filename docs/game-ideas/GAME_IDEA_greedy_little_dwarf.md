# GAME IDEA — Greedy Little Dwarf

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Greedy Little Dwarf  
> **Genre:** Tiny 3D city-builder / colony sim / emergent disaster management  
> **Format:** Portrait  
> **Tech:** Genuine lightweight 3D → Three.js; voxel/block world, very small scale

## 1. Concept d'origine

Le joueur gère une petite colonie de nains extrêmement avides. Tout l'univers est construit en minuscules cubes, comme un mini-Minecraft très dense, vu en 3D/isométrie.

Le joueur ne creuse pas lui-même. Les nains creusent automatiquement parce qu'ils ne peuvent pas s'en empêcher : ils cherchent sans cesse or, minerais et ressources sous la colonie.

À la surface, le joueur doit construire les éléments nécessaires à leur survie et à leur développement : maisons, ateliers, bâtiments de production, stockage, etc. Il choisit un bâtiment dans une liste puis son emplacement. Les nains préparent le terrain, vont chercher les ressources nécessaires s'il en manque, puis construisent.

Le problème est que les mêmes nains continuent à miner sous tout ce qui existe. Ils peuvent creuser sous une maison, enlever des blocs porteurs ou créer des poches de terrain suspendues. Cela finit par provoquer des effondrements qui peuvent :

- tuer des nains ;
- ensevelir des galeries ;
- détruire les bâtiments de surface ;
- forcer la colonie à reconstruire ce qu'elle vient elle-même de saboter.

Le joueur doit donc réussir à faire croître la population et l'économie suffisamment vite pour absorber les morts, les accidents et les reconstructions provoqués par la cupidité permanente des nains.

L'idée centrale est : **avoir toujours plus de nains et de capacité de reconstruction que de trous catastrophiques.**

## 2. Pitch

**Construisez une brillante civilisation naine au-dessus d'une mine creusée par des idiots incapables d'arrêter de chercher de l'or.**

Greedy Little Dwarf est un city-builder miniature où la ressource qui permet de progresser est aussi celle qui détruit progressivement les fondations de la colonie.

## 3. Boucle de gameplay

1. Les nains minent automatiquement autour et sous la colonie.
2. Les minerais récupérés alimentent les stocks.
3. Le joueur choisit quoi construire et où le placer en surface.
4. Les nains nivellent le terrain, transportent les ressources puis construisent.
5. La population augmente si les besoins essentiels sont satisfaits.
6. Les galeries s'étendent et fragilisent peu à peu certains volumes de terrain.
7. Des effondrements détruisent des blocs, tuent éventuellement des nains et endommagent la surface.
8. Le joueur reconstruit, développe la colonie et essaye de maintenir une croissance positive malgré le chaos.

Le jeu doit produire des petites catastrophes émergentes compréhensibles : « ils ont creusé sous la forge, la forge est tombée, trois nains sont morts, et maintenant les survivants reconstruisent la forge avec le minerai qui a causé l'accident ».

## 4. Game design

### Nains
- Mineurs autonomes, avides et volontairement un peu stupides.
- Ils cherchent en priorité les blocs ayant de la valeur autour d'eux.
- Ils transportent aussi les ressources et construisent les bâtiments demandés.
- Pas de contrôle individuel permanent du joueur : leur bêtise doit rester une contrainte du système.

### Terrain / stabilité
- Monde voxel très petit : terre, pierre, minerai, vide.
- Pas besoin d'une vraie simulation physique complexe.
- Chaque bloc peut avoir un support simple : relié au sol / à une masse stable ou non.
- Une zone trop peu soutenue déclenche un effondrement local par grappes de blocs.
- Les bâtiments posés sur des blocs instables peuvent être endommagés ou détruits.

### Construction
Le joueur choisit un bâtiment puis un emplacement. Les nains :
1. aplanissent localement le terrain ;
2. vérifient les stocks ;
3. vont chercher ce qui manque ;
4. transportent les ressources ;
5. construisent.

Bâtiments de base possibles : maison, réserve, atelier, infirmerie, taverne, forge.

### Économie / survie
- Plus de population = plus de mineurs + plus de constructeurs, mais aussi plus de besoins.
- Les accidents doivent être fréquents mais rarement immédiatement fatals à toute la colonie.
- La partie se perd lorsque la colonie n'a plus assez de population ou de capacité de production pour reconstruire / se reproduire.
- Le score peut être basé sur population maximale, richesse extraite, profondeur atteinte et durée de survie.

## 5. Progression

La partie doit devenir de plus en plus verticale :

- début : petite colonie, quelques galeries superficielles ;
- milieu : plusieurs couches souterraines, bâtiments spécialisés, effondrements locaux ;
- fin : réseau de cavités dense, gros gisements très tentants, catastrophes en chaîne possibles.

Les minerais rares doivent pousser naturellement les nains vers les zones les plus dangereuses.

Le joueur ne doit jamais pouvoir supprimer complètement le risque : **la cupidité est le moteur du jeu, pas un problème à résoudre une fois pour toutes.**

## 6. Direction artistique & son

### Visuel
- 3D voxel miniature, très lisible, cubes beaucoup plus petits qu'un Minecraft classique.
- Monde traité comme une maquette vivante / fourmilière naine.
- Nains minuscules mais reconnaissables : barbe, casque, pioche, petits déplacements nerveux.
- Surface colorée et lisible ; souterrain plus sombre, avec minerais brillants.
- Coupe / transparence du terrain à tester uniquement si elle améliore réellement la compréhension. Une vue simple avec niveaux cachés/révélés peut suffire.
- Effondrements très satisfaisants : blocs qui chutent, poussière, petits nains qui courent ou disparaissent sous les gravats.

### Son
- Cliquetis permanents de pioches très légers.
- Petits cris / grognements de nains.
- Sons distincts pour découverte d'or, construction et effondrement.
- La densité sonore peut augmenter avec la population sans devenir cacophonique.

## 7. V0 à construire quand le concept sortira de l'incubateur

Le principal risque est la complexité de simulation. La V0 doit éviter toute IA coûteuse ou vraie physique voxel.

Prototype minimal :

1. Petit monde voxel fixe, par exemple 20×20×12 blocs.
2. 6–8 nains autonomes.
3. Trois types de blocs : terre, pierre, or.
4. Les nains choisissent localement un bloc intéressant accessible et le minent.
5. Un seul stock global de ressources.
6. Deux bâtiments : maison + atelier.
7. Placement du bâtiment par le joueur ; construction automatique par les nains.
8. Stabilité très simplifiée : blocs non soutenus sur une petite portée → effondrement local.
9. Effondrement pouvant tuer un nain et détruire un bâtiment.
10. Reproduction / arrivée de nouveaux nains si assez de maisons et ressources.

**Question décisive du prototype :** est-ce que regarder les nains enrichir puis saboter leur propre colonie produit suffisamment de décisions intéressantes pour que le joueur se sente responsable sans pouvoir tout contrôler ?

## 8. Points de vigilance

- Ne pas faire un RimWorld/Dwarf Fortress miniature : MiniFugg exige une boucle immédiatement lisible.
- Éviter le pathfinding global complexe. Utiliser petites grilles, recherches locales, files de tâches simples et mises à jour étalées dans le temps.
- Éviter la vraie physique 3D bloc par bloc : système de stabilité discret et déterministe beaucoup moins coûteux.
- Le joueur doit comprendre **pourquoi** un effondrement s'est produit ; sinon la catastrophe semblera arbitraire.
- La vue souterraine est secondaire : elle ne doit être ajoutée que si le joueur a réellement besoin d'inspecter les galeries pour prendre ses décisions.
- Le plaisir doit venir de l'émergence et du spectacle des petites catastrophes, pas d'un panneau de gestion rempli de chiffres.
