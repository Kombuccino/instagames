# MiniFugg Production Lab — Alpha

Le Production Lab est une **surface visuelle de dialogue humain ↔ IA**. Il sert à comprendre, comparer, annoter et transmettre l’état d’un jeu sans demander à l’utilisateur de lire les documents de production. Le repo et les fichiers canoniques restent la vérité ; le Lab ne les modifie jamais directement.

## Modèle visuel

Le **Plan** est un espace vectoriel extensible avec pan/zoom. Il n’a pas de colonnes de taille imposée : un État peut s’étendre autant que nécessaire selon le nombre d’écrans, de nœuds et de ramifications.

Les **Covers** forment un ensemble séparé, placé avant la chaîne principale. La chaîne principale est `PROTO → DA → RELEASE`.

- **Proto** : comportement fonctionnel de référence.
- **DA** : conception visuelle enrichie ; elle peut modifier/affiner le GD avant intégration.
- **Release** : DA réellement intégrée dans le runtime, encore révisable ; ce mot ne signifie pas automatiquement version finale 1.0.

Un **écran** est une **capture statique d’une situation utile du jeu**. Le Lab n’embarque pas le jeu vivant dans le Plan. L’écran général montre le contexte principal ; des captures supplémentaires existent seulement lorsqu’elles aident à prouver une situation importante : action en cours, transition, changement de niveau, résultat, état terminal, etc. Pour un jeu d’action, on choisit donc quelques images représentatives au bon moment au lieu de lancer plusieurs runtimes.

Les captures de référence sont produites depuis le vrai jeu, sauvegardées comme assets du projet puis affichées comme images. Elles peuvent être régénérées quand le Proto ou la Release change.

Un **nœud** est une unité sémantique de conception, pas une représentation stricte du code. Il peut contenir texte, image, tileset, animation ou son. Il peut avoir **zéro, un ou plusieurs liens**. Un lien peut viser :

- un point précis à l’intérieur d’un écran ;
- un autre nœud.

Ces liens ne prétendent pas reproduire les dépendances du code. Ils expriment seulement ce qu’un humain et l’agent doivent comprendre. Quand un nœud est sélectionné, ses liens et leurs cibles sont accentués. Depuis l’inspecteur on peut ajouter, supprimer ou remplacer chaque destination. Le choix d’un point dans un écran fait partie du lien : il n’existe plus d’outil autonome « Point » dans la barre de revue.

## Navigation du Plan

Le déplacement et la sélection ne sont pas des outils séparés :

- clic simple sur un écran ou un nœud = sélection ;
- clic-glissé / glissé à un doigt = déplacement ;
- flèches clavier = déplacement ; `Shift + flèche` = déplacement large ;
- molette / trackpad = déplacement ;
- `Shift + molette` = zoom centré sous le pointeur ;
- pincement à deux doigts = zoom ;
- `Ctrl/Cmd + molette` est neutralisé au-dessus du Plan pour ne pas zoomer le navigateur.

Les outils explicites de la barre latérale ne servent qu’à la revue : **Zone, Dessin, Note**. Les titres des écrans et des nœuds compensent partiellement le dézoom afin de rester lisibles plus longtemps que leur contenu.

## Deux vues

- **Vue simplifiée** : États et écrans, sans nœuds périphériques.
- **Vue éclatée** : mêmes écrans, avec nœuds et liens. Chaque écran peut être simplifié/éclaté individuellement.

## Synchronisation obligatoire avec le travail réel

Le Lab fait partie du **Definition of Done** d’un chantier jeu. Une modification importante du jeu n’est pas terminée si elle change la compréhension du produit mais laisse son Plan canonique obsolète.

Après chaque passe significative, ChatGPT/Codex met à jour si nécessaire : situations/captures, règles, boucle, contrôles, scoring, progression, composition, DA, cover, entités, états, transitions, animation, FX, son, feedback, découpe d’assets, liens sémantiques et résultat d’intégration.

Les refactors invisibles, corrections de typo, tooling de build et détails d’implémentation sans conséquence de conception/production ne créent pas de bruit dans le Lab.

## Revue humaine non destructive

L’utilisateur peut localement : dessiner une zone ou un trait, poser une note, créer un nœud, modifier ses liens, commenter un écran/nœud et tester un calage de repère.

Ces modifications restent un **calque de revue** dans le navigateur. `Copier pour ChatGPT` exporte annotations, nœuds, liens, commentaires, calages et écrans simplifiés. ChatGPT/Codex applique ensuite les décisions au repo puis rafraîchit le Plan canonique.

## Vérification du contrat de mise en page

Chaque écran conserve la géométrie authored MiniFugg `390 × 844`. Le Lab peut superposer sans modifier l’image : fenêtre officielle minimale `360 × 650`, A54 Chrome `360 × 656`, iPhone 13 Pro normalisé ≈ `360 × 657`, A54 Brave `360 × 611`.

Le calage fonctionne avec deux portées différentes :

- **Cover** : réglage spécifique à chaque jaquette, initialisé depuis son `objectPosition` ;
- **Proto / DA / Release** : un seul réglage commun par État, pris sur la situation générale et automatiquement appliqué à toutes les autres captures du même État.

Le petit bouton crayon à côté du sélecteur de repère active l’édition. Hors édition, seul le cadre blanc reste visible sans libellé. Les réglages locaux sont exportables mais ne modifient pas le contrat global ni les masters sans application explicite par ChatGPT/Codex.

## Alpha actuelle

- LineFugg Rebirth utilise quatre captures statiques issues du vrai Proto : départ, tracé, après une ligne, trois lignes avant validation.
- DA et Release restent vides tant qu’elles n’existent pas réellement.
- Les nœuds acceptent plusieurs liens vers écrans ou nœuds et ces cibles sont rééditables depuis l’inspecteur.
- `+ Nouveau nœud` depuis un écran crée un nœud de revue avec un premier lien vers cet écran ; il peut ensuite être déplacé sémantiquement en changeant ou supprimant ses liens.
- Navigation implicite, titres compensés au dézoom, simple/éclatée, annotations locales, export ChatGPT et calibration locale des repères.

## Non-objectifs

Le Lab n’est pas un moteur de jeu, un IDE, un éditeur de données métier, un remplaçant des documents canoniques ni un chat embarqué. Il ne cherche pas à représenter exhaustivement les objets Phaser ou la structure du code. Son rôle est de rendre la conception et les écarts visibles assez tôt pour éviter les intégrations coûteuses à reprendre.
