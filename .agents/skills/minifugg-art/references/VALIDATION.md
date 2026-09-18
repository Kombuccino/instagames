# Validation de minifugg-art

Suivi du skill, pas une nouvelle autorité artistique. Mis à jour le 18 septembre 2026. Base de la validation initiale : `1c84696421a4c455a908a4e51a74c75fff0377ab`.

## Essai de mise en place Qwen-Image-Layered — 18 septembre 2026

Base de reprise inspectée : `main` à `d710a97267d64b9b0ccaa4eb73155b1e2d8b2f2f`. L'utilisateur demande de mettre en place les outils existants et d'essayer la décomposition, sans développer davantage le Lab ni lui imposer un formulaire.

- **État courant : fal est connecté ; l'essai est bloqué par le crédit du compte, pas par l'installation.** Le catalogue et le schéma de `fal-ai/qwen-image-layered` ont été lus via le connecteur. Il accepte une image URL, 1 à 10 calques, une description facultative de l'image et des sorties PNG. Le catalogue de prix consulté retourne `0.05 USD / images` ; ne pas en déduire un coût total par décomposition sans confirmer le décompte des sorties.
- L'unique tentative `upload_file` depuis l'URL de la référence GitHub a été refusée à l'étape d'initialisation : HTTP 403, `balance_exhausted`. Aucun transfert réussi et aucune requête d'inférence soumise. Le service demande de créditer le compte fal connecté dans Dashboard → Billing. Aucun achat, changement de compte ou nouvel essai automatique effectué ; ne pas demander de clé secrète dans le chat.
- Autre route examinée lors de la passe précédente : démonstration officielle Qwen sur Hugging Face. Les appels réseau depuis le conteneur échouent à la résolution DNS ; l'accès à la configuration/API de la Space n'a pas abouti via les outils disponibles. Cela ne prouve pas que la Space est en panne. Aucun GPU CUDA ni variable `FAL_KEY`/`HF_TOKEN` utilisable n'avait été trouvé dans ce conteneur.
- Référence du pilote retrouvée dans `src/games/linefugg/ART_DIRECTION.md` : DA Rebirth registre éditorial/papier tactile. Les deux fichiers `public/assets/generated/linefugg/rebirth/da/linefugg-rebirth-editorial-paper-lab-390x850.webp` et `linefugg-rebirth-editorial-paper-lab-390x850-r2.webp` partageaient à l'inspection précédente le blob `7f0171395341bed5e3c2db0dae9988b6c227294d`. Les tentatives de récupération des pixels dans cette reprise n'ont pas abouti ; leur encodage n'a pas été vérifié. Retrouver/ouvrir le master approuvé lossless avant une production finale, ne pas promouvoir une preview en source finale. Le refus fal à l'initialisation ne prouve pas que son serveur a pu lire l'URL GitHub.
- **Résultat réel : connexion et modèle confirmés, transfert bloqué ; zéro décomposition, zéro calque généré, aucun SDK ou adaptateur ajouté, aucune intégration ni comparaison visuelle effectuée.** Aucun coût d'inférence engagé.
- Reprise après crédit du compte : récupérer et ouvrir la référence exacte, vérifier son accessibilité au fournisseur, lancer un petit essai PNG, sauvegarder les calques RGBA, contrôler alpha/géométrie et recomposer pour comparaison. Les pertes et regroupements incorrects doivent être examinés avant toute modification du jeu. Ne pas annoncer de gain de temps ni de fidélité sans cet essai. Pas de tâche de fond ni de notification ultérieure programmée.

Sources : [Qwen officiel](https://huggingface.co/Qwen/Qwen-Image-Layered), [Space officielle](https://huggingface.co/spaces/Qwen/Qwen-Image-Layered), [API fal](https://fal.ai/models/fal-ai/qwen-image-layered/api). Canva reste une alternative non installée et non testée ; ne pas demander plusieurs connexions avant d'avoir évalué le premier candidat.

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
