# LineFugg Rebirth — intégration T02

## État courant — 18 septembre 2026

**T02 est intégré au vrai runtime Phaser de Rebirth, version de test `0.1.0-t02`. Le jeu classique n'a pas été modifié.** Le 18 septembre à 15:30 Europe/Paris, l'utilisateur confirme que le jeu tourne et juge très satisfaisante l'intégration visuelle et jouable, sous réserve de petites finitions. Cette acceptation remplace l'attente de retour humain sur ce premier pilote ; elle ne valide pas les fonctions Core encore absentes, toutes les plateformes, ni la généralisation de la méthode.

Accès : `/?usr=moigod&lab=gameplay-runtime&game=linefugg-rebirth`. Ancien alias conservé dans ce Lab : `game=linefugg&skin=rebirth-editorial`. La route `game=linefugg` sans skin reste le classique. Aucun ajout au feed/catalogue public, aucun score envoyé au classement officiel. Recommencer apparaît après validation de la partie, pas au-dessus de la grille pendant le jeu.

### Deux corrections Core ouvertes — non réalisées dans cette passe

- [ ] Rétablir le retour Core normal autour de Rebirth, sans dessiner un retour concurrent dans l'art ni toucher au classique.
- [ ] Brancher la fin de partie et le score du jour sur le parcours quotidien Core attendu. À l'instant du retour, `GameplayCalibrationRuntime` ne fait que recevoir `session.finish` dans son état React local et afficher un readout ; il ne fournit pas l'écran de fin ni le circuit de score quotidien complet. Conserver l'identité distincte de Rebirth : ses essais/règles ne doivent pas écraser les scores du classique.

Ces omissions relèvent de l'intégration MiniFugg, pas de la décomposition graphique. La prochaine recette doit inclure le cycle entrée → jeu → fin/score du jour → retour, en plus des contrôles internes. Aucun correctif de code ni nouvelle version produit n'est livré par cette mise à jour documentaire.

### Portabilité du procédé — question prioritaire, résultat non établi

L'utilisateur veut pouvoir poursuivre avec un modèle de conversation antérieur, notamment GPT-5.6, sans devoir reconstruire la procédure ou utiliser systématiquement le modèle le plus puissant. Le résultat obtenu en quelques grandes passes correspond à son objectif, même si plusieurs passes de finition restent acceptables. Cela décrit l'expérience de ce pilote, pas une garantie de cadence pour les autres jeux.

Le journal commun reste `.agents/skills/minifugg-art/references/VALIDATION.md`, avec le protocole autonome et les archives T01/T02. Trois responsabilités doivent rester séparées : le modèle image fabrique/édite ; l'agent comprend la DA, choisit les composants, masque, paramètres et corrections ; les scripts et le code vérifié exécutent crops, alpha, atlas, états, rendu et tests. T02 a utilisé des sélections et scripts spécifiques à ses sources après deux échecs de génération ciblée : ce n'est pas encore un outil universel de découpe. Conserver les scripts et composants qui fonctionnent, plutôt que demander à chaque modèle de les réinventer. Une procédure seule ne garantit pas la même perception visuelle ni le même diagnostic d'erreurs.

Expériences proposées, non lancées par cette discussion :

1. Après les corrections Core, tester une DA externe déjà validée de Crazy Papers dans un contexte neuf, sans générer simultanément la DA et ses calques. Retrouver son master exact avant l'essai.
2. Comparer les modèles de conversation sur ce même fichier figé et le même paquet autonome (brief, références, outils/scripts, critères), sans fournir à l'un le résultat ou les décisions spécifiques produits par l'autre. Garder le même outil image et les mêmes accès lorsque possible ; noter les différences au lieu d'attribuer à un modèle une restriction d'outils. Pour un diagnostic supplémentaire, on peut fournir aux deux le même inventaire approuvé : cela mesure l'exécution, pas la compréhension autonome.
3. Séparer ensuite le test de complexité sur Vlad : masques, parties cachées, pivots, déformations/animations et relations entre objets. Ne pas changer en même temps le jeu, le modèle et l'outillage puis prétendre identifier la cause d'un écart.

Critères : fidélité/matière/échelle, composants et états exploitables, comportement en jeu, absence de régressions Core, reprises et temps humain jusqu'à acceptation. Aucun essai croisé de modèles n'a encore été exécuté. Une hypothèse de répartition reste à éprouver : modèle plus puissant pour les décisions visuelles/diagnostics difficiles, modèle antérieur pour l'exécution bornée avec outils existants. Ce n'est pas une dépendance obligatoire au premier modèle.

Vérification documentaire du 18 septembre : [OpenAI — image generation tool](https://developers.openai.com/api/docs/guides/tools-image-generation) distingue le modèle principal des modèles GPT Image et indique que le premier révise le prompt ; [ChatGPT Images](https://help.openai.com/en/articles/11084440) décrit les fonctions de génération/édition. Cela ne prouve ni le modèle image réellement employé dans nos appels antérieurs ni la même qualité avec chaque modèle de conversation. Aucun achat/API ni changement de modèle n'a été effectué pour cette vérification.

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

Proto : référence fonctionnelle classique inchangée. DA de cette expérience : T01, puis pack T02 validé pour intégration. Réalisation : ce runtime Rebirth et ses preuves CI, désormais revus favorablement par l'utilisateur le 18 septembre. Restent les deux corrections Core ci-dessus, les petits alignements, les raccords et la finition du ressenti. L'ancien plan graphique du Production Lab n'a pas encore été remplacé par ces captures ; ne pas confondre sa DA éditoriale précédente avec T02. Aucune refonte de l'éditeur Lab n'est incluse.

Sur le cas Brave 360 × 611, plus court que la zone garantie, les actions passent mais le cadrage complet des extrémités n'est pas certifié. Le retour utilisateur ne précise pas son appareil : Safari, téléphone physique identifié, manette matérielle et mesure de performance réelle restent non testés par l'agent. Son et animations finales ne sont pas déclarés terminés.

Suite : fermer les omissions Core de Rebirth, puis appliquer les essais de portabilité distincts décrits plus haut. Pas de modification du classique, de nouvel abonnement ni de nouvelle DA à lancer par défaut.
