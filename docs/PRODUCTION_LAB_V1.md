# MiniFugg Production Lab — Alpha

Le Production Lab est une **surface visuelle de dialogue humain ↔ IA**. Il sert à comprendre, comparer, annoter et transmettre l’état d’un jeu sans demander à l’utilisateur de lire les documents de production. Le repo et les fichiers canoniques restent la vérité ; le Lab ne les modifie jamais directement.

## Modèle visuel

Le **Plan** est un espace vectoriel extensible avec pan/zoom. Il n’a pas de colonnes de taille imposée : un État peut s’étendre autant que nécessaire selon le nombre d’écrans, de nœuds et de ramifications.

Les **Covers** forment un ensemble séparé, placé avant la chaîne principale. La chaîne principale est `PROTO → DA → RELEASE`.

- **Proto** : comportement fonctionnel de référence.
- **DA** : conception visuelle enrichie ; elle peut modifier/affiner le GD avant intégration.
- **Release** : DA réellement intégrée dans le runtime, encore révisable ; ce mot ne signifie pas automatiquement version finale 1.0.

Un **écran** représente une situation utile du jeu, pas nécessairement un écran logiciel distinct. L’écran principal donne le contexte général ; des situations supplémentaires descendent sous lui lorsqu’elles sont nécessaires pour **montrer réellement** un moment que l’écran général ne prouve pas : drag, transition, changement de niveau, résultat, état terminal, etc. Les nœuds doivent autant que possible pointer vers une situation où leur sujet est visible, au lieu d’expliquer hors-sol une action absente de l’image.

Un **nœud** est une unité sémantique de conception, pas une représentation stricte du code. Il peut contenir texte, image, tileset, animation ou son. Un nœud peut être relié à un écran, à un autre nœud ou à son équivalent dans un État ultérieur. Lorsqu’il décrit un élément réellement visible, son lien vise une ancre interne précise dans l’écran ; les ancres périphériques restent réservées aux concepts non localisables visuellement. Quand un nœud est sélectionné, son lien et sa zone d’ancrage sont mis en évidence ensemble.

Un **lien transversal** permet de suivre un élément dans le temps, par exemple `grille Proto → grille DA → grille Release`. Tous les éléments ne commencent pas au Proto : un FX peut naître en DA et n’avoir qu’un descendant en Release.

## Navigation du Plan

Le déplacement et la sélection ne sont pas des outils séparés. Ce sont les comportements de base :

- clic simple sur un écran ou un nœud = sélection ;
- clic-glissé / glissé à un doigt = déplacement du Plan ;
- flèches clavier = déplacement ; `Shift + flèche` = déplacement large ;
- molette / trackpad = déplacement du Plan ;
- `Shift + molette` = zoom centré sous le pointeur ;
- pincement à deux doigts = zoom ;
- `Ctrl/Cmd + molette` est neutralisé au-dessus du Plan pour ne pas déclencher le zoom du navigateur.

Les outils explicites de la barre latérale ne servent qu’à la revue : point, zone, dessin et note. Le navigateur ne doit jamais initier de drag natif d’image ou d’iframe dans le Plan.

## Deux vues

- **Vue simplifiée** : affiche les États et leurs écrans, sans nœuds périphériques.
- **Vue éclatée** : affiche les mêmes écrans au même endroit avec leurs nœuds, liens et continuités. Chaque écran peut être simplifié/éclaté individuellement.

## Synchronisation obligatoire avec le travail réel

Le Lab fait partie du **Definition of Done** d’un chantier jeu. Une modification importante du jeu n’est pas considérée comme réellement terminée si elle change la compréhension du produit mais laisse son Plan canonique obsolète.

Après chaque passe significative, ChatGPT/Codex décide si le Plan est impacté et le met à jour dans le même lot lorsque c’est nécessaire : règles, boucle, contrôles, scoring, progression, situation exceptionnelle, composition, DA, cover, entité/composant, états, variantes, transitions, animation, FX, son, feedback, découpe d’assets ou résultat d’intégration.

Les refactors invisibles, corrections de typo, tooling de build et détails d’implémentation sans conséquence de conception/production **ne créent pas de bruit dans le Lab**.

Quand un nouveau jeu devient réellement jouable, son Plan est créé/enrichi dès que le Proto contient assez de comportement pour être cartographié. Un jeu actif ne doit pas rester sur le plan générique minimal. Le propriétaire de cette synchronisation est l’agent, pas l’utilisateur.

## Revue humaine non destructive

L’utilisateur peut travailler localement dans le Lab sans casser le projet : placer un point, dessiner une zone ou un trait, attacher une note, créer un nœud brouillon, commenter un écran/nœud et tester un calage de repère.

Ces modifications sont enregistrées localement dans le navigateur et restent un **calque de revue**. Elles ne modifient ni GitHub, ni le jeu, ni `ART_DIRECTION.md`, ni les manifests.

`Copier pour ChatGPT` exporte un handoff structuré contenant projet, annotations, nœuds brouillons, commentaires, calages locaux et écrans simplifiés. ChatGPT/Codex interprète ensuite ce handoff, applique les changements réels dans le repo, puis rafraîchit le Plan canonique.

## Vérification du contrat de mise en page

Chaque écran du Plan conserve la géométrie authored MiniFugg `390 × 844`. Le Lab peut superposer sans modifier l’image :

- fenêtre officielle minimale `360 × 650` ;
- Galaxy A54 Chrome `360 × 656` ;
- iPhone 13 Pro normalisé ≈ `360 × 657` ;
- Galaxy A54 Brave `360 × 611` cas dégradé.

Pour le gameplay, la position canonique vient de l’ancrage `top | center | bottom`. Pour une Cover, elle vient d’abord du `objectPosition` réellement enregistré pour sa variante, comme dans l’outil de calibration Cover. Le bouton **Éditer** permet de tester localement un autre calage sur l’écran sélectionné ; hors édition, le repère redevient un simple cadre blanc sans libellé. Ces réglages locaux sont exportables mais ne modifient pas les masters ni le contrat global sans application explicite par ChatGPT/Codex.

## Alpha actuelle

- Sélecteur alimenté par `gameRegistry` ; LineFugg Rebirth sert de démonstrateur riche, les autres jeux reçoivent un plan générique minimal tant qu’ils ne redeviennent pas des chantiers actifs.
- Covers séparées, Proto, DA et Release sur le même Plan ; DA/Release restent vides tant qu’elles n’existent pas réellement.
- Le Proto utilise le **vrai runtime** et peut produire plusieurs situations de preuve. LineFugg montre actuellement le départ, un drag réel, l’état après une ligne/retirage et les trois lignes avant validation.
- Écrans en vraie proportion `390 × 844`, nœuds sémantiques, ancres internes et liens visibles jusque dans l’interface ; le lien sélectionné et sa cible sont accentués ensemble.
- Navigation implicite, vue globale, simple/éclatée, simplification par écran, outils de revue locale, export ChatGPT et calibration locale des repères.

## Non-objectifs

Le Lab n’est pas un moteur de jeu, un IDE, un éditeur de données métier, un remplaçant des documents canoniques ni un chat embarqué. Il ne cherche pas à représenter exhaustivement les objets Phaser ou la structure du code. Son rôle est de rendre la conception et les écarts visibles assez tôt pour éviter les intégrations coûteuses à reprendre.
