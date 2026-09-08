# MiniFugg — Notice unifiée de création d'un jeu

Version 1 — 7 septembre 2026. Document vivant, destiné à ChatGPT, Codex et aux développeurs.

Entrée commune pour chaque demande : [ACTIONS.md](ACTIONS.md), qui sélectionne les procédures et outils. Cette notice détaille le parcours du jeu ; elle ne remplace pas les briefs ciblés [DA_CORE](DA_CORE.md), [DA_GAME](DA_GAME.md) et [DA_COVER](DA_COVER.md).

## 1. But et autorité

Passer rapidement d'une idée à un jeu que l'on peut essayer, améliorer son game design (GD), puis investir dans une direction artistique (DA), une réalisation et un son cohérents si l'utilisateur souhaite le poursuivre.

Cette notice est le point d'entrée opérationnel pour chaque jeu. Elle organise les étapes et le suivi ; les documents spécialisés cités en section 12 restent les autorités techniques. Les décisions explicites de l'utilisateur priment. Les conversations apportent le contexte ; le dépôt conserve les décisions, les références et l'état réellement livré.

Le parcours est : **idée → prototype jouable → bêta affinée → production artistique → Fugg → entretien**. On peut revenir à une étape, mettre un jeu en pause ou conserver une expérience sans jamais la promouvoir. La production artistique se prépare pendant la bêta ; elle ne constitue pas un nouveau statut du catalogue.

Le travail documentaire reste proportionné : quelques lignes suffisent au prototype. L'agent tient les documents à jour ; l'utilisateur n'a pas à les remplir, les lire ou rappeler les étapes.

## 2. Trois états à distinguer

| État | Signification | Source |
| --- | --- | --- |
| Phase de travail | Ce que l'on développe actuellement : prototype, GD, DA, assets, intégration, etc. | `src/games/<id>/GAME_STATUS.md` |
| Maturité | Prototype : idée à éprouver. Bêta : jeu intéressant à affiner. Fugg : expérience aboutie et validée. | Critères ci-dessous et bilan dans `GAME_STATUS.md` |
| Statut publié | Visibilité effective du jeu : `trash`, `beta`, `fugg`. | `src/core/gameRegistry.tsx` et [GAME_CURATION.md](GAME_CURATION.md) |

`proto` n'est actuellement pas une valeur du registre. Pour un nouveau prototype publié, utiliser le circuit expérimental existant (`trash`, accessible directement / via Tout) tant qu'aucun statut dédié n'est implémenté. Ce choix technique ne signifie pas que l'idée est mauvaise. Ne pas inventer un statut TypeScript ni modifier silencieusement la visibilité d'un jeu existant.

Un `status: 'fugg'` historique ne prouve pas que l'audit qualité est complet. Signaler l'écart dans le suivi. De même, `migration.state: 'current'` atteste la migration moteur, pas la finition artistique ; `migration.cover` suit la cover séparément. Un seuil de likes ne remplace pas la validation de production.

### Première création et dix prompts

La limite de dix prompts cadre la **première version jouable complète**, avec sa boucle, sa fin/reprise et ses règles essentielles. Chercher à la rendre jouable dès le premier prompt. Une présentation neutre est acceptable à ce stade. Le dixième prompt clôt cette séquence avec un bilan honnête des livrables et limites ; il ne confère pas automatiquement la qualité Fugg.

L'affinage ultérieur et la production artistique d'un jeu que l'utilisateur choisit de poursuivre sont des passes sur un jeu existant. Ne pas recommencer un compteur, forcer la DA trop tôt ou prétendre qu'une bêta est finie pour respecter le compteur. Cette clarification remplace l'ancienne ambiguïté « tout finir en dix prompts » conformément au parcours demandé le 7 septembre 2026.

## 3. Idée → prototype : rendre la question jouable

**Question à résoudre : le geste et les décisions donnent-ils envie de rejouer ?**

Portée actuelle : créer le prototype et toute sa production en portrait selon [Zones MiniFugg](MINIFUGG_ZONES.md), sur une largeur logique de 390 et une enveloppe artistique maximale `390 × 844`. Ne pas consacrer de temps, de prompt ou d’asset à une variante paysage tant que l’utilisateur n’a pas rouvert ce besoin.

