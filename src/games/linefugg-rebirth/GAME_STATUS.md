# LineFugg Rebirth — intégration T02

## Périmètre et décision — 18 septembre 2026

L'utilisateur a validé le rendu T02 pour intégration, avec de petites réserves sur les alignements et tailles des chiffres. Son instruction est explicite : Rebirth sert aux essais ; **aucun fichier du jeu original `src/games/linefugg/` n'est modifié**.

Rebirth avait une première implémentation conditionnelle dans la scène classique. Le routeur du runtime de Lab envoie désormais cette seule variante vers `LineFuggRebirth`. L'ancienne entrée classique reste exactement la même et ne charge pas l'atlas T02.

Accès : `/?usr=moigod&lab=gameplay-runtime&game=linefugg-rebirth`. L'ancienne URL `game=linefugg&skin=rebirth-editorial` reste un alias dans ce Lab uniquement. Aucun ajout au feed/catalogue public ni au classement officiel. Le bouton Recommencer appartient au runtime de Lab.

## Réalisation

- Phaser 4, host Core existant, stage 390 × 850, zone essentielle y=80..779 ; densité raster 1–2 sans changement de coordonnées.
- Atlas T02 exact, glyphes bitmap et préfixes ×/÷, formules et valeurs dynamiques, trois tracés translucides recomposés en textures (opacité appliquée au groupe).
- Tracé tactile/souris, sélection clavier flèches/Espace, U/Backspace pour Undo, Entrée pour Validate ; bindings manette prévus, matériel non testé.
- Lignes droites de 2–5 cellules, une intersection maximum par paire, reroll déterministe des cases libres, Undo restaure plateau/états, validation explicite après trois lignes et fin une seule fois.
- Scope numérique de ce pilote approuvé : pas de moins. Distribution Rebirth 84 % additions positives, 12 % ×, 4 % ÷ ; **la distribution 68/16/12/4 et les valeurs négatives du classique sont conservées sans modification**.
- Boutons `off/on/hover/pressed`, annulation en sortant du bouton ; pastilles on/off ; glyphes adaptés au champ disponible. Aucun texte mutable dans le fond.
- Reroll en cascade des glyphes ; reduced motion sans cascade. Audio local désactivé par le host ; pas de nouveau son ou changement de piste.

## Preuves et état de livraison

Première passe locale : syntaxe TypeScript transpilée ; six tests de règles passent. Le contrôle local des empreintes classiques n'est pas exécutable sans les fichiers du dépôt : il est prévu dans la CI sur checkout complet, et ne doit pas être annoncé comme réussi avant exécution.

La CI dédiée `Rebirth runtime checks` compile le dépôt complet, compare les empreintes des fichiers classiques, exerce les entrées réelles dans Chromium et conserve les captures/rapport. Les résultats de cette CI et la publication restent à vérifier sur le commit de livraison.

Pas de validation Safari, téléphone physique ou manette matérielle. Pas de preuve d'indépendance vis-à-vis du modèle de conversation ; pas d'essai Crazy Papers dans ce lot. Voir `.agents/skills/minifugg-art/references/VALIDATION.md` pour T01/T02 et le protocole DA validée puis découpe séparée.
