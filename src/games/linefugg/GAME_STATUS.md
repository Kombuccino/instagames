# LineFugg — Suivi de création

Mis à jour : 14 septembre 2026 à 00:10 Europe/Paris. Version : `0.7.0`. Changelog : `CHANGELOG.md`.

Runtime Phaser 4.2.1, stage 390 × 844. Prototype, game design et équilibre validés par l'utilisateur. Direction gameplay active : **Solar Origami**. Cover runtime : current ; quatre références approuvées conservées et quatre restaurations statiques plein cadre actives.

## Décisions acquises

Règles validées : trois lignes droites de cinq cases maximum, une case partagée maximum par paire, calcul dans le sens du tracé, grille quotidienne déterministe, annulation possible après trois lignes, puis validation explicite pour terminer. Depuis le 10 septembre : négatifs limités à −1…−4, diviseurs plus rares, retirage déterministe des cases libres après chaque ligne, flip en cascade et teinte des cases libres selon la prochaine ligne.

DA gameplay : espace bleu nuit, grille compacte de facettes ivoire, trois tracés rouge/violet/jaune, astres de résultat progressivement chargés et soleil central de total. Les quatre covers restent des interprétations éditoriales distinctes du gameplay. Musiques acquises : MF-MUS-0008 et MF-MUS-0009.

Références : [ART_DIRECTION.md](ART_DIRECTION.md), [ASSET_MANIFEST.md](ASSET_MANIFEST.md), [CHANGELOG.md](CHANGELOG.md), [pipeline commun](../../../docs/GAME_CREATION_PIPELINE.md).

## État actuel

| Lot | État | Reste |
| --- | --- | --- |
| Prototype / GD / équilibre | Validés utilisateur | Rien à rouvrir sans nouvelle demande |
| Gameplay Phaser | Fonctionnel et vérifié | Profilage téléphone physique seulement |
| DA gameplay | Solar Origami v2 intégrée ; pack v1 refusé et inactif | Revue artistique finale en jeu |
| Inputs / responsive | Vérifiés en émulation | Contrôle appareil réel recommandé |
| Animations / FX | Sélection, transfert vers les astres et flux vers le soleil intégrés ; mouvement réduit pris en charge | Revue artistique finale en jeu |
| Audio | Musiques conservées | Écoute finale du mix/SFX restant à faire |
| Covers | 4 statiques `390×844` intégrées, ancrées en haut | Revue visuelle utilisateur du lot remis aux normes |
| Assets runtime | Pack Solar Origami v2 actif, WebP lossless et atlases JSON | PNG sources et masters transparents conservés hors chemin actif |
| Livraison | `0.7.0` | Déploiement applicatif distinct de la publication GitHub |

## Optimisation images runtime — 11 septembre 2026

Le gameplay ne référence plus de PNG lourds. Fond CSS, plateau, armillaire, cases spéciales, boutons Valider, ornements du registre, console, indicateurs et verre orange sont tous servis en **WebP lossless pré-dimensionné**. Les PNG sources et les masters approuvés restent conservés ; aucune illustration n'a été régénérée.

Le payload des **11 images nécessaires au gameplay est de 4 573 098 octets (4,57 Mo / 4,36 Mio)**, fond compris. Les quatre covers ne sont pas comptées : elles appartiennent au feed Core et sont chargées séparément du lancement Phaser.

Les trois derniers assets locaux ont été dérivés sans régénération : `accounting-panels.webp` 681 024 octets (1024×683), `glass-indicators.webp` 671 796 octets (1024²), `validate-amber-source.webp` 89 910 octets (256²), contre 5,73 Mo pour leurs trois PNG sources. Leur alpha et leurs pixels visibles après décodage sont identiques à la version runtime redimensionnée avant encodage lossless.

`OrbitalImageFile` et son redimensionnement Canvas au chargement sont retirés : Phaser charge directement les textures préparées. `scripts/test-linefugg-runtime-assets.mjs` verrouille le format des 11 fichiers, leur budget cumulé et l'absence de PNG dans les URLs Phaser actives.

## Vérifications

La version `0.5.5` allège toute la composition sans modifier le gameplay : plateau `280 × 280`, console basse mieux espacée, typographie et FX proportionnés, commandes Annuler/Valider de même diamètre. Le bouton Retour Core suit désormais la même échelle effective que Valider sur PC. Les assertions navigateur verrouillent les limites de la composition et l'égalité des commandes sur téléphone, tablette et PC.

Passe finale sur état combiné : test de budget/formats réussi, `npm run build` réussi, puis matrice LineFugg sur six profils téléphone/tablette/PC et mouvement réduit réussie sans erreur HTTP/JavaScript. Les captures `empty`, `drag`, `reroll`, une ligne, trois lignes et résultat ont été produites ; contrôle visuel de `empty` et `three` conforme à la DA, sans asset manquant ni dégradation évidente.