1. Résumer en quelques lignes le geste, l'objectif, la boucle d'une partie, la fin/échec, le score éventuel et la raison de recommencer. Noter les hypothèses de règles sans exiger un long cahier des charges.
2. Déduire l'orientation et le plus petit périmètre jouable. Poser seulement une question de GD si deux interprétations changent profondément le jeu. Une simple idée à archiver ne déclenche pas automatiquement un chantier.
3. Dès que la création est demandée, coder la mécanique sur le runtime canonique : Phaser pour la 2D, Three.js pour une vraie 3D. Employer formes simples, couleurs distinctes, gros textes, feedback minimum. Aucune exploration graphique obligatoire ni pack d'assets final.
4. Utiliser immédiatement le stage logique et le host Core : `active`, `seed`, `restartToken`, score et fin. Le prototype ne recrée ni portefeuille ni ladder ni navigation. Un jeu legacy verrouillé se migre avant son évolution.
5. Jouer une partie complète, tester les règles essentielles et la reprise, vérifier l'input principal puis compiler. Fournir un accès jouable et indiquer précisément s'il est local, sur une branche, sur `main` ou déployé.
6. Créer le suivi minimal : idée, règles actuelles, inconnues, prochaine expérience. Une idée conservée sans code peut rester dans `docs/game-ideas/` ; créer le dossier du jeu lorsqu'il existe vraiment.

**Sortie prototype :** boucle accessible et testable, résultat/reprise cohérents, principales règles compréhensibles, problèmes connus nommés. La beauté n'est pas un critère de sortie. Si le plaisir n'est pas là, revoir le GD avant d'investir dans l'art.

## 4. Prototype → bêta : affiner le GD et l'équilibrage

ChatGPT et Codex peuvent tous deux mener cette phase selon les accès disponibles. La répartition entre outils n'est pas un passage imposé.

1. Observer de vraies parties et recueillir les difficultés : compréhension, contrôle, choix intéressants, longueur, frustration, plaisir de rejouer.
2. Identifier une hypothèse par passe : courbe de difficulté, fréquence d'un objet, contrainte, scoring, tutoriel, progression. Définir l'effet attendu, essayer, conserver ou rejeter avec une raison courte.
3. Rendre les paramètres d'équilibrage faciles à retrouver ; séparer autant que possible simulation/règles et présentation. Tester limites, exploits évidents, parties impossibles, égalités, négatifs, décimales ou scores longs selon le jeu.
4. Vérifier la lisibilité et la précision tactile dans les petits écrans réels de la matrice. Le joueur doit pouvoir voir et actionner les éléments essentiels avant leur habillage.
5. Garder dans le suivi les règles retenues et les décisions réversibles. Créer `GAME_DESIGN.md` seulement si ces règles deviennent trop longues pour le bref résumé du suivi ; ne pas conserver deux spécifications contradictoires.

**Sortie bêta / entrée production :** concept que l'utilisateur souhaite poursuivre, boucle convaincante, règles assez stables, contraintes d'input et de composition connues. Un perfectionnement ultérieur du GD reste possible ; en évaluer alors l'impact sur les assets et tests.

Une bêta peut rester simple visuellement et recevoir juste les sons utiles au contrôle. L'utilisateur décide d'investir dans la production complète ; ne pas générer un catalogue artistique pour toute idée exploratoire.

## 5. Préparer et choisir la DA

1. Partir du jeu jouable et de ses contraintes. Construire ou ajuster un **blockout**, c'est-à-dire la composition fonctionnelle avec des formes simples, dans le stage réel. Y réserver les zones de textes, cibles tactiles, contrôles, effets et UI Core.
2. Si aucune direction n'est choisie, suivre [DA_GAME.md](DA_GAME.md) : normalement quatre ou cinq pistes distinctes sur la même composition fonctionnelle. Préparer les couches et états pour le moteur dès cette recherche. Faire une recommandation brève.
3. Vérifier la composition des propositions : compte exact d'objets importants, orientation, textes fonctionnels, place des contrôles, états vide/plein et pire cas. Les erreurs d'une image générée ne deviennent jamais des règles du jeu.
4. Enregistrer le choix utilisateur et la référence exacte dans `ART_DIRECTION.md` : chemin de l'image, date, ce qui est approuvé, contraintes et écarts autorisés. Conserver la référence validée intacte.
5. Traduire ce choix dans le blockout et vérifier son ergonomie avant une production importante. L'agent peut résoudre les détails techniques ; demander un choix seulement si l'on doit modifier une promesse artistique ou un compromis de GD important.

