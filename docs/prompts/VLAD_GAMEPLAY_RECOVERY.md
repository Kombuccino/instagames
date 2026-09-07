# Prompt de reprise — Les Brochettes de Vlad

À utiliser dans la tâche Codex chargée de corriger l’intégration gameplay de Vlad.

```text
Reprends l’intégration gameplay de « Les Brochettes de Vlad » depuis le dernier main, mais considère la présentation visuelle actuelle comme refusée. Les mentions « validé localement » dans GAME_STATUS signifient seulement que les tests techniques passent : elles ne valent pas validation artistique par l’utilisateur.

Avant toute modification, lis AGENTS.md, docs/ACTIONS.md, codex.md, tous les documents MiniFugg obligatoires pour un jeu et Phaser, puis src/games/vlads-skewers/ART_DIRECTION.md, GAME_STATUS.md et ASSET_MANIFEST.md. Utilise le skill phaser-minifugg et les skills officiels Phaser 4.2.1 utiles. Consulte aussi la page /?usr=moigod&lab=layout : la scène reste strictement 390 × 844, avec mise à l’échelle uniforme.

Références positives exactes :
- GFX/crea-chatgpt/game/VLAD-DA-pixelisee.png pour le rendu pixel, le rythme de la composition, les proportions, la densité, la chaleur et le spectacle de l’impact ;
- GFX/crea-chatgpt/game/Vlad-DA1.png pour la géométrie générale et la lecture de la mécanique ;
- GFX/crea-chatgpt/game/Vlad-DA-Piques.png pour les trois piques de réserve à gauche.

Diagnostic à tenir pour acquis : la version actuelle a transformé la composition en grand puits vertical vide ; le HUD est éclaté en cadres surdimensionnés ; les flammes occupent trop de place et se répètent ; les clients sont coupés sur la droite ; les messages d’impact s’empilent au centre ; le bras et la pique forment une colonne disproportionnée ; les tailles de pixels, de personnages et d’UI ne sont pas cohérentes. Plusieurs textures très grandes sont ensuite réduites à une petite taille d’affichage, ce qui coûte du chargement sans améliorer le rendu.

Corrige la scène comme une reconstruction de composition, pas comme une sixième couche de rustines :
1. Fais une capture de l’état actuel puis trace un plan 390 × 844 avec positions et dimensions logiques de chaque zone. Compare-le côte à côte aux trois références.
2. Garde un champ de chute central large mais visuellement vivant et compact. Le grill, la main, la pique, les ingrédients en vol, la pile embrochée et les clients doivent former une seule action lisible, comme dans la DA. Supprime le grand vide sans intérêt.
3. Recompose un HUD compact : score à droite, panneau de niveau/recette centré en haut, trois réserves à gauche comme l’exige ART_DIRECTION.md. N’ajoute aucun bouton de pause dans le jeu ; le Retour Core reste seul en haut à gauche. Ne laisse aucun cadre masquer la scène.
4. Replace les clients dans de vraies loges fixes entièrement visibles. Le client actif et sa commande restent près de la pointe ; les clients en attente créent une pile verticale lisible sans sortir du stage.
5. Réduis les foyers à des accents localisés et conserve une seule zone de grill dominante. Les particules renforcent les impacts et la profondeur ; elles ne forment pas un rideau permanent.
6. Limite l’affichage simultané des textes d’impact. Un événement principal lisible, éventuellement un secondaire court ; pas cinq cris superposés.
7. Unifie le pixel art. Définis une grille de production explicite et n’utilise que des positions, tailles et échelles qui la respectent. Active nearest-neighbour. Ne mélange pas personnages finement dessinés, gros pixels procéduraux et UI à un autre grain.
8. Mesure chaque asset par sa zone logique réelle. Le dérivé runtime ne doit pas dépasser zone × 2. Recadre les transparences et scinde les atlases au-delà de 2048 px. Préserve les masters, mais ne charge pas les masters surdimensionnés dans Phaser.
9. Ne génère un nouvel asset que s’il manque réellement après l’inventaire. Dans ce cas, envoie au générateur uniquement le composant isolé, ses dimensions logiques, ses états, son fond transparent ou uni et la référence exacte correspondante. Ne lui envoie jamais tout l’historique ni une capture aplatie à reproduire.
10. Préserve le GD et l’équilibrage validés : recettes, score, trois pertes, collision uniquement par la pointe, prise par la main, retour automatique, cuisson et validation automatique. La correction porte sur la composition, la cohérence graphique, la lisibilité et le poids des assets.

Validation obligatoire avant de publier : captures au repos, pendant une chute, lors d’un empalement, avec pile complète, avec cinq clients et après une perte, sur 390 × 844 puis sur téléphone court, grand téléphone, tablette et bureau. Superpose ou compare la capture 390 × 844 à la DA. Vérifie aussi temps avant scène jouable, poids transféré, erreurs console et absence de textures surdimensionnées. Mets GAME_STATUS à jour honnêtement : « revue utilisateur ouverte » tant que l’utilisateur n’a pas validé visuellement.

Livre une seule implémentation canonique, supprime les assets runtime devenus obsolètes, lance build et tests, puis commit et pousse sur main. Dans ton compte rendu, montre la capture 390 × 844 finale, le poids avant/après et les éventuels écarts encore assumés par rapport à la DA.
```