Les matrices historiques plus larges de `scripts/test-linefugg-browser.mjs` et `scripts/test-linefugg-covers.mjs` restent les références de non-régression multi-écrans. Le coût RGBA après décodage n'est pas réduit par WebP à dimensions identiques ; cette passe cible surtout réseau, stockage et suppression du redimensionnement client.

## Prochaines actions

1. Revue artistique utilisateur de Solar Origami dans le jeu réel.
2. Profilage sur téléphone physique et écoute finale du mix/SFX.

Aucun blocage technique connu. Les règles et l'équilibrage restent inchangés.

## Intégration Solar Origami — 14 septembre 2026

- Le pack v2 devient la DA gameplay active. Le fond spatial, les 17 faces de cases, les trois astres, les quatre états du soleil, les débris, les commandes et les FX sont chargés depuis les dérivés WebP/atlas JSON.
- Les trois longues lignes de calcul sur parchemin sont supprimées. Chaque ligne charge désormais un astre ivoire qui prend sa couleur canonique ; son score raster apparaît au centre et alimente le soleil de total.
- La sélection s'adapte à toute ligne valide par segments tournés et mis à l'échelle entre les centres réels des cases. À la validation, un flux temporaire rejoint l'astre correspondant ; les liaisons astres → soleil restent subtilement animées. En mouvement réduit, les états changent sans trajet prolongé.
- Toutes les valeurs visibles proviennent du tileset raster. Multiplicateurs et diviseurs conservent des silhouettes distinctes. Les commandes transparentes de même taille sont traduites en `UNDO` et `VALIDATE`.
- Le résultat temporaire est placé dans l'espace libre sous la grille pour ne plus masquer les chiffres pendant le tracé. La composition reste intégralement dans la zone PC CENTRE `y=91…753`.
- Le procédé à retenir est consigné dans `TODO.md` : planches exhaustives à alpha réel, contrôle des textes et de la transparence, puis découpe automatique en composants et atlases avant intégration.

## Reprise de la DA gameplay — 13 septembre 2026