**Sortie :** DA choisie, composition fonctionnelle vérifiée et premier plan de production. Une belle image ne valide ni ses assets runtime, ni le son, ni la fidélité du jeu implémenté.

### Continuité obligatoire : ne pas faire répéter la DA

Avant chaque lot d'assets, cover, animation ou son, l'agent relit cette notice, [Zones MiniFugg](MINIFUGG_ZONES.md), le suivi du jeu et les sections pertinentes des documents spécialisés. Il récupère dans `ART_DIRECTION.md` un **contrat artistique** court et durable :

- références exactes approuvées, rôle de chaque référence et décisions utilisateur datées ;
- identité du jeu : émotion, silhouettes, matières, palette, composition et hiérarchie ;
- éléments à préserver entre gameplay, cover, mouvement et son ;
- directions rejetées et raisons, avec exemples visuels lorsqu'ils sont disponibles ;
- langage du mouvement et des effets : rythme, poids, intensité, événement auquel ils répondent ;
- liberté laissée à l'agent et seules décisions encore ouvertes.

L'agent rédige ce contrat à partir des décisions disponibles et le maintient ; ce n'est pas un formulaire à faire remplir par l'utilisateur. Les fichiers spécialisés peuvent être liés plutôt que recopiés. Une nouvelle discussion reprend ce contrat avant de proposer ou produire. Si une référence est inaccessible, signaler précisément laquelle et exploiter ce qui est documenté ; ne pas prétendre l'avoir vue ni demander de raconter tout le projet.

Les prompts de génération ou d'édition incorporent ce contrat, les références visuelles disponibles et les contraintes du composant. « Fais une belle cover de jeu » ou le seul nom d'un style ne constitue pas un brief suffisant. Un choix approuvé reste acquis jusqu'à sa modification explicite ; une contrainte technique conduit d'abord à chercher une réalisation fidèle, puis à présenter le compromis concret si nécessaire.

### Rejet du rendu générique « ChatGPT style »

La demande utilisateur du 7 septembre 2026 s'applique à toutes les productions finales. Elle ne désigne pas une interdiction de générer des images : elle exige une identité artistique propre au jeu et une sélection critique des sorties. Appliquer aussi [STYLE_SYSTEM.md](STYLE_SYSTEM.md).

Rejeter un résultat qui remplace les références par un habillage interchangeable : néon violet/cyan, cartes vitrées et rectangles arrondis par défaut, rendu plastique uniformément lisse, pseudo-HUD, ornements répétitifs sans rapport avec l'univers, lueurs ou particules ajoutées partout pour donner une impression de finition. Ces caractéristiques peuvent être pertinentes si elles font partie de la DA choisie ; elles ne sont jamais un raccourci automatique vers la qualité.

Avant de présenter un lot comme terminé, l'agent compare référence et rendu à taille réelle :

1. Reconnaît-on les formes, matières et proportions spécifiques de la DA ? La cover annonce-t-elle le jeu réellement livré ?
2. Chaque détail soutient-il l'univers ou la lecture ? Le décor laisse-t-il la priorité au geste et aux informations ?
3. Les animations ont-elles une intention identifiable — poids d'un mécanisme, réponse d'une matière, accent d'une action — plutôt qu'un flottement ou un rebond appliqué à tout ?
4. Les lumières et effets respectent-ils la matière, les sources lumineuses et le rythme choisis ?
5. Les différences avec la référence sont-elles volontaires, expliquées et acceptables dans le périmètre déjà autorisé ?

Une sortie infidèle est corrigée ou rejetée avant la déclinaison du pack. Une limite de génération ne devient pas une baisse de qualité silencieuse. Tester d'abord un échantillon représentatif intégré. Demander un choix uniquement pour une nouvelle direction ou un compromis significatif non résolu, sans refaire approuver les décisions acquises. Consigner les rejets utiles pour éviter de reproduire les mêmes erreurs.

