# LineFugg Rebirth — intégration T02

## État courant — 18 septembre 2026

**T02 est intégré au vrai runtime Phaser de Rebirth, version de test `0.1.0-t02`. Le jeu classique n'a pas été modifié.** L'utilisateur a accepté le pack pour intégration avec des réserves mineures sur les alignements et tailles numériques. La validation humaine du jeu intégré reste à recueillir.

Accès : `/?usr=moigod&lab=gameplay-runtime&game=linefugg-rebirth`. Ancien alias conservé dans ce Lab : `game=linefugg&skin=rebirth-editorial`. La route `game=linefugg` sans skin reste le classique. Aucun ajout au feed/catalogue public, aucun score envoyé au classement officiel. Recommencer apparaît après validation de la partie, pas au-dessus de la grille pendant le jeu.

## Isolation et sources

Le routeur du runtime de Lab dirige uniquement la variante Rebirth vers `src/games/linefugg-rebirth/`. Aucun fichier `src/games/linefugg/` n'est modifié. La scène classique et sa première variante conditionnelle restent intactes ; le nouvel accès n'exécute pas cette ancienne variante.

Les atlas T02 ont été déposés dans le Drive privé `Fugg/linefugg/rebirth`, puis importés par GitHub Actions. Leurs empreintes sont dans `ASSET_MANIFEST.md`. Base d'intégration : `661d66020f221ef29a7f1168334565013a01dd7a`, comprenant ces imports. Aucune nouvelle génération graphique ni dépense fal/HF.

## Réalisation

- Phaser 4.2.1, host Core existant, stage 390 × 850, zone essentielle y=80..779 ; densité 1–2 sans changer les coordonnées.
- Atlas T02, chiffres raster et préfixes ×/÷, formules/résultats/total dynamiques ; échelle du total et centrage des résultats ajustés.
- Tracé tactile/souris, clavier flèches/Espace, U/Backspace pour Undo, Entrée pour Validate. Bindings manette prévus mais matériel non testé.
- Deux à cinq cellules en ligne droite dans huit directions ; une intersection maximum par paire ; renouvellement déterministe des cases libres ; Undo restaure le plateau et ses états ; fin explicite après trois lignes, une seule notification.
- Portée expérimentale demandée : pas de moins. Distribution Rebirth 84 % additions positives, 12 % ×, 4 % ÷ ; **les valeurs négatives et la distribution 68/16/12/4 du classique ne changent pas**.
- Boutons off/on/hover/pressed, appui annulé à la sortie ; pastilles on/off ; cadres/pivots/hitboxes fixes. Pas de valeur mutable incrustée dans les surfaces.
- Trois tracés et prévisualisation composés dans quatre RenderTextures maximum, opacité appliquée au groupe. Renouvellement en cascade des glyphes, désactivé en reduced motion. Aucun nouveau son ni modification du système audio Core.

## Vérifications réussies

Code final testé : `dbc6c508cd6d18b41e09ef426c6f7cc3df6d8b3c`.

- CI [35347552664](https://github.com/Kombuccino/instagames/actions/runs/35347552664) : **six jobs réussis**, compilation complète et sept tests de règles réussis dans chacun. Le test d'empreintes confirme cinq fichiers exécutables classiques byte-identiques ; la comparaison Git confirme qu'aucun chemin de son dossier n'est modifié.
- CI générale [35347552636](https://github.com/Kombuccino/instagames/actions/runs/35347552636) : tests repository et build réussis.
- Configurations Chromium : master 390 × 850, A54 360 × 656, iPhone 390 × 712, Brave 360 × 611, desktop 1440 × 900, reduced motion. Rapports CI WebGL ; essais locaux supplémentaires du backend Canvas de Phaser sur les six configurations. Ni Safari ni téléphone physique ne sont simulés fidèlement par ces seuls noms de profils.
- Parcours réel : chargement, glissé de cinq cases, protection/renouvellement, doublon rejeté, Undo exact, rejeu déterministe, trois lignes/calculs, off/hover/pressed, sortie du bouton sans activation, validation puis reprise et un seul canvas.
- Contrôle des pixels rendus : la ligne rouge doit réellement être visible dans la capture, indépendamment du seul état logique. Ancien alias Rebirth et séquence rapide clavier `8×2+4÷2 = 10` vérifiés. Route classique sans nouvel atlas ni interface Rebirth.
- Captures master et A54 ouvertes pour contrôle visuel. Dernière correction : Recommencer masquait la première rangée sur petit écran ; il n'apparaît plus qu'après la fin. Matrice complète relancée avec succès.

Les rapports et captures sont les artifacts `rebirth-proof-*` du run CI cité (rétention 14 jours). L'application locale a été compilée depuis les sources du dépôt et injectée hors réseau dans Chromium ; ce test local n'est pas une visite du site déployé. Un commit publié et une CI verte ne prouvent pas à eux seuls le déploiement Dokploy.

## Enseignements conservés

1. Les types Phaser ont refusé deux appels de création de sprites ; remplacés par les constructeurs explicites, puis recompilation.
2. Les règles passaient alors que les tracés étaient invisibles : Phaser 4 exige le flush `.render()` des RenderTextures avant de libérer les sprites intermédiaires. Correction et test de pixels ajoutés.
3. Des événements clavier DOM identiques étaient retraités : déduplication par identité, vérifiée par touches rapides.
4. Canvas ne teinte pas les images comme WebGL : les glyphes du fallback sont teintés dans de petites textures mises en cache, en préservant l'alpha raster source.
5. Le test unique multi-écrans dépassait le timeout en rendu logiciel ; configurations réparties en jobs limités, sans retirer de scénario. Ce dépassement n'était pas une preuve de blocage du jeu.

## Plan de production et limites

Proto : référence fonctionnelle classique inchangée. DA de cette expérience : T01, puis pack T02 validé pour intégration. Réalisation : ce runtime Rebirth et ses preuves CI. Restent la revue tactile sur appareil réel, les petits alignements, les raccords et la finition du ressenti. L'ancien plan graphique du Production Lab n'a pas encore été remplacé par ces captures ; ne pas confondre sa DA éditoriale précédente avec T02. Aucune refonte de l'éditeur Lab n'est incluse.

Sur le cas Brave 360 × 611, plus court que la zone garantie, les actions passent mais le cadrage complet des extrémités n'est pas certifié. Safari, téléphone physique, manette matérielle et performance réelle restent non testés. Son et animations finales ne sont pas déclarés terminés.

Après revue de ce pilote, retrouver la DA externe approuvée de Crazy Papers et tester dans un contexte neuf : DA choisie/retouchée/gelée, puis compréhension/décomposition. La portabilité vers d'autres modèles de conversation reste à mesurer. Voir le journal `.agents/skills/minifugg-art/references/VALIDATION.md`. Pas de nouvel abonnement ni de nouvelle DA à lancer par défaut.
