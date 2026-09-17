# MiniFugg Production Lab — Alpha

Le Production Lab est une **surface visuelle de dialogue humain ↔ IA**. Il sert à comprendre, annoter, comparer et transmettre l’état d’un jeu sans obliger l’utilisateur à lire les documents de production. Le repo et les fichiers canoniques restent la vérité ; le Lab ne les modifie jamais directement.

## Modèle visuel

Le **Plan** est un espace vectoriel extensible avec pan/zoom. Les Covers forment un ensemble séparé avant la chaîne principale `PROTO → DA → RELEASE`. Les zones n’ont pas de taille de contenu imposée : elles s’étendent selon le nombre d’écrans, de nœuds et de ramifications.

Un **écran** est une **capture statique d’une situation utile du jeu**, jamais un mini-runtime. L’écran général montre le contexte principal ; des captures supplémentaires servent à montrer les moments qu’il faut réellement voir : action en cours, transition, changement de niveau, état terminal, etc. Les captures viennent du vrai jeu et peuvent être régénérées. Pendant la revue humaine, l’image d’un écran peut aussi être remplacée localement par glisser-déposer ou fichier choisi ; ce remplacement n’est canonique qu’après traitement par ChatGPT/Codex.

Un **nœud** est une unité sémantique de conception, pas un objet de code. Il peut contenir une observation, une règle, une référence visuelle/sonore, un tileset à produire, un comportement ou tout autre détail utile à la compréhension. Un nœud peut porter plusieurs tags simples (`GD`, `IMAGE`, `ANIMATION`, `FX`, `SON`, `UI`, `NOTE`) et un statut léger (`done`, `review`, `todo`, `blocked`) ; ces marqueurs servent à lire le Plan, pas à recréer un logiciel de gestion de projet. Les nœuds locaux sont directement déplaçables sur le Plan.

Les nœuds canoniques peuvent aussi porter un **repère visuel** Point, Zone ou Dessin sur leur écran propriétaire. Le type de repère suit le sens : Point pour un détail ponctuel, Zone pour une surface ou un composant, Dessin pour un mouvement, une trajectoire ou un FX. Une DA validée conserve son screen global, mais ses nœuds IMAGE doivent pointer vers de **vrais fichiers sources séparés** dès qu’ils existent ; ils sont affichés à leur taille native et le cadre du nœud s’adapte au contenu. Un élément encore absent reste `todo`/`blocked`, sans crop décoratif du master.

## Repères et observations

Les outils de revue sont : **Nœud, Point, Zone, Dessin, Lien**.

- **Nœud** crée une observation libre. Dans un écran, il est directement relié à l’endroit cliqué.
- **Point**, **Zone** et **Dessin** ne créent jamais une annotation isolée : ils créent automatiquement un nœud d’observation associé et un lien vers le repère tracé.
- il n’existe plus d’outil « Note » séparé : une note/observation est simplement un nœud avec du texte et éventuellement une référence image, son ou URL.

Un repère local et son nœud constituent donc toujours un couple sémantique. Supprimer le repère local supprime aussi son nœud associé ; `Ctrl/Cmd+Z` permet de revenir en arrière.

## Liens sémantiques

Un nœud peut avoir zéro, un ou plusieurs liens. Les liens ne reproduisent pas les dépendances du code ; ils expriment ce que l’humain et l’agent doivent comprendre. Quand cela éclaire réellement la production, ils traversent les états : une règle Proto peut pointer vers sa traduction DA, puis la DA vers son implémentation Release. Les éléments encore absents restent volontairement sans faux équivalent Release.

L’outil **Lien** fonctionne en deux clics : le premier et le second clic peuvent viser un nœud, un Point/Zone/Dessin existant ou n’importe quel endroit d’un écran. Cliquer un endroit vide d’un écran crée automatiquement un Point avec son nœud local, de sorte qu’un lien conserve toujours un contexte sémantique.

Il n’y a pas de bouton « Changer ». Quand un lien ou son nœud est sélectionné, ses extrémités apparaissent sous forme de poignées ; on **glisse directement une poignée** vers une autre destination. Un lien local peut relier nœud ↔ nœud, nœud ↔ repère ou repère ↔ repère. Les liens canoniques produits par l’agent peuvent aussi être reciblés localement avant export.

## Revue locale non destructive

La revue humaine est locale et annulable. `Ctrl/Cmd+Z` annule, `Ctrl/Cmd+Shift+Z` ou `Ctrl+Y` rétablit. Les déplacements de nœuds, créations/suppressions de nœuds/repères/liens, modifications de destinations, calages et remplacements d’images font partie de cet historique local.

`Delete` / `Backspace` supprime directement les éléments **créés localement**. Un nœud ou lien canonique produit par ChatGPT/Codex n’est jamais silencieusement retiré : la même touche enregistre une **demande de suppression** visible et exportée, afin que l’agent puisse comprendre et traiter la décision.