## 6. Concevoir la réalisation Phaser avant de générer

L'agent fait une proposition technique au service de la DA. Il examine les capacités du moteur réellement installé, ses types/exemples et, si nécessaire, la documentation officielle de la même version. Ne pas transposer aveuglément une API Phaser 3 vers Phaser 4. Phaser Editor est un outil optionnel à essayer sur un composant concret ; le pipeline n'en dépend pas.

Pour chaque élément significatif, décider : **propriétaire, construction, mouvement, états, coût et test**. Appliquer [GAME_ART_PRODUCTION_PIPELINE.md](GAME_ART_PRODUCTION_PIPELINE.md).

| Besoin artistique | Construction à envisager | Préparation nécessaire |
| --- | --- | --- |
| Environnement | Fond raster, couches de profondeur, décor indépendant | Zone centrale sûre et débord utile au crop ; silhouettes et palette lisibles |
| Accessoire mobile | Image/sprite et conteneur Phaser | Alpha propre, pivot, limites de mouvement, art derrière l'objet et occultations |
| Cadre/panneau extensible | ThreeSlice/NineSlice ou pièces assemblées | Coins/embouts fixes, centre extensible, zone de contenu ; aucun étirement arbitraire de l'ornement |
| Cases, cartes, objets répétés | Instances d'un composant, textures partagées | Même gabarit, états et ancrages ; atlas si utile |
| Terrain/niveau en tuiles | Tilemap et tileset si la mécanique le justifie | Taille des tuiles, raccords, marges, couches visuelles et collisions séparées |
| Personnage animé | Spritesheet/atlas ou pièces articulées selon le mouvement | Frames cohérentes, pivots, poses, durée et transitions ; éviter la décomposition inutile |
| Éclairage/relief | Lumière supportée, reflets animés, masques ou shader ciblé | Si nécessaires, cartes de normales/masques/émission exactement alignées à l'image ; vérifier leur prise en charge avant production |
| Énergie, poussière, impact | Particules, sprites en mélange additif, géométrie ou filtres ciblés | Petite texture de support, zone, déclenchement, durée, plafond de particules et version réduite |
| Texte/score/jauge | Données et rendu dynamiques | Police lisible/licenciée, glyphes utiles, longueurs maximales, emplacement réservé, états traduits |
| Bouton | Composant avec base partagée et états | Hitbox distincte de l'alpha décoratif, icône, focus/pression/indisponible/prêt ; matrices cohérentes |

Tous les jeux n'ont pas besoin de maps, de normales, de shaders, de physique ou de particules. Marquer les éléments inutiles « sans objet » avec une raison. Choisir quelques effets qui donnent du caractère : par exemple un mécanisme lent, une réaction tactile et un événement spectaculaire. Les effets ne doivent pas masquer les informations ni remplacer les matériaux illustrés promis.

Pour une animation, noter le déclencheur, la durée, la couche, l'amplitude, la priorité visuelle et le comportement en pause/mouvement réduit. Pour une lumière, définir ce qu'elle éclaire et vérifier que les reflets déjà peints ne contredisent pas son mouvement. Un faux relief dessiné dans une image n'offre pas automatiquement un éclairage dynamique crédible.

### Contrat de chaque asset

Avant génération, compléter `ASSET_MANIFEST.md` avec :

- identifiant, fichier canonique, usage, obligatoire/optionnel et référence de DA ;
- taille logique affichée, dimensions d'export visées et ratio ;
- bounds du fichier **et bounds utiles du dessin**, marges alpha et zone de contenu ;
- pivot/origine, profondeur, points d'attache, masque/occlusion, hitbox si pertinente ;
- zones fixes/extensibles, zone sûre et zones sacrifiables au crop ;
- états, frames, cadence et pièces mobiles ;
- propriétaire des valeurs et des effets dessinés au-dessus ;
- coût visé, stratégie de chargement/réutilisation ;
- état réel : prévu, généré, contrôlé, synchronisé, intégré, validé en jeu.

Une bande avec de grandes marges transparentes n'a pas la même taille utile que son fichier. Une ouverture de plateau doit être mesurée explicitement. Ne jamais réduire la grille pour accommoder un cadre mal produit sans reconsidérer l'ergonomie.

