# MiniFugg Production Lab — Alpha

Le Production Lab est une **surface visuelle de dialogue humain ↔ IA**. Il sert à comprendre, comparer, annoter et transmettre l’état d’un jeu sans demander à l’utilisateur de lire les documents de production. Le repo et les fichiers canoniques restent la vérité ; le Lab ne les modifie jamais directement.

## Modèle visuel

Le **Plan** est un espace vectoriel extensible avec pan/zoom. Il n’a pas de colonnes de taille imposée : un État peut s’étendre autant que nécessaire selon le nombre d’écrans, de nœuds et de ramifications.

Les **Covers** forment un ensemble séparé, placé avant la chaîne principale.

La chaîne principale est :

`PROTO → DA → RELEASE`

- **Proto** : comportement fonctionnel de référence.
- **DA** : conception visuelle enrichie ; elle peut modifier/affiner le GD avant intégration.
- **Release** : DA réellement intégrée dans le runtime, encore révisable ; ce mot ne signifie pas automatiquement version finale 1.0.

Un **écran** représente une situation utile du jeu, pas nécessairement un écran logiciel distinct. L’écran principal donne toujours le contexte général ; des situations supplémentaires descendent sous lui uniquement lorsqu’elles sont nécessaires pour montrer un moment qui n’est pas visible dans la situation générale.

Un **nœud** est une unité sémantique de conception, pas une représentation stricte du code. Il peut contenir texte, image, tileset, animation ou son. Sa taille dépend de son contenu. Un nœud peut être relié à un écran, à un autre nœud ou à son équivalent dans un État ultérieur.

Un **lien transversal** permet de suivre un élément dans le temps, par exemple `grille Proto → grille DA → grille Release`. Tous les éléments ne commencent pas au Proto : un FX peut naître en DA et n’avoir qu’un descendant en Release.

## Deux vues

- **Vue simplifiée** : affiche les États et leurs écrans, sans nœuds périphériques.
- **Vue éclatée** : affiche les mêmes écrans au même endroit avec leurs nœuds, liens et continuités. Chaque écran peut être simplifié/éclaté individuellement.

## Revue humaine non destructive

L’utilisateur peut travailler localement dans le Lab sans casser le projet :

- placer un point ;
- dessiner une zone rectangulaire ;
- dessiner un trait libre ;
- attacher une note ;
- créer un nœud brouillon lié à un écran ;
- écrire des commentaires sur un écran ou un nœud canonique.

Ces modifications sont enregistrées localement dans le navigateur et restent un **calque de revue**. Elles ne modifient ni GitHub, ni le jeu, ni `ART_DIRECTION.md`, ni les manifests.

`Copier pour ChatGPT` exporte un handoff structuré contenant projet, élément, coordonnées, annotations, nœuds brouillons, commentaires et écrans simplifiés. ChatGPT/Codex interprète ensuite ce handoff et applique les changements réels dans le repo.

## Vérification du contrat de mise en page

Chaque écran du Plan conserve la géométrie authored MiniFugg `390 × 844`. Le Lab peut superposer sans modifier l’image :

- fenêtre officielle minimale `360 × 650` ;
- Galaxy A54 Chrome `360 × 656` ;
- iPhone 13 Pro normalisé ≈ `360 × 657` ;
- Galaxy A54 Brave `360 × 611` cas dégradé.

Ces viewports sont projetés dans le MASTER 390 et suivent l’ancrage `top | center | bottom` de la situation. L’overlay est seulement un outil de contrôle visuel ; il n’altère aucun master.

## Alpha actuelle

- Sélecteur alimenté par `gameRegistry` ; LineFugg Rebirth sert de démonstrateur riche, les autres jeux reçoivent un plan générique minimal.
- Covers séparées, Proto, DA et Release sur le même Plan.
- Écrans en vraie proportion 390×844.
- Nœuds texte/image/tileset/animation/audio.
- Liens écran↔nœud et quelques lignées Proto↔DA↔Release.
- Pan/zoom, vue globale, simple/éclatée et simplification par écran.
- Outils de revue locale et export ChatGPT.
- Overlay des tailles de référence.

## Non-objectifs

Le Lab n’est pas un moteur de jeu, un IDE, un éditeur de données métier, un remplaçant des documents canoniques ni un chat embarqué. Il ne cherche pas à représenter exhaustivement les objets Phaser ou la structure du code. Son rôle est de rendre la conception et les écarts visibles assez tôt pour éviter les intégrations coûteuses à reprendre.
