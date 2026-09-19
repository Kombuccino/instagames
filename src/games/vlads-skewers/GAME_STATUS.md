# Les Brochettes de Vlad — Suivi

## État au 19 septembre 2026

Jeu public : release 0.4.2 du 17 septembre, runtime historique 390×844. La refonte graphique est en préparation ; aucun code gameplay, score, physique, contrôle ni cover n’est remplacé par cette passe.

## Lot actif : recomposition mesurée

- Autorisation : refaire la maquette complète, même style, en réconciliant les retours de septembre.
- Base inspectée : 02dfb0ebfba28c80c9cd3244ac98297a5b8388ab ; branche temporaire chatgpt/vlad-composition-review, PR25.
- Nouveau contrat : MASTER 390×850, zone garantie 390×710, bottom y140→850. Les anciennes indications 390×662 de ce suivi ne sont plus la cible de conception.
- Vérité visuelle : 15 captures du vrai runtime dans le banc existant, cinq formats (A54 Chrome, taille iPhone, Brave dégradé, master legacy et bureau) et trois situations (départ, file pleine, Brutality). Chromium CI : ce ne sont pas des tests Safari/Brave natifs ni une preuve de l’application déployée. Aucun pageerror/HTTP error dans le rapport initial.
- Défauts constatés : score/panneau de niveau recadrés sur vues courtes ; Brutality déjà présent mais mal placé dans le feu ; silhouettes de clients mal contenues. Les éléments absents à l’écran ne sont donc pas tous absents du code.
- Proposition de géométrie : composition.json ; cinq loges, commande 2–5, timer intégré, rack gauche, main/grill et seau tiennent dans les six simulations géométriques. Cela prouve les boîtes, pas l’art, les hitboxes ou la qualité sur appareil.
- Production Lab : trois captures Proto, quatre blockouts DA (jeu, broche protégée, Brutality, niveau), inventaire sémantique couvrant structure, clients, états, gameplay, texte, FX et son. Aucune nouvelle Release ni faux asset final.

## Décisions réconciliées

Voir ART_DIRECTION.md, section du 19 septembre : actif en haut ; portraits intacts ; bave séparée vers le seau ; ordre/temps ensemble ; empilement à la garde ; seconde protégée ; physique validée conservée ; aucun changement silencieux de scoring ou de progression.

## Fichiers et preuves

- public/assets/generated/vlads-skewers/production-lab/ : captures réelles, blockouts techniques, geometry-report.json et report.json ; jamais des textures du jeu public.
- composition.json : coordonnées de proposition.
- production-plan.json : Plan canonique de revue, affiché par le Production Lab.
- PR25 : espace de préparation ; la présence d’un fichier sur la branche n’est ni acceptation artistique ni déploiement du gameplay.

## Contrôles et suite

Contrôle diagnostic runtime : effectué. Contrôle géométrique des boîtes : effectué. Maquette pixel-art et comparaison au gabarit : à produire/revoir. Validation artistique utilisateur : en attente. Découpage, réfection des portraits, export runtime, mini-tranche puis intégration complète : non commencés.

L’enseignement de cette passe est de mesurer le cadre visible avant le dessin. Ne pas relancer l’intégration rejetée ni reprendre l’ancien atlas troué. La prochaine validation porte sur la composition et les états, pas sur un déploiement.