## 7. Produire, importer et intégrer les assets

1. Produire d'abord une tranche représentative : un élément jouable + son habillage + son feedback. La regarder à taille de jeu avant de décliner toute la famille.
2. Générer/éditer depuis les références retenues, en précisant rôle, silhouette, ratio, alpha, zones vides et éléments exclus. Un générateur ne garantit pas les dimensions, transparences ou états exacts : contrôler les fichiers obtenus, corriger ou rejeter les sorties inadéquates.
3. Vérifier visuellement alpha, bords, contenu, cohérence des matières, tailles utiles, alignement des états et lisibilité après réduction. Ne pas accepter une planche illustrée comme atlas sans frames et métadonnées explicitement préparées.
4. Préserver les sources. Prévoir des résolutions adaptées dès la création ; les dérivés optimisés d'originaux existants suivent l'autorisation et les règles de [ASSET_PIPELINE.md](ASSET_PIPELINE.md), sans écraser la référence approuvée.
5. **Dans Codex avec accès local**, enregistrer directement les images dans `public/assets/generated/<jeu>/…`, les vérifier puis les committer avec le code. **Depuis ChatGPT sans accès local**, passer par Drive privé → sync GitHub → `public/assets/imported/…`. Référencer uniquement les fichiers vérifiés via `/assets/generated/…` ou `/assets/imported/…` selon leur provenance. Les métadonnées JSON de scènes/atlas/maps sont du code/versionnement normal ; l'importeur Drive ne transporte que PNG/JPEG/WebP. Ne pas imposer Drive à une génération locale Codex.
6. Reconstruire des composants Phaser, puis leurs états et transitions, avec une seule source de géométrie pour art et hit-testing. Ne pas empiler des rectangles de secours pour cacher des parties incorrectes d'un asset.
7. Comparer au master dans plusieurs états, pas uniquement le premier écran. Les divergences volontaires doivent être motivées par lisibilité, interaction ou contrainte de production et enregistrées.
8. Retirer l'ancienne implémentation et ses assets inutilisés lorsque le remplacement est validé. Pour les images synchronisées, coordonner le nettoyage de la source Drive pour éviter leur réimportation. Les propositions musicales gardent leurs identités archivées selon le contrat audio.

### Responsive, résolution et performance

- Gameplay : largeur logique 390 et échelle uniforme ; largeur pilote sur mobile, hauteur sur PC, CENTRE reste complète. Le changement de résolution ne modifie aucune coordonnée de jeu essentielle.
- Décor : extension uniquement dans HAUT et BAS. Les gouttières latérales appartiennent au Core et ne reçoivent pas de décor propre au jeu.
- Ergonomie : mesurer les tailles affichées, textes longs et zones touchables sur le plus petit viewport retenu. « Ça tient » ne vaut pas « c'est lisible et jouable ».
- Images : choisir la résolution à partir de la taille affichée maximale et de la densité utile, pas de la résolution maximale du générateur. Mesurer téléchargement, décodage, temps de chargement et mémoire ; `largeur × hauteur × 4` donne une estimation RGBA, pas une mesure totale GPU.
- Rendu : vérifier backbuffer et résolution des textes sur haut DPI. Préférer textures partagées, effets bornés et chargement utile ; pause/destruction des scènes et audio inactifs. Mesurer avant d'ajouter des passes plein écran ou un atlas gigantesque.
- Définir dans le suivi un appareil/résolution de référence et des budgets adaptés au jeu : cible de fluidité, chargement initial, textures, effets simultanés. Réduire les effets avant de sacrifier lisibilité et géométrie. Ne pas annoncer « optimisé mobile » après un build desktop.

## 8. Sons, musique, cover et cohérence globale

Planifier ces éléments avec la DA ; produire la cover définitive lorsque le gameplay tient sa promesse visuelle. L'audio peut avancer en parallèle dès que GD et événements sont stables.

**Son et musique**

