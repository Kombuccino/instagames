---
name: minifugg-art
description: "Créer, comparer, corriger ou préparer des graphismes MiniFugg : jaquettes/covers, DA gameplay, assets isolés, Welcome et UI. Récupère les références, construit un micro-brief, contrôle et classe les sorties. Pas de génération pour une simple question, un bilan, du code sans art ou de l'audio."
---

# MiniFugg Art

Une seule procédure, quatre routes. Les `docs/DA_*.md` restent les autorités artistiques ; ce skill ne les remplace pas. Aucun bilan hebdomadaire, tâche planifiée ou réécriture autonome de la DA.

## 1. Fixer le périmètre, retrouver la vérité

Lire [ACTIONS](../../../docs/ACTIONS.md), [AGENTS](../../../AGENTS.md) et [DA_CORE](../../../docs/DA_CORE.md) sur le dernier `main`. Noter le commit. Identifier surface, phase et livrable unique avant tout appel d'image. Annoncer seulement ce qui est utile à l'utilisateur.

| Surface | Lecture ciblée | Invariant d'exécution |
| --- | --- | --- |
| Cover / jaquette | [DA_COVER](../../../docs/DA_COVER.md) + [Zones](../../../docs/MINIFUGG_ZONES.md) | Illustration éditoriale statique, pas capture de gameplay ou overlay Core |
| Game / refonte gameplay / asset | [DA_GAME](../../../docs/DA_GAME.md) + suivi du jeu | Vraie mécanique et géométrie ; états dynamiques séparés du décor |
| Welcome / arrivée de l'application | [DA_WELCOME](../../../docs/DA_WELCOME.md) + références de scène/marque concernées | Téléphone tenu ; raccord direct au feed, pas de second jeu dans le téléphone |
| UI / panneau / composant Core | [DA_UI](../../../docs/DA_UI.md) + système et validation UI actuels | Réutiliser les primitives ; vérifier écran complet vs écran étendu sans mélanger leurs DA |

Pour plusieurs surfaces, les traiter séparément, sans transmettre toutes les références à chaque génération. Les lecteurs spécialisés peuvent demander d'autres contrats ; ne charger que ceux nécessaires à la phase. Pour une planche gameplay/intégration, suivre [GAME_ART_PRODUCTION_PIPELINE](../../../docs/GAME_ART_PRODUCTION_PIPELINE.md). Pour les images, lire [ASSET_PIPELINE](../../../docs/ASSET_PIPELINE.md) et [GRAPHIC_ARCHIVE](../../../docs/GRAPHIC_ARCHIVE.md).

Retrouver registre, `ART_DIRECTION.md`, `ASSET_MANIFEST.md`, `GAME_STATUS.md` et corrections accessibles. Ouvrir l'image exacte et noter son rôle et la portée de sa validation. Ne pas transformer une affirmation d'agent en approbation utilisateur. Les références rejetées servent au diagnostic, jamais de modèle. Pour une édition/découpe d'image, ne rien appeler tant qu'une image cible réellement accessible n'est pas identifiée. Une exploration sans référence approuvée est possible si elle est explicitement exploratoire.

## 2. Préparer le micro-brief, pas une présentation

