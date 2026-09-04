# GAME IDEA — Ma2t the Dev

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Ma2t the Dev  
> **Genre:** Arcade / click-shooter / attention-defense  
> **Format:** Mobile/browser, likely portrait or square  
> **Tech:** Open — 2D, isometric, lightweight 3D or stylised office scene

## 1. Concept

Ma2t est un développeur aux cheveux longs et à la belle barbe, installé devant son écran dans un bureau / open space. Quand tout va bien, il tape sur son clavier mécanique, le code défile proprement en vert et les frappes forment presque une petite rythmique satisfaisante.

Le joueur ne code pas : il protège le **flow** de Ma2t.

Des perturbations apparaissent autour de lui : collègue qui vient parler, bug, email, notification, boss avec une nouvelle feature, discussion trop bruyante, distraction, etc. Chaque menace affiche un **timer circulaire** indiquant le temps restant avant qu'elle ne perturbe Ma2t.

Le gameplay principal est volontairement simple : **cliquer/taper directement sur les perturbations pour les éliminer avant la fin de leur timer**.

Certaines disparaissent en un clic. D'autres sont plus résistantes et demandent plusieurs clics successifs. Exemple : un boss venu demander une feature absurde peut nécessiter 5 ou 6 clics, chaque clic déclenchant une nouvelle objection / réplique de développeur avant qu'il abandonne.

Mais tout ce qui bouge dans le bureau n'est pas une menace. Des collègues innocents, discussions normales ou événements de fond peuvent apparaître. Cliquer sur eux par erreur perturbe aussi Ma2t et dégrade son flow.

Le cœur du jeu devient donc : **viser vite, mais ne pas tirer sur tout**.

## 2. Pitch

**Défends le flow de Ma2t comme dans un shooter arcade : élimine bugs, notifications et demandes de features avant qu'elles n'atteignent son cerveau — sans agresser les innocents de l'open space.**

Plus Ma2t est tranquille, plus son code est beau, rapide et vert. Plus tu rates de menaces ou cliques n'importe où, plus son écran dégénère en bouillie rouge.

## 3. Boucle de gameplay

1. Ma2t code automatiquement et génère des points.
2. Des personnages / objets / notifications apparaissent dans différentes zones du bureau.
3. Les vraies perturbations affichent un timer circulaire qui se vide.
4. Le joueur clique sur la menace avant expiration.
5. Une petite menace disparaît immédiatement ; une menace forte possède plusieurs points de résistance.
6. Si le timer expire, la perturbation atteint Ma2t : baisse de flow, code dégradé, production ralentie.
7. Si le joueur clique sur un innocent : pénalité immédiate de flow.
8. Maintenir un flow élevé active accélération, multiplicateur et code de plus en plus satisfaisant.

La difficulté augmente par le nombre d'éléments présents, la vitesse des timers, les menaces résistantes et la ressemblance entre menace et innocent.

## 4. Menaces, innocents et résistance

### Menaces possibles
- **Notification / email** : 1 clic, rapide et fréquent.
- **Bug** : 2–3 clics, peut réapparaître ailleurs.
- **Collègue interrompant** : 2 clics.
- **Feature request** : 3–5 clics.
- **Boss / gros demandeur** : mini-boss à 5–8 clics avec timer plus long.
- **Réunion improvisée / groupe bruyant** : plusieurs cibles liées ou menace de zone.

Chaque menace peut avoir :
- temps avant impact ;
- nombre de clics requis ;
- pénalité si elle atteint Ma2t ;
- mouvement / animation ;
- banque de répliques associée.

### Innocents
Des éléments de fond apparaissent sans vouloir interrompre Ma2t : collègues qui passent, quelqu'un qui boit un café, conversation éloignée, personne qui apporte quelque chose sans le déranger, etc.

Ils servent à empêcher le spam : **un mauvais clic doit coûter assez cher pour obliger à identifier la cible avant de frapper.**

## 5. Répliques de développeur

Le joueur ne choisit plus une catégorie de réponse. Les réponses deviennent du **feedback humoristique automatique**.