1. Définir une intention sonore liée à l'univers et au rythme du geste. Préparer une table `événement du jeu → son/effet visuel → intensité/cooldown` : action, erreur, succès, annulation, fin, etc., selon les besoins.
2. Réutiliser le vocabulaire SFX partagé puis les accents du jeu. Ajouter les sons spécifiques nécessaires. Éviter de sonoriser tous les ticks automatiques ou d'accumuler les sons en cas d'actions rapides.
3. Proposer et faire écouter les musiques dans l'Audio Lab. Conserver identifiants, sources symboliques, choix et versions archivées selon [MUSIC_LAB.md](MUSIC_LAB.md). Une piste existante est réutilisée lorsqu'elle est déjà retenue.
4. Définir entrée, boucle, intensités/transitions utiles et sortie. Synchroniser les variations musicales lorsque pertinent ; le score et les inputs ne dépendent pas de l'audio sauf mécanique rythmique explicite.
5. Intégrer au Core Audio : un contexte partagé, buses, fades, handles nettoyés ; Phaser `noAudio`. Tester musique et SFX ensemble, mute, pause, changement de jeu, arrière-plan/retour et premier geste après refresh. Distinguer tests navigateur et appareils physiques.

**Cover et entrée dans le jeu**

1. Suivre [DA_COVER.md](DA_COVER.md) : cohérence avec le sens du jeu, sans obligation de reprendre le médium, la palette ou la composition du gameplay. Une demande d'exploration autorise plusieurs études ; finir la principale concerne la production après sélection, pas une interdiction de comparer des pistes. Prévoir titre et zones des contrôles Core ; pas d'UI Core dessinée dans l'image.
2. Pour une cover animée, produire les couches séparées et une image statique de repli ; utiliser le runtime Phaser partagé. Une cover statique peut rester un raster Core.
3. Prévoir l'entrée/sortie du jeu : cohérence de palette, échelle, son et temps de chargement. Réutiliser le comportement Core ; une nouvelle capacité commune se développe comme chantier plateforme explicite.
4. Tester sélection, interaction, état inactif, mouvement réduit et absence de double lecture audio. Les éditions alternatives et déblocages restent optionnels ; ne pas les multiplier avant de finir la principale.

**Sortie production :** les composants requis sont intégrés et vérifiés ; les éléments volontairement absents ont une raison. Une musique choisie mais non branchée, une cover générée mais non synchronisée ou une animation décrite mais non codée restent à faire.

## 9. Bêta produite → Fugg : validation et livraison

Faire une revue de bout en bout. Adapter les scénarios au jeu, sans multiplier les tests sans objet.

| Domaine | Preuve attendue |
| --- | --- |
| GD | Partie compréhensible, décisions intéressantes, équilibre essayé, limites/scoring contrôlés |
| Boucle Core | Entrer, jouer, finir une fois, rejouer, quitter ; score et navigation corrects |
| États visuels | Vide, action en cours, progression, saturation, erreur, annulation, disponible/indisponible, fin selon le jeu |
| Écrans/input | Petit téléphone, téléphone long, tablette, desktop dans sa surface Core, haut DPI ; tactile et souris/clavier/manette selon support annoncé |
| Art et mouvement | Comparaison à la DA, contenus non occultés, effets lisibles et bornés, réduction de mouvement prévue |
| Audio | Écoute du mix final, transitions, mute, interruption/reprise et nettoyage |
| Chargement/performance | Chargement à froid, fichiers disponibles, fluidité et coût sur cible mobile ou limite explicitement reconnue |
| Accessibilité/localisation | Instructions et contrôles compréhensibles, symboles en plus des couleurs, textes non baked, formats longs/locaux nécessaires |
| Technique | Typecheck/build et tests pertinents, erreurs console examinées, aucune ressource/listener fantôme |
| Livraison | Commit, `main`, déploiement puis ouverture de la version livrée, chacun vérifié ou marqué non vérifié |

Présenter une version concrète à l'utilisateur pour la validation du plaisir et de la finition. Une autorisation déjà donnée vaut pour les opérations qu'elle couvre : ne pas redemander chaque intégration ou réglage. En revanche, une approbation de DA n'est pas une acceptation automatique du jeu fini.

Promouvoir au statut `fugg` lorsqu'il satisfait ces critères et le choix de curation utilisateur, puis mettre à jour le registre et le suivi. Ne pas déclasser en masse le catalogue historique à la création de cette notice. Les shells Capacitor/Electron et la certification des stores restent des chantiers distincts ; conserver la portabilité sans en faire un obstacle artificiel à la sortie web.

