# MiniFugg — Refonte plateforme par blockouts

Mis à jour le 8 septembre 2026. Ce document sépare l'état actuel, les décisions déjà validées et le prochain travail de conception. Il évite de transformer une idée encore à décrire en migration prématurée.

## Décisions validées

- Production portrait uniquement.
- MASTER `390 × 844`, CENTRE `390 × 662`, vocabulaire de `MINIFUGG_ZONES.md`.
- Mobile : utiliser toute la largeur utile ; le navigateur, la PWA ou l'app déterminent la hauteur réellement disponible.
- PC/grand écran : utiliser toute la hauteur utile pour obtenir la largeur proportionnelle maximale ; les côtés appartiennent au Core.
- Aucun décor latéral propre à une cover ou à un jeu.
- Covers finales statiques rendues par Core ; abandon de toute nouvelle production de covers animées.
- Nouvelle production graphique : PNG master, WebP lossless runtime, AVIF validé pour les grandes images statiques, aucun nouveau JPEG.

## État actuel

L'application fonctionne, mais combine plusieurs générations de layout : Core responsive, stages Phaser en `FIT`, jeux DOM/CSS legacy, covers statiques recadrées et covers Phaser animées. Cette coexistence explique les tailles incohérentes, l'espace perdu sur mobile et les alignements différents entre Home, Cover et Game.

Les templates du laboratoire couvrent Home, Cover, CoverBeta, CoverCaca, Game, GameOver et Ladder. Ils constituent le banc d'essai commun ; ils ne valident pas encore l'expérience finale.

## Legacy à éliminer après remplacement validé

- `FIT` universel qui réduit un stage au lieu d'utiliser toute la largeur mobile ;
- overscan et décor latéral propres aux jeux/covers ;
- covers animées Phaser et anciens systèmes CSS/parallax ;
- masters 9:16 branchés sans dérivé `390 × 844` contrôlé ;
- images surdimensionnées ou JPEG ;
- correctifs responsive différents dans chaque jeu.

Le legacy reste actif tant que son remplacement n'est pas vérifié. Git conserve ensuite l'historique ; le code de production obsolète est supprimé.

## Prochaine phase

1. Recueillir la description complète de l'expérience souhaitée par l'utilisateur pour Home, découverte/Cover, mobile et PC large.
2. Traduire cette description en blockouts simples dans le laboratoire, sans DA finale et sans modifier les jeux.
3. Tester les blockouts dans Brave/Chrome sur A54, en PWA/app et sur PC large ; mesurer `window.innerWidth × window.innerHeight`.
4. Valider navigation, hiérarchie, zones Core, crop, sidecars et passage Cover → Game.
5. Écrire le plan de migration par surface et par jeu.
6. Migrer une surface pilote, vérifier, puis étendre par lots.

Tant que l'étape 4 n'est pas validée, ne pas lancer une reprise générale des scènes ou des jeux. Les corrections bloquantes et travaux déjà autorisés continuent normalement.