À chaque clic valide sur une menace, Ma2t peut sortir une courte objection adaptée :
- refus ;
- excuse technique ;
- rejet de responsabilité ;
- impossibilité supposée ;
- argument de délai ;
- remarque sarcastique.

Sur les grosses menaces, chaque point de résistance peut déclencher une nouvelle objection, ce qui transforme le combat en petite dispute comique.

Prévoir une banque importante de phrases courtes afin d'éviter la répétition.

## 6. Flow, code et score

Le score correspond au code produit pendant que Ma2t travaille. La jauge de flow contrôle la vitesse de production et doit surtout être visible **dans le code lui-même**.

- **85–100 % :** code vert très propre, clavier fluide, vitesse élevée, multiplicateur / focus streak.
- **60–85 % :** petites anomalies bleues/jaunes, rythme moins parfait.
- **30–60 % :** erreurs visibles, rouge qui apparaît, production ralentie.
- **0–30 % :** code rouge dégueulasse, warnings, Ma2t exaspéré, rendement très faible.

Rater une menace, laisser expirer son timer ou toucher un innocent fait baisser la jauge.

Rester longtemps au-dessus d'environ 85 % fait accélérer progressivement le code et augmente les bonus. Une grosse perturbation casse le streak.

## 7. Direction artistique & son

### Visuel
- Ma2t reste le centre affectif de la scène : cheveux longs, barbe, développeur heureux quand il est en flow.
- Bureau/open space lisible comme une petite arène de shooter.
- Les timers circulaires doivent être visibles immédiatement sans transformer l'écran en HUD illisible.
- Les menaces fortes peuvent avoir une présence plus spectaculaire ; le boss avec sa feature doit presque ressembler à un mini-boss arcade.
- Le code passe visuellement du paradis vert propre au chaos rouge.

### Son
Le clavier mécanique est fondamental : quand tout va bien, ses frappes constituent presque la musique du jeu.

SFX : clics/tirs légers, switches mécaniques, notifications pénibles, erreurs de compilation, voix/grognements, petites réactions des personnages et stingers de streak.

Plus le flow monte, plus la rythmique du clavier et la bande-son s'enrichissent. Une interruption importante doit casser cette continuité sonore.

## 8. Assets principaux

Pour une V0 :
- Ma2t assis + états heureux / concentré / agacé ;
- bureau, écran et clavier ;
- rendu animé du code propre / dégradé ;
- 4 types de menaces ;
- 2 types d'innocents ;
- timers circulaires ;
- une menace résistante type boss/feature ;
- jauge de flow ;
- feedback de clic / impact ;
- banque SFX clavier, notifications et répliques.

Toute image produite devra suivre `docs/ASSET_PIPELINE.md`.

## 9. V0 à construire quand le concept sortira de l'incubateur

1. Ma2t + écran de code animé.
2. Une jauge de flow de 0 à 100.
3. Trois menaces à 1 clic.
4. Une menace résistante à 5 clics.
5. Deux innocents qu'il ne faut pas toucher.
6. Timer circulaire sur chaque menace.
7. Pénalité si timer expiré ou innocent touché.
8. Dégradation graphique du code selon le flow.
9. Score produit automatiquement selon la qualité du flow.
10. Focus streak au-dessus d'environ 85 %.

**Question décisive du prototype :** est-ce que distinguer très vite menaces et innocents, tout en gérant des cibles à résistances différentes, crée une tension arcade réellement amusante ?

## 10. Points de vigilance

- Cette version est probablement plus immédiate et plus MiniFugg que le système précédent de 3–4 boutons de réponse.
- Ne pas transformer le jeu en pur tap frénétique : les innocents sont essentiels.
- Les timers doivent créer de l'urgence sans masquer les personnages.
- Les grosses menaces doivent être drôles à marteler, pas pénibles.
- L'humour vient autant des réactions de Ma2t que des situations de bureau.
- La meilleure récompense reste sensorielle : beau code, clavier parfait, rythme fluide et Ma2t enfin tranquille.