Après livraison, inscrire bugs observés, retours, décisions et prochain petit chantier. Un jeu peut être Fugg avec des améliorations optionnelles restantes ; elles ne doivent pas masquer un défaut bloquant.

## 10. Suivi obligatoire et reprise entre discussions

Un fichier **`src/games/<id>/GAME_STATUS.md`** est la fiche de situation. Le créer pour un nouveau jeu et lors de la prochaine intervention substantielle sur un jeu existant. Ne pas inventer un historique pour remplir les fiches de tout le catalogue.

Au début d'une reprise : lire la fiche et les décisions, inspecter le `main` courant et les travaux locaux, consulter les discussions référencées si nécessaire. Le nom de la discussion, son lien/ID et les décisions utiles doivent suffire à retrouver le contexte sans relire des centaines de messages.

À la fin de chaque passe significative ou avant une transmission : mettre à jour la fiche avec preuves, limites et prochaine action. Une nouvelle décision, une validation utilisateur, un changement de périmètre, un test échoué ou une livraison déclenchent aussi sa mise à jour. Regrouper ces mises à jour avec le travail concerné.

Valeurs de suivi : **à faire / en cours / à vérifier / validé / bloqué / sans objet**. « Validé » exige une preuve adaptée : choix utilisateur pour la DA, fichier contrôlé pour un export, essai en jeu pour une intégration. Une déclaration dans une ancienne conversation est une indication à vérifier, pas une preuve suffisante. Indiquer l'âge et le commit de l'observation ; ne pas inventer un pourcentage global.

Modèle compact à adapter :

```markdown
# <Jeu> — Suivi de création
Mis à jour : <date>. Base inspectée : <commit>.
Phase : <phase réelle>. Maturité : <prototype/bêta/Fugg et éventuelle réserve>.
Statut registre : <valeur constatée>. Runtime/migration/cover : <valeurs>.
Livraison : <local/branche/main/déployé, lien et preuve ou non vérifié>.
Séquence initiale : <N/10 en cours, terminée ou historique inconnu>.

## Intention et décisions retenues
<Boucle, règles, fin/reprise, contraintes, décisions utilisateur datées.>
Références : <GD si distinct, ART_DIRECTION.md, ASSET_MANIFEST.md, discussion, images>.
Contrat artistique : <lien vers identité, références approuvées, rejets, mouvement/son et marge de décision dans ART_DIRECTION.md>.

## Avancement
| Lot | État | Réalisé / preuve | Reste / critère de sortie |
| --- | --- | --- | --- |
| Prototype et boucle Core | ... | ... | ... |
| GD et équilibre | ... | ... | ... |
| Composition et inputs | ... | ... | ... |
| DA | ... | ... | ... |
| Assets / intégration | ... | ... | ... |
| Animations / éclairages / FX | ... | ... | ... |
| SFX / musique / mix | ... | ... | ... |
| Cover / transition | ... | ... | ... |
| Performance / multi-écran / QA | ... | ... | ... |
| Curation / livraison | ... | ... | ... |

## Prochaines actions
1. <Action concrète + résultat attendu.>
2. <Dépendance éventuelle.>
Décisions attendues : <question + options + recommandation, ou aucune>.
Travaux parallèles : <responsable/discussion, fichiers, dépendances, ou aucun connu>.
Blocages : <preuve, impact, contournement possible, ou aucun>.

## Vérifications et limites
<Date, commit, viewport/appareil, scénario, résultat, capture/log durable si utile.>
<Budgets de performance retenus et mesures ou à mesurer.>

## Derniers changements / enseignements
<Bref historique des décisions utiles ; Git conserve le détail technique.>
```

À « où en est le projet/jeu ? », répondre en langage simple : **phase actuelle ; fait ; reste ; décisions nécessaires ; prochaine action ; état de livraison**. Si la demande porte sur tout MiniFugg, agréger les fiches existantes et le registre en signalant les jeux non audités. Ne pas exiger que l'utilisateur ouvre un document.

