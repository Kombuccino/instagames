# GAME IDEA — Access Granted?

> **Status:** IDEA ONLY — do not build yet  
> **Working title:** Access Granted?  
> **Genre:** Trick quiz / comedy / micro-runner  
> **Format:** Portrait-first, browser/mobile  

## 1. Concept d'origine

Le jeu commence sans annoncer qu'il a commencé. Il ressemble d'abord à un banal écran d'accès de site : « Avez-vous plus de 13 ans ? », puis « Avez-vous plus de 18 ans ? », etc.

Très vite, les questions deviennent de plus en plus étranges et n'ont plus grand-chose à voir avec l'âge ou un contrôle d'accès. Elles dérivent vers un quiz de culture générale très large, avec des questions parfois absurdes, pointues ou inattendues.

La règle est simple : **si le joueur donne une mauvaise réponse, il n'a pas le droit de jouer**. S'il réussit toute la chaîne de questions, il obtient enfin l'accès au « vrai jeu ».

Le gag est que ce vrai jeu est volontairement nul : un petit runner minimaliste, dans l'esprit du runner hors-ligne de Chrome, avec un personnage qui saute par-dessus des obstacles.

Mais les questions précédentes ne disparaissent pas complètement : chaque question peut avoir semé un objet, un personnage, une référence ou un symbole qui réapparaît ensuite comme obstacle ou élément du runner.

Le twist central est donc que **le faux formulaire d'accès est en réalité le jeu principal**, et le « jeu enfin débloqué » n'est qu'une récompense volontairement dérisoire.

## 2. Pitch

**Répondez correctement à une série de contrôles d'accès de plus en plus absurdes pour enfin mériter de jouer… à un jeu minable.**

Le joueur pense qu'il est encore dans un écran préliminaire alors que la partie a déjà commencé.

## 3. Boucle de gameplay

1. Une question d'apparence administrative apparaît.
2. Le joueur choisit une réponse.
3. Bonne réponse : l'accès semble progresser et la question suivante devient légèrement plus bizarre.
4. Mauvaise réponse : refus d'accès / fin de tentative.
5. Après une série complète réussie, le « vrai jeu » est déverrouillé.
6. Un runner très simple commence, rempli de références aux questions précédentes.

Le cœur du score / classement reste à décider :
- nombre de questions franchies ;
- série parfaite ;
- temps de réponse ;
- éventuellement distance dans le runner final.

## 4. Progression et ton

La montée doit être graduelle :

- **Début :** questions crédibles de portail web : âge, conditions, consentement, région, etc.
- **Milieu :** culture générale simple puis de plus en plus éclectique.
- **Fin :** questions franchement inattendues, absurdes ou très spécifiques, mais toujours avec une vraie réponse juste.
- **Récompense :** annonce solennelle du type « ACCESS GRANTED », suivie d'un runner volontairement pauvre.

Important : le jeu ne doit pas devenir un questionnaire scolaire. Le plaisir vient du contraste entre la gravité bureaucratique de l'interface et l'absurdité croissante des questions.

Les mauvaises réponses peuvent produire des refus de plus en plus ridicules plutôt qu'un simple « faux » : accès refusé, formulaire expiré, utilisateur jugé inapte, etc.

## 5. Runner final

Le runner doit rester volontairement basique : une action principale, **sauter**.

Sa fonction est surtout comique et rétrospective. Les éléments rencontrés peuvent venir directement du quiz :
- un animal cité dans une question devient un obstacle ;
- une planète apparaît dans le décor ;
- un personnage historique traverse l'écran sous forme simplifiée ;
- un objet associé à une réponse devient un projectile ou un obstacle.

Le runner peut donc servir de petite « mémoire visuelle » de la tentative qui vient d'être réussie.

Ne pas surproduire cette partie : si le runner devient réellement meilleur que le quiz, le concept perd sa chute.

## 6. Direction artistique & son

### Visuel
- Début extrêmement crédible : esthétique portail web / vérification d'âge / formulaire légal.
- Interface progressivement légèrement dérangée sans révéler trop tôt la blague.
- Transitions propres et presque trop sérieuses.
- Runner final volontairement cheap, simple et disproportionnellement moins ambitieux que le parcours nécessaire pour y accéder.

### Son
- Début quasi silencieux avec petits clics, confirmations et sons administratifs propres.
- À mesure que les questions deviennent absurdes, introduire discrètement des sons plus étranges.
- Gros jingle triomphal à l'accès final, immédiatement suivi d'une musique de runner médiocre / minuscule volontairement comique.

## 7. V0 à construire quand le concept sortira de l'incubateur

Prototype minimal :

1. 12–15 questions prédéfinies.
2. Deux à quatre réponses par question.
3. Début crédible avec 2–3 questions de type contrôle d'accès.
4. Dérive progressive vers culture générale puis absurdité.
5. Mauvaise réponse = tentative terminée.
6. Une transition « ACCESS GRANTED » volontairement grandiose.
7. Runner mono-bouton de 20–30 secondes.
8. 4–5 obstacles du runner directement issus des questions précédentes.

**Question décisive du prototype :** est-ce que le joueur réalise assez tard que le questionnaire est le vrai jeu, et est-ce que le runner final produit une vraie chute comique plutôt qu'une simple déception ?

## 8. Points de vigilance

- Les questions doivent avoir des réponses vérifiables et non ambiguës ; l'injustice tuerait immédiatement la blague.
- Ne pas rendre les premières questions trop absurdes : il faut préserver l'illusion d'un écran d'accès réel.
- Éviter un quiz trop long ; l'échec tardif doit donner envie de recommencer, pas d'abandonner.
- Prévoir de nombreux pools de questions pour limiter la mémorisation pure si le jeu est rejoué.
- Le runner final doit être mauvais **par intention artistique**, pas techniquement cassé ou désagréable à contrôler.
- Le titre reste provisoire ; aucun nom n'a encore été validé par l'utilisateur.