- Retour utilisateur : la composition actuelle paraît trop massive et mal calée sur PC ; les trois grands panneaux de résultats sont le principal défaut, car ils consomment beaucoup d'espace, ressemblent à des champs presque vides et relient mal calcul, couleur de ligne et score. L'égalité visuelle des commandes Annuler/Valider reste obligatoire.
- Une première exploration de quatre variantes proches de la DA historique a été produite puis explicitement refusée comme trop similaire et toujours peu convaincante. Elle reste archivée comme recherche rejetée, sans intégration.
- Une seconde exploration a compacté le registre, mais conservait encore sans justification la grille en tuiles, les trois couleurs historiques, les calculs alignés, le total inférieur et les boutons ronds. Elle est refusée par l'utilisateur comme simple restylage et archivée sous `round-02-results-redesign`.
- La troisième exploration repartait uniquement des invariants mécaniques, mais a été refusée : elle rompait trop avec l'identité spatiale et contenait des slogans, panneaux et micro-textes non demandés. Elle reste archivée sous `round-03-full-da-rethink` comme écart de production ; aucune de ses pistes ne doit servir de référence.
- Le pipeline commun et le skill artistique imposent désormais une liste fermée recopiée dans le prompt et un rejet avant présentation de toute chaîne, pseudo-chaîne, valeur ou symbole non autorisé.
- La quatrième exploration conserve le territoire spatial sans reprendre laiton, planisphère, parchemin ni registre d'équations : réseau de balises et noyau, relevé lunaire et canisters, serre orbitale, voiles solaires origami. Les résultats deviennent des objets reliés aux tracés puis convergent vers `51`.
- Liste fermée de la passe : `ANNULER`, `VALIDER`, valeurs du plateau, `8`, `19`, `24`, `51`. Contrôle visuel : aucun autre texte visible ; commandes libellées, alignées et de même gabarit. Sources et comparaison archivées sous `round-04-space-no-extra-text` ; revue utilisateur en cours ; aucune piste acceptée, intégrée ou publiée.
- Retour canvas sur la piste origami : la première composition avait le bon ratio mais plaçait les commandes dans BAS, donc hors de la fenêtre PC centrée. La correction `v3` garde toutes les informations et commandes dans CENTRE `y=91…753`, avec la grille entièrement visible après crop ; HAUT/BAS ne contiennent plus que le décor spatial recadrable. Masters de contrôle : `390×844` et crop PC exact `390×662`, PNG opaques décodés ; contrôle visuel des deux cadrages effectué. Toujours aucune intégration avant validation utilisateur.
- Palette demandée pour la piste origami : ligne 1 et score `8` rouges, ligne 2 et score `19` bleu-violet, ligne 3 et score `24` jaunes, conformément aux covers majoritaires et aux couleurs runtime existantes. Le lien sélection → objet ne doit pas être un ruban persistant : Phaser conserve le tracé dynamique entre centres de cases, puis anime à la validation un transfert temporaire vers le slot de résultat ; seules les trois liaisons fixes résultat → `51` persistent. Cette solution accepte toute position et orientation sans accumuler de croisements. Master et crop PC recolorés, contrôlés et archivés ; comportement encore exploratoire, non intégré.
- Précisions utilisateur : chaque astre de résultat reste blanc/ivoire avant création de sa ligne et ne prend sa couleur canonique qu'après commit ; Undo l'éteint. Multiplicateurs et diviseurs auront des silhouettes distinctes en plus de `×`/`÷`. Le pack prévoit un atlas raster des 17 faces possibles et un atlas numérique/mathématique composable pour les scores. Le flux sélection → astre sera une animation d'énergie temporaire calculée depuis la ligne réelle ; les flux fixes astres → `51` pourront rester subtilement animés. Direction Solar Origami retenue en principe, planche de production et intégration encore à valider.
- Lot de production préparé sous `public/assets/generated/linefugg/solar-origami/` : fond 390×844 et WebP 2×, trois bases de cases, atlas des 17 faces, atlas composable des seize chiffres/opérateurs, tileset généré des lettres/icônes de commandes, six états d'astres, astre total, éclat d'énergie teintable et châssis de bouton unique. Les polices système ont été écartées après retour utilisateur : tous les caractères visibles des aperçus proviennent désormais des deux tilesets ImageGen.
- Planche de traduction livrée en fichiers propres : états zéro/une/deux/trois lignes en MASTER 390×844 et crop PC exact 390×662, plus storyboard quatre temps du transfert. Contrôle visuel agent : astres ivoire et vides avant commit, scores progressifs `0`, `8`, `27`, `51`, opérateurs distincts par silhouette, palette exacte et boutons de même taille ; aucun texte hors allowlist.
- Contrôle technique : fond/aperçus décodés aux dimensions attendues ; tous les atlases et objets isolés ont un alpha réel et des métadonnées de frames. Le tileset numérique brut avait un damier peint malgré le prompt ; il est conservé comme source générée et nettoyé de manière reproductible par sélection des composantes bleu nuit. Deux supports de bouton ImageGen présentant le même défaut ont été rejetés dans l'archive locale ; le châssis final est déterministe. Aucun asset n'est chargé par le jeu à ce stade.
- La version reste `0.6.0` : cette passe ne modifie ni runtime, ni règles, ni assets actifs.
- Retour sur le premier pack de production : refusé pour sa police éloignée de la maquette, ses boutons insuffisamment transparents, ses astres trop blancs et l'absence de vraie décomposition sélection/flux. Il reste archivé et ne doit pas être branché.
- Pack correctif `solar-origami-v2/` : trois grandes planches détourées à alpha réel, puis chaque élément livré seul et en atlas. Inventaire : 6 états de cases, 17 faces, 16 glyphes, 6 états d'astres, 4 soleils progressifs, 13 éléments de roches/étincelles, 4 boutons égaux, 8 nœuds de sélection, 8 segments, 24 frames de transfert et 12 impacts/particules. Les astres actifs sont multicolores ; les astres inactifs restent ivoire. Les commandes finales sont `UNDO` et `VALIDATE`.
- Le pack v2, encore en préparation à la fin de cette passe historique, est devenu le runtime actif en `0.7.0` le 14 septembre.

## Remise aux normes des covers — 12 septembre 2026

- Base : `abdb1b464f1376ecce39aaccb6301e6dc19204f8` sur `origin/main` ; lot limité aux quatre jaquettes approuvées et à leur configuration Core.
- Demande : reprendre le pilote TetraMindFck sans réinterprétation. Les quatre PNG du 7 septembre restent les références exactes ; ImageGen a reçu une image cible à la fois et un brief de prolongement vers le bas uniquement.
- Sorties : quatre sources opaques plein cadre, quatre masters PNG `390×844` et quatre WebP lossless `780×1688` sous `public/assets/generated/linefugg/welcome/variants/`.
- Contrôle artistique agent : titres, sujets, palettes, médiums et compositions globales préservés ; aucun CTA, logo, slogan, faux cadre ou bande de remplissage. La zone JOUER recouvre seulement le décor bas continu.
- Contrôle technique : PNG/WebP décodés, opaques, mono-frame ; WebP `VP8L`. `npm run build` réussi. Les quatre éditions ont été ouvertes, sélectionnées et capturées en navigateur sur mobile court `360×611`, MASTER `390×844` et bureau `1280×720`, sans erreur HTTP/JavaScript ; lancement puis retour cover également vérifiés.
- Validation utilisateur : références historiques approuvées ; application du procédé à tous les originaux autorisée le 12 septembre 2026 ; revue finale du lot livré encore distincte.