ChatGPT/Codex peuvent proposer, coder et produire selon les outils effectivement accessibles. Ne pas promettre un upload Drive, une génération, une manipulation de Phaser Editor ou un déploiement sans disposer du moyen de le faire. Préparer le résultat transférable si un accès manque et nommer précisément ce qui reste. Le dépôt évite la dépendance à la mémoire d'une discussion.

Paralléliser les lots indépendants lorsque demandé : par exemple musique avec événements fixés et assets avec composition fixée. Affecter des périmètres de fichiers, lire le dernier `main`, intégrer par étapes et vérifier l'ensemble. Ne pas faire éditer simultanément le même renderer ou accepter des assets dont la géométrie change encore.

## 11. Maintenir cette notice et apprendre des jeux

Mettre à jour cette notice lorsqu'une expérience révèle une étape manquante, une ambiguïté récurrente ou un changement de méthode validé. Mettre les détails propres au jeu dans sa fiche ; corriger une règle technique dans son document spécialisé et actualiser ici le lien ou l'étape concernée. Conserver un bref journal des évolutions ci-dessous. Éviter de créer une procédure concurrente par conversation.

Premiers enseignements de LineFugg :

- un master aplati valide une intention, pas un background exploitable ;
- les zones utiles, ouvertures et marges alpha doivent être mesurées avant intégration ;
- les états dynamiques et les emplacements décoratifs doivent partager leurs ancrages ;
- un panneau ne doit pas être écrasé pour compenser un mauvais ratio ;
- les accessoires que l'on souhaite animer doivent être produits séparément ;
- FIT préserve la géométrie mais ne garantit ni lisibilité ni qualité tactile ;
- un build réussi ne valide pas l'art, le responsive, le son ou le plaisir ;
- toute conclusion d'audit doit distinguer observation, mesure, estimation et proposition.

Journal : 2026-09-07 — première version, parcours progressif demandé par l'utilisateur, suivi par jeu, production guidée par le moteur et clarification du périmètre des dix prompts. Précision utilisateur : génération Codex locale → fichiers directs et commit ; Drive réservé au transfert depuis ChatGPT sans accès au dépôt.

## 12. Références spécialisées

| Sujet | Document canonique |
| --- | --- |
| Règles de travail et contrat du jeu | [AGENTS.md](../AGENTS.md), [GAME_DEV_SPEC.md](../GAME_DEV_SPEC.md) |
| Instructions du projet ChatGPT | [PROJECT_GAME_PROMPT.md](../PROJECT_GAME_PROMPT.md) |
| Contexte et historique | [codex.md](../codex.md) |
| Moteur et migrations | [GAME_ENGINE_ARCHITECTURE.md](GAME_ENGINE_ARCHITECTURE.md), [GAME_MIGRATION_PLAN.md](GAME_MIGRATION_PLAN.md) |
| Composition, orientation, contrôle | [GAME_LAYOUT_SYSTEM.md](GAME_LAYOUT_SYSTEM.md), [ORIENTATION_LAYOUT.md](ORIENTATION_LAYOUT.md), [INPUT_GESTURES.md](INPUT_GESTURES.md) |
| Exploration graphique | [STYLE_SYSTEM.md](STYLE_SYSTEM.md) et `ART_DIRECTION.md` du jeu |
| Décomposition artistique | [GAME_ART_PRODUCTION_PIPELINE.md](GAME_ART_PRODUCTION_PIPELINE.md) et `ASSET_MANIFEST.md` du jeu |
| Transport des images | [ASSET_PIPELINE.md](ASSET_PIPELINE.md) |
| Audio runtime et création | [AUDIO_SYSTEM.md](AUDIO_SYSTEM.md), [MUSIC_LAB.md](MUSIC_LAB.md), [AUDIO_VALIDATION.md](AUDIO_VALIDATION.md) |
| Covers et frontière Core | [WELCOME_ILLUSTRATIONS.md](WELCOME_ILLUSTRATIONS.md), [GAMEPLAY_SHELL.md](GAMEPLAY_SHELL.md) |
| Curation, économie, distribution | [GAME_CURATION.md](GAME_CURATION.md), [PLATFORM_ECONOMY.md](PLATFORM_ECONOMY.md), [PLATFORM_EXPORTS.md](PLATFORM_EXPORTS.md) |