Remplir le [modèle unique](../../../docs/DA_CORE.md#structure-obligatoire-du-micro-brief), sans demander à l'utilisateur de le rédiger. Définir la liste fermée des **textes autorisés** : aucun par défaut pour un asset, titre exact pour une cover, textes fonctionnels pour une UI. Ne pas confondre textes visibles et notes destinées à l'intégrateur.

Exprimer la patte positivement et concrètement selon la DA retenue. Pour une exploration, proposer des directions réellement distinctes ; garder constante la géométrie fonctionnelle en gameplay, laisser le point de vue varier en cover. Une nouvelle palette seule ne constitue pas un nouveau style. Les familles sont des ressources, pas un plafond de créativité.

Une référence principale, plus seulement les références de rôle distinct indispensables. Exclure catalogue, placeholders, autres jeux, historique complet et décors de board. Ne pas recopier les MD dans l'appel d'image. Conserver séparément le contexte de travail de l'agent.

Vérifier ce que l'outil permet réellement : génération/édition, pièces jointes, fond transparent, dimensions, paramètres exposés. Quand un ratio exact n'est pas pris en charge, préparer une source cadrée puis un dérivé explicite selon le contrat ; ne jamais déformer ni prétendre avoir généré directement à une taille non supportée. Si le contexte est transmis implicitement, le signaler dans la trace ; ne pas certifier une isolation qui n'existe pas. Préparer au besoin un paquet autonome pour une session dédiée, sans affirmer l'avoir lancée.

## 3. Produire petit, sauvegarder immédiatement

Exécuter uniquement la phase demandée avec l'outil image disponible (`imagegen`/équivalent), pas une illustration approximée en CSS/Python. Python convient au contrôle et à l'assemblage déterministe, pas au remplacement d'une illustration promise.

Produire chaque direction ou élément indépendamment. Sauvegarder les originaux avant la prochaine génération ; ne pas régénérer une image validée pour la rendre « finale ». Pour comparer, assembler les images déjà produites, sans labels ni habillage ajouté. Pour les assets : fichiers distincts, alpha réel, ancrages et états contrôlés. Pour une planche technique, annotations sur copie/couche séparée ; jamais dans les textures.

Les scripts ci-dessous n'envoient rien et ne modifient pas les sources. Les PNG d'assemblage sont des comparaisons, pas des masters ou des atlas implicitement validés.

## 4. Contrôler séparément art, fichiers et usage

Appliquer les [trois contrôles](../../../docs/DA_CORE.md#contrôles-avant-présentation). Examiner l'image elle-même : sujet, référence, textes parasites, diversité et lisibilité. Puis mesurer format, dimensions, alpha et marges. Enfin essayer les fichiers dans leur usage représentatif avant une grande déclinaison. Aucun score automatique « anti-IA », aucune acceptation artistique déduite du format.

Outils locaux : Python 3.10+ et Pillow (dépendance d'atelier, pas du jeu). Lire `scripts/art_files.py` seulement pour les utiliser/modifier. Depuis la racine du dépôt :

```sh
# Master cover : tailles/format issus du contrat actuel ; aucun redimensionnement.
python3 .agents/skills/minifugg-art/scripts/art_files.py inspect cover.png --size 390x844 --format PNG --alpha opaque
# Asset isolé : marge choisie selon son manifeste, pas un seuil universel.
python3 .agents/skills/minifugg-art/scripts/art_files.py inspect subject.png --format PNG --alpha required --clearance 2
# Comparaison native : ne remplace ni ne modifie les sources, ni un fichier existant.
python3 .agents/skills/minifugg-art/scripts/art_files.py assemble a.png b.png --output comparison.png --columns 2
# Régressions du seul outillage, sans réseau ni génération.
python3 -m unittest discover -s .agents/skills/minifugg-art/scripts -p 'test_*.py' -v
```

`inspect` rapporte format réellement décodé, taille, empreinte SHA-256, pixels transparents/opaques/partiels, limites du contenu et estimation RGBA. `--report` enregistre le résultat sans écraser un fichier existant. `--max-bytes` applique un budget explicite du pipeline. Un succès technique conserve `visual_status: not_checked` : le script ne détecte pas la qualité, les textes ou un damier peint intérieur. WebP/AVIF décodables ne prouvent pas l'encodage lossless ni la compatibilité des shells.

`assemble` conserve les pixels RGBA à taille native, crée un fond extérieur transparent et un index JSON des sources/frames. Pas de resize/crop/lettrage ; profils ICC différents, sources animées ou toile trop grande sont refusés. Vérifier visuellement la couleur finale. Utiliser des dérivés explicites si une échelle commune est nécessaire.

Corriger les défauts avérés sans faire refaire le contrôle à l'utilisateur. Après deux corrections infructueuses du même défaut, diagnostiquer puis changer de méthode ; ne pas épuiser le budget en relances identiques. Ne pas modifier une DA approuvée pour contourner un problème d'outil.

## 5. Archiver, transmettre, dire l'état réel

Appliquer le transport disponible : Codex local ou ChatGPT/Drive. Ne pas publier les comparaisons/rejets dans l'inbox synchronisée pour les archiver. Mettre à jour le suivi existant avec la [trace de passe](../../../docs/DA_CORE.md#trace-courte-par-passe) : sources réellement accessibles, brief, sorties, essais, écarts, contrôles, validation et suite. Ne pas copier les transcriptions privées dans GitHub.

Distinguer explicitement **généré / archivé / importé / intégré / testé / accepté par l'utilisateur**. Un échec ou un accès manquant reste visible. Les essais d'outillage et de routage ne valent pas test du générateur ou activation native du skill. Le protocole pilote et son état sont dans [VALIDATION.md](references/VALIDATION.md).

## Disponibilité

Le skill est défini dans `.agents/skills/minifugg-art/` pour le dépôt. Codex local peut le découvrir dans ce répertoire ; contrôler cette découverte dans l'environnement utilisé, ne pas annoncer une installation universelle. Dans ChatGPT sans activation native, lire ce fichier via GitHub et suivre la même procédure ; cela ne crée aucun outil manquant.

Format de skill et découverte : [documentation officielle](https://learn.chatgpt.com/docs/build-skills), consultée le 11 septembre 2026. Le dépôt reste la source de la procédure, pas une copie personnelle divergente.