`Copier pour ChatGPT` exporte notamment : commentaires, nœuds locaux, repères, liens locaux, overrides de liens canoniques, déplacements, demandes de suppression, calages, remplacements locaux d’images et écrans simplifiés. ChatGPT/Codex applique ensuite les décisions retenues au repo, puis rafraîchit le Plan canonique.

## Navigation

Le déplacement et la sélection sont implicites : clic = sélection ; clic-glissé / un doigt = déplacement du Plan ; flèches = déplacement ; molette/trackpad = déplacement ; `Shift + molette` = zoom ; pincement = zoom. `Ctrl/Cmd + molette` est neutralisé au-dessus du Plan pour ne pas zoomer le navigateur.

Les titres des écrans et des nœuds compensent partiellement le dézoom pour rester lisibles plus longtemps que leur contenu.

## Vérification du contrat de mise en page

Chaque nouvel écran de référence vise la géométrie MiniFugg `390 × 850` et la zone garantie `390 × 710`. Le Lab peut superposer les cas de contrôle A54 Chrome `360 × 656`, iPhone 13 Pro Safari `390 × 712` et A54 Brave `360 × 611`. Les captures et assets historiques `390 × 844` restent affichables tels quels et sont signalés comme sources legacy plutôt que redimensionnés silencieusement.

Le calage a deux portées : chaque **Cover** possède son réglage spécifique initialisé depuis son `objectPosition`; **Proto / DA / Release** possèdent chacun un seul réglage commun, défini depuis la situation générale et appliqué à toutes les captures de l’État. Le petit bouton crayon active l’édition ; hors édition, seul le cadre blanc reste visible.

## Synchronisation obligatoire

Le Lab fait partie du Definition of Done d’un chantier jeu. Toute passe qui change ce qu’il faut comprendre, montrer, produire, animer, sonoriser ou intégrer doit synchroniser le Plan. Les refactors invisibles ou détails techniques sans conséquence de conception n’y créent pas de bruit.

LineFugg Rebirth sert actuellement de démonstrateur : quatre captures statiques du vrai Proto montrent le départ, un tracé en cours, l’état après une ligne et les trois lignes avant validation. DA et Release restent vides tant qu’elles n’existent pas réellement.

## Édition uniforme des liens et reset

Les liens canoniques et locaux ont le même comportement visuel de revue : leurs points d’accroche se placent sur la bordure des nœuds, zones et dessins ; sélectionner un nœud révèle les poignées de tous ses liens. Les deux extrémités peuvent être déplacées localement. Le magnétisme utilise deux seuils distincts : accroche à proximité, puis décrochage seulement après un déplacement plus franc.

Le reset de revue restaure l’état initial complet du Lab pour le jeu courant : aucun nœud/repère/lien local, aucun déplacement ou remplacement d’image, aucun override de lien/calage, vue éclatée, repère minimum, écrans non repliés et caméra initiale. Il réécrit explicitement l’état local vide afin qu’un rechargement conserve bien ce retour au canon.

## Non-objectifs

Le Lab n’est pas un moteur de jeu, un IDE, un éditeur de données métier ni un chat embarqué. Il ne cherche pas à représenter exhaustivement la structure Phaser ou le code. Son rôle est de rendre la conception et les écarts visibles assez tôt pour éviter des intégrations coûteuses à reprendre.


## Ajustements d’édition locale — 16 septembre 2026

Les outils `Nœud`, `Point`, `Zone`, `Dessin` et `Lien` sont **à usage unique** : après création d’un objet, ou après le second clic d’un lien, le Lab revient automatiquement au mode normal sélection/déplacement.

Les liens sont calculés depuis le centre logique des objets mais leur point visible est projeté sur la **bordure** du nœud, de la zone ou du dessin. Lorsqu’une poignée de lien passe à proximité d’un de ces objets, elle s’y aimante ; le seuil de décrochage est volontairement plus large que le seuil d’accrochage pour éviter les changements accidentels de cible.

Le bouton compact `↺` de la barre supérieure **Réinitialise la revue locale** : il efface annotations, nœuds locaux, liens, déplacements, commentaires, remplacements d’image et calages locaux du jeu courant, puis revient exactement au Plan canonique. Un simple rechargement de page conserve au contraire la revue locale, par conception.

La suppression d’un repère local supprime son bundle sémantique associé et les liens qui le référencent ; le Plan ne doit jamais conserver de destination orpheline après `Delete`, `Backspace`, Undo/Redo ou recréation d’un lien.

## Sources de production après validation DA

Après validation d’une DA gameplay, le nuage DA devient le plan de production visible : le screen montre la composition d’ensemble, tandis que les nœuds autour portent les sources raster réelles, les surfaces moteur, états, animations/FX, sons et manques à produire. Une découpe contaminée par des valeurs, chemins ou textes dynamiques reste une référence et n’est pas promue en asset.

Les sources raster sont montrées à leur dimension native dans l’espace vectoriel ; le nœud n’impose ni miniature, ni recadrage, ni hauteur fixe. Les liens vers les nœuds s’ancrent sur les dimensions réellement rendues.
