# Validation de minifugg-art

Suivi du skill, pas une nouvelle autorité artistique. Mis à jour le 11 septembre 2026. Base examinée : `1c84696421a4c455a908a4e51a74c75fff0377ab`.

## Périmètre autorisé

L'utilisateur a validé la reprise des consignes, du skill graphique, des contrôles, des essais et des traces de résultat. Le bilan hebdomadaire est **reporté** : aucun skill de revue, tâche récurrente ou changement de paramètres de compte n'est inclus. Le lieu éventuel de cette future revue sera rediscuté ; ne pas supposer les accès d'un autre environnement.

Aucune DA, image canonique, règle de jeu, version produit ou interface runtime n'est remplacée par cette passe documentaire/outillage. Les modifications de consignes restent ciblées : covers statiques, frontière Welcome, sources propres vs annotations et transport local/Drive.

## Contrôles exécutés

| Contrôle | Résultat observé | Limite |
| --- | --- | --- |
| Bases des documents modifiés | Empreintes Git des sources reconstruites contrôlées contre les blobs lus sur GitHub | Lecture ciblée, pas audit exhaustif de tout le dépôt ou de toutes les conversations |
| Outillage Python | 18 tests `unittest` réussis localement, Python 3.13.5 / Pillow 12.3.0 | Ne teste pas le chargement natif dans Codex ni un générateur |
| Export de comparaison | Tests de pixels RGBA exacts, alpha extérieur, coordonnées, absence de labels, sources inchangées et refus d'écrasement | Comparaison technique, pas choix artistique |
| Tests négatifs | Faux PNG/JPEG, absence d'alpha, fichier vide/corrompu/animé, mauvaise taille, marges/budget, profils ICC incompatibles et sorties conflictuelles refusés | Aucun OCR ni classifieur de style |
| Fichiers historiques de cette discussion | Trois inspections réelles, détails ci-dessous | Pas des contrôles du build actuellement déployé |

Commande reproductible depuis la racine du dépôt :

```sh
python3 -m unittest discover -s .agents/skills/minifugg-art/scripts -p 'test_*.py' -v
```

Premier essai local du script : l'ordre de lecture EXIF/validation PNG causait une erreur ; corrigé en vérifiant avant la seconde ouverture et le décodage. Les 18 tests ont ensuite réussi. Cet incident d'outillage ne compte pas comme une reprise de génération graphique.

### Mesures de fichiers historiques accessibles

Ces fichiers proviennent des pièces de la conversation. Leur présence n'accorde aucune nouvelle validation artistique ; aucun n'a été modifié.

| Fichier | Mesure | Résultat du contrôle choisi |
| --- | --- | --- |
| `v2-micro-euro.png` | PNG opaque, 941 × 1672 | Refusé **comme nouveau master 390 × 844**, pas rejet de l'illustration historique |
| `logo_rétro_tetramindfck_sur_fond_transparent.png` | PNG, 941 × 1672 ; 1 191 356 pixels totalement transparents ; 381 046 partiels ; 950 opaques | Alpha réellement présent ; bords, texte et aptitude runtime restent à examiner visuellement |
| `UI Overlay sur jaquette.png` | PNG opaque, 1448 × 1086 | Format PNG conforme comme planche historique ; ce n'est ni un asset isolé transparent ni un écran runtime validé |

## Routage : scénarios de recette

Scénarios à utiliser dans l'environnement qui charge le skill. Ils fixent les sorties attendues ; leur présence ne prouve pas qu'un hôte a invoqué le skill. **Déclenchement natif Codex/ChatGPT non testé ici.**

| Demande | Route et résultat attendus |
| --- | --- |
| « Fais les jaquettes de ce jeu » | Cover ; lire registre/références ; images statiques indépendantes ; titre seul sauf autre texte expressément autorisé |
| « Cherche quatre styles pour la refonte de ce jeu » | Game ; capture réelle, géométrie constante, quatre écritures visibles, pas quatre simples recolorations |
| « Isole ce personnage pour l'animer » | Game/asset ; image cible accessible, alpha réel, pivots/occultations ; aucune génération si la cible manque |
| « Corrige seulement les yeux de Fuggy dans le Welcome » | Welcome/édition ; image et identité exactes ; ne pas changer wagon, téléphone ou logo |
| « Décline ce composant UI actif/inactif » | UI ; primitive et référence actuelles, deux états cohérents, textes fonctionnels listés, aucun habillage de board |
| « Montre comment cette DA devient du gameplay » | Game/planche technique ; vignettes propres + annotations séparées ; pas d'intégration complète avant validation |
| « Où en est cette cover ? » | Lecture du suivi ; pas de génération ni de modification de la DA |
| « Quelle différence entre un MD et un skill ? » | Explication ; pas de pipeline de production déclenché |
| « Corrige une collision du jeu » | Code/moteur ; pas de génération graphique automatique |
| « Programme un bilan hebdomadaire » | Hors de ce skill et hors du périmètre actuel ; ne rien planifier au titre de minifugg-art |

## Pilote graphique restant

**Nouvelles générations : 0.** Aucun gain de qualité artistique, de temps d'intégration ou de taux d'acceptation n'est revendiqué à partir des seuls tests techniques. La suite est un petit pilote, en utilisant le dernier `main` et les références réellement ouvertes au moment de l'essai.

1. **Cover :** choisir un jeu réel et préparer un petit comparatif d'écritures distinctes, hors de son catalogue publié. Une image par appel, texte exact listé, PNG statique, règles de cadrage ; assembler sans décor de présentation. Ne pas régénérer/remplacer ses masters déjà approuvés.
2. **Asset gameplay :** choisir un élément d'une DA validée, retrouver le master exact, produire ou extraire proprement l'élément et tester alpha/ancrage/états dans une mini-tranche sans changer le gameplay. Une boîte englobante automatique ne vaut pas détourage sémantique.
3. **UI :** choisir un composant déjà validé, réutiliser ses primitives et référence actuelles, produire seulement les états utiles. L'interface complète/étendue dépend du contrat actuel ; ne pas reprendre une vieille planche au nom ressemblant.

Pour chaque essai, remplir la trace de `docs/DA_CORE.md` dans le suivi concerné : sources, brief et paramètres accessibles, sorties, nombre d'essais connu, textes parasites observés, contrôle technique, examen visuel, coût de préparation effectivement mesuré et retour utilisateur. Les résultats du pilote permettront une correction ciblée du skill, pas la création de quatre procédures concurrentes.

## Critère de clôture

Le lot outillage est vérifiable par ses tests. Le pilote ne sera terminé qu'après production réelle, inspection des fichiers, usage représentatif et retour utilisateur sur les propositions. La découverte native du skill devra être vérifiée dans Codex. Le bilan hebdomadaire reste reporté, indépendamment de cette clôture.
