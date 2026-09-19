// One-off preparation tool on the review branch, never a gameplay renderer.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const gameDir = 'src/games/vlads-skewers';
const proofDir = 'public/assets/generated/vlads-skewers/production-lab';
const proofUrl = '/assets/generated/vlads-skewers/production-lab';
await fs.mkdir(proofDir, { recursive: true });
for (const name of ['master-initial.png', 'master-queue-five-visible.png', 'master-brutality.png', 'a54-chrome-queue-five-visible.png', 'a54-brave-queue-five-visible.png', 'desktop-queue-five-visible.png', 'report.json']) {
  await fs.copyFile(`artifacts/vlad-review/${name}`, `${proofDir}/${name}`);
}

const boxes = {
  counter: {x:80,y:207,width:182,height:26},
  score: {x:278,y:207,width:102,height:26},
  order: {x:152,y:247,width:228,height:62},
  customers: {x:306,y:318,width:78,height:440},
  reserve: {x:10,y:338,width:34,height:122},
  brutality: {x:52,y:350,width:246,height:65},
  levelCard: {x:64,y:345,width:224,height:98},
  grill: {x:12,y:742,width:302,height:104},
  hand: {x:156,y:753,width:56,height:62},
  bucket: {x:327,y:778,width:55,height:66},
  combo: {x:224,y:724,width:72,height:28},
  gain: {x:160,y:436,width:130,height:32},
};
const contract = {
  schema:'minifugg/vlad-composition-review/1', status:'proposal-not-approved',
  master:{width:390,height:850}, anchor:'bottom',
  guaranteed:{x:0,y:140,width:390,height:710}, boxes,
  niches:Array.from({length:5},(_,i)=>({x:312,y:322+i*86,width:65,height:76,baseline:396+i*86})),
  iconCenters:[180,209,238,267,296], iconY:278, iconSize:24,
  timer:{x:352,y:278,radius:17},
  skewer:{guardY:742,axis:184,heights:[110,150,190,230],firstStackOffset:27,stackGap:40},
  coreReturn:{x:8,width:56,height:56,yRule:'visible top + 8; Core only'},
  note:'Geometry proposal only. Source pixels are not resized or repainted. Bounds tests do not establish artistic approval.',
};
await fs.writeFile(`${gameDir}/composition.json`, JSON.stringify(contract,null,2)+'\n');

const devices = [
  {id:'guaranteed',w:390,h:710,mobile:true},
  {id:'chrome',w:360,h:656,mobile:true},
  {id:'iphone-size',w:390,h:712,mobile:true},
  {id:'brave-degraded',w:360,h:611,mobile:true},
  {id:'master',w:390,h:850,mobile:true},
  {id:'desktop',w:1280,h:720,mobile:false},
];
const checks=devices.map(d=>{
  const scale=d.mobile?d.w/390:Math.min(d.w/390,d.h/710);
  const top=850-d.h/scale;
  for(const [name,b] of Object.entries(boxes)) {
    assert(b.x>=0 && b.x+b.width<=390 && b.y>=Math.max(0,top) && b.y+b.height<=850, `${d.id}: ${name}`);
  }
  for(const n of contract.niches) assert(n.y>=boxes.customers.y && n.baseline+10<=boxes.customers.y+boxes.customers.height);
  for(const x of contract.iconCenters) assert(x-12>=boxes.order.x+8 && x+12<contract.timer.x-contract.timer.radius-8);
  return {...d,scale,visibleTop:top,allEssentialBoxesInside:true};
});
await fs.writeFile(`${proofDir}/geometry-report.json`,JSON.stringify({scope:'Geometric box tests only, not artwork or real-device acceptance',checks},null,2)+'\n');

function rect(b,fill,stroke='#a89c86') {return `<rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${fill}" stroke="${stroke}"/>`;}
function text(x,y,t,size=10,c='#eadfc8') {return `<text x="${x}" y="${y}" font-family="sans-serif" font-size="${size}" fill="${c}">${t}</text>`;}
function blueprint(state) {
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="390" height="850" viewBox="0 0 390 850">'+rect({x:0,y:0,width:390,height:850},'#16141a','none');
  s+=rect({x:0,y:0,width:390,height:140},'#29262b','none')+text(102,62,'DÉCOR RECADRABLE',12);
  s+='<path d="M0 140H390" stroke="#74ac78"/>'+text(8,154,'ZONE GARANTIE 390 × 710',9,'#9ecba1');
  s+='<path d="M0 189H390" stroke="#b88f5e"/>'+text(88,185,'LIMITE BRAVE DÉGRADÉ',8,'#c0a077');
  s+=rect({x:8,y:148,width:56,height:54},'none','#76767a')+text(15,171,'RETOUR',8)+text(19,183,'CORE',8);
  s+=rect(boxes.counter,'#332e31')+text(87,224,state==='level'?'9 / 9 CLIENTS':'7 / 9 CLIENTS');
  s+=rect(boxes.score,'#332e31')+text(285,224,'SCORE 1320');
  s+=rect(boxes.order,'#493c30')+text(159,258,'COMMANDE · TIMER INTÉGRÉ',8);
  contract.iconCenters.forEach((x,i)=>{s+=rect({x:x-12,y:266,width:24,height:24},['#a46051','#ad5038','#64854e','#8f6091','#b49860'][i],'none')+text(x-3,282,String(i+1));});
  s+='<path d="M163 296H316" stroke="#c5a050" stroke-width="2"/>';
  s+='<circle cx="352" cy="278" r="17" fill="#748c54" stroke="#d0ad65" stroke-width="2"/>'+text(346,282,'18');
  s+=rect(boxes.customers,'#413638');
  contract.niches.forEach((n,i)=>{
    s+=rect(n,'#111015','#8d7b70')+rect({x:n.x+11,y:n.y+8,width:43,height:65},'#72676a','none');
    s+=text(n.x+13,n.y+40,i===0?'ACTIF':`ATTENTE ${i}`,8);
    s+=rect({x:n.x-4,y:n.baseline,width:73,height:10},'#71393d','none');
  });
  s+=rect(boxes.reserve,'#3c3034')+text(16,355,'3',11);
  [17,26,35].forEach(x=>{s+=`<path d="M${x} 370V449" stroke="#d2af67" stroke-width="2"/>`;});
  s+=text(84,485,'CHAMP DE CHUTE',12,'#70666d');
  for(const [x,y]of [[90,329],[230,440],[109,555],[268,631]]) {
    if((state==='brutality'||state==='level')&&y<460)continue;
    s+=`<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="#b29665"/>`+text(x-14,y+3,'CHUTE',8,'#b29665');
  }
  s+=rect(boxes.grill,'#65452b')+text(19,756,'GRILL · FLAMMES CONTENUES',8);
  s+=rect(boxes.hand,'#99827b')+text(168,786,'MAIN');
  s+=rect({x:179,y:815,width:46,height:35},'#45313e','none');
  s+='<path d="M184 512V752" stroke="#d9b977" stroke-width="2"/>';
  const full=state==='hold'||state==='brutality';
  const n=state==='level'?0:full?5:3;
  for(let i=0;i<n;i++){s+=rect({x:164,y:698-i*40,width:40,height:34},'#6d765c')+text(176,720-i*40,'××',15,'#211b1b');}
  s+=rect(boxes.combo,'#382c31')+text(241,744,full?'×5':'×3',16);
  s+=rect(boxes.bucket,'#3b5155')+text(339,805,'BAVE')+text(339,823,'SEAU');
  s+='<path d="M381 355V805" stroke="#8fbebf" stroke-width="2"/>';
  if(state==='brutality')s+=rect(boxes.brutality,'#823321')+text(67,390,'BRUTALITY!',28);
  if(state==='hold')s+=rect(boxes.gain,'#43543a')+text(166,456,'COMPLÈTE · 1 s',11);
  if(state==='level')s+=rect(boxes.levelCard,'#3c3730')+text(85,370,'LEVEL 7',18)+text(86,400,'6 ICÔNES DISPONIBLES')+text(102,430,'9 CUSTOMERS');
  return s+'</svg>';
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:390,height:850},deviceScaleFactor:1});
  for(const state of ['playing','hold','brutality','level']) {
    const svg=blueprint(state);
    await fs.writeFile(`${proofDir}/blockout-${state}.svg`,svg);
    await page.setContent(`<style>html,body{margin:0;overflow:hidden}</style>${svg}`);
    await page.screenshot({path:`${proofDir}/blockout-${state}.png`});
  }
}finally{await browser?.close();}

const inventory=[
  ['layout','Cadre garanti, avant toute illustration',['GD','UI'],'review','MASTER 390×850, ancrage bas, zone garantie y140→850. La proposition garde même les boîtes essentielles après y207 pour résister au cas Brave dégradé. RETOUR Core reste libre.','order'],
  ['tower','Cinq loges dans le même cadre',['IMAGE','UI'],'review','Cinq niches fixes, mêmes tablettes, même échelle. Client actif en haut ; progression de file vers le haut. Les cinq loges restent visibles même si deux sont fermées.','customers'],
  ['portraits','Portraits entiers, pas de trous',['IMAGE','ANIMATION'],'blocked','Référence de style : version 1 renvoyée le 13 septembre. Reconstruire toute zone cachée par la bave avant de supprimer celle-ci. Masque de niche devant le bas du buste ; pivots et bouche par portrait. Ne pas utiliser l’atlas rejeté.','customers'],
  ['order','Recette lisible de deux à cinq aliments',['IMAGE','UI'],'review','Un seul cartouche lié au client actif, broche horizontale, aliments morts et grillés. Timer à droite intégré au même cartouche. Cadre extensible sans étirer ses ornements ; cinq ingrédients n’en sortent pas.','order'],
  ['drool','Bouche → écoulement → seau',['FX','ANIMATION','IMAGE'],'todo','Visages opaques intacts, bave indépendante. Filet local puis gouttes vers le collecteur droit et le seau ; budget indicatif 24 gouttes, suspension au pause. Décor et portrait ont des propriétaires séparés.','bucket'],
  ['skewer','Broche courte, empilement à la garde',['GD','IMAGE','ANIMATION'],'review','Deux à cinq aliments. Longueurs runtime 110/150/190/230 à conserver comme référence mécanique ; capacité visuelle et corps à éprouver dans la tranche. La prise se fait à la main, la collision seulement à la pointe invisible.','hand'],
  ['capture','Angle et perforation propres à chaque aliment',['GD','ANIMATION'],'todo','Contact ascendant de l’apex, angle et point de perforation conservés. Glissement à la garde puis empilement vers la pointe. Pas de recentrage ni remise à plat, ni collision par le bras.','hand'],
  ['limbs','Matter validé, pas de nouvelle force artificielle',['GD','ANIMATION'],'done','Conserver la gravité monde et les membres articulés légers déjà validés. Ni double injection d’accélération, ni nouvelle sinusoïde. La DA ne modifie pas la physique.','hand'],
  ['hold','Résultat complet protégé une seconde',['GD','ANIMATION','UI'],'todo','Afficher la broche complète avant son départ automatique. Pointe inerte, patience protégée ; puis vol vers le client actif en haut et affichage du gain réel. Aucun service manuel.','gain'],
  ['emotion','Joie → inquiétude → panique → mort',['IMAGE','ANIMATION'],'todo','Corps alimentaires, visages et fils noirs avec petites mains blanches sont séparés. Corps embrochés grillés, yeux en croix, membres tombants. Pas de bavure humaine sculptée dans les aliments.','brutality'],
  ['fall','Chute hors écran et trajectoires lisibles',['GD','ANIMATION'],'todo','Apparition au-dessus du bord visible avec marge de silhouette, aucune traînée. Rotation et poussées latérales compatibles avec les règles. Les aliments peuvent passer devant les loges ; elles ne deviennent pas un mur.','customers'],
  ['juice','Cinq paliers de jus',['FX','SON'],'todo','Gerbe à l’impact, puis gouttes et petits morceaux retombant sous gravité derrière les cibles. Paliers normal/×2/×3/×4/×5. Pool indicatif 48/72/96/144/192 particules, à profiler ; baisse de densité avant baisse de lisibilité.','brutality'],
  ['brutality','BRUTALITY! réellement visible',['FX','IMAGE','SON'],'todo','Titre gothique temporaire dans la zone centrale haute, jamais derrière le grill ni sur le cartouche/timer. Pluie de jus spectaculaire mais cibles lisibles. Habillage d’un événement, pas un écran bloquant ni un score différent.','brutality'],
  ['score','Score, gain, combo : trois informations distinctes',['GD','UI'],'review','Score total à droite ; gain au service ; meilleur combo persistant près de la main jusqu’à fin/annulation. Ne pas restaurer les anciens barèmes : conserver le calcul courant chaîne factorielle × beauté moyenne.','score'],
  ['level','Ouverture de niveau lisible et temporaire',['UI','ANIMATION'],'review','Cartouche LEVEL n, icônes disponibles et effectif du niveau, affiché assez longtemps puis retiré. Progression courante : n+2 clients, recettes 2–5, nouveaux aliments par paliers.','levelCard'],
  ['reserve','Trois piques à gauche',['IMAGE','UI'],'todo','Rack vertical de trois piques rouge et or, une retirée par client perdu. Ce sont des vies, pas des ingrédients. Il reste en dehors du contrôle RETOUR.','reserve'],
  ['grill','Grill et flammes ne masquent plus la main',['IMAGE','ANIMATION','FX'],'review','Feu animé séparé de la grille, lisible mais contenu. Aliment raté brûle/noircit/disparaît. Une seule petite remarque drôle à la fois, uniquement au grill, avec vraie typographie bitmap et sans bloc d’explication.','grill'],
  ['blood','Bonus immédiatement reconnu',['IMAGE','FX','GD'],'todo','Silhouette claire de goutte de sang, distincte de tomate et ail. Patience/ralenti selon les règles existantes ; flash local et son Core, pas une nouvelle mécanique.','brutality'],
  ['pixel','Même densité de pixels, aucune frange cyan',['IMAGE','UI'],'blocked','Sources PNG natives intactes ; unités et pivots documentés. Pas d’upscale d’une preview, pas de chromakey qui perce les visages. Nearest, texte bitmap, tests à densité 1/2 et en mouvement ; pas de filtre global.','customers'],
  ['audio','Impacts, grill, service et climax',['SON'],'todo','Réutiliser Core Audio ; accents synchronisés aux cinq paliers. Onomatopées d’impact conservées, aucune phrase d’ingrédient à l’embrochement. Son à valider séparément, sans changer les règles.','grill'],
  ['production','Inventaire, états, puis une tranche',['NOTE'],'blocked','Ces rectangles sont un blockout technique, pas la DA finale. Après validation de composition : états des loges/clients/cartouche, textures entières propres, mini-tranche jouable, comparaison avant extension. Release nouvelle reste vide.','order'],
];
const plan={
  title:'Vlad — recomposition gameplay',
  summary:'Revue du 19 septembre : même pixel art, nouvelle composition au contrat. Jeu public inchangé.',
  screens:[
    ...['initial','queue-five-visible','brutality'].map((state,i)=>({id:`VP${i+1}`,state:'proto',title:['Départ actuel','File pleine actuelle','Brutality actuel'][i],context:'Capture réelle du runtime de référence en Chromium CI, avant refonte. Source legacy 390×844, pas preuve de déploiement ni validation Safari.',facts:['Code gameplay inchangé','Capture diagnostique, non cible artistique'],source:`${proofUrl}/master-${state}.png`,image:`${proofUrl}/master-${state}.png`,status:'Diagnostic réel',x:1650,y:420+i*980,preview:'proto',anchor:'bottom'})),
    ...['playing','hold','brutality','level'].map((state,i)=>({id:`VD${i+1}`,state:'da',title:['Composition proposée','Brochette complète protégée','Climax Brutality','Ouverture de niveau'][i],context:'Blockout technique mesuré, à valider. Ni artwork final ni nouvelle Release. Les mots de repérage ne seront pas imprimés dans les assets.',facts:['390×850 · bottom','Zone garantie 390×710','Cinq loges intégralement contenues'],source:`${gameDir}/composition.json`,image:`${proofUrl}/blockout-${state}.png`,status:'Composition proposée · artwork à produire',x:4450,y:420+i*980,preview:'proto',anchor:'bottom'})),
  ],
  nodes:inventory.map(([id,title,tags,status,body,key],i)=>({
    id:`VD-${id}`,ownerScreenId:'VD1',title,kind:tags.includes('ANIMATION')?'animation':tags.length===1&&tags[0]==='SON'?'audio':'text',tags,status,body,facts:[],source:`${gameDir}/ART_DIRECTION.md`,
    marker:{type:'rect',...boxes[key],w:boxes[key].width,h:boxes[key].height},
    x:i<11?3360:5200,y:430+(i%11)*320,links:[],
  })),
};
// No fake image nodes: clean final source files do not exist yet.
await fs.writeFile(`${gameDir}/production-plan.json`,JSON.stringify(plan,null,2)+'\n');
const corePath='src/core/ProductionLab.tsx';
let core=await fs.readFile(corePath,'utf8');
const importLine="import vladCompositionPlan from '../games/vlads-skewers/production-plan.json'\n";
if(!core.includes(importLine))core=importLine+core;
const needle="function buildPlan(game: InstagameDefinition) {\n";
assert.equal(core.split(needle).length-1,1,'Unique Lab dispatch required');
if(!core.includes("game.id === 'vlads-skewers'"))core=core.replace(needle,needle+"  if (game.id === 'vlads-skewers') {\n    const base = buildGenericPlan(game)\n    const plan = vladCompositionPlan as PlanProject\n    return { ...plan, screens: [...base.screens.filter(screen => screen.state === 'covers'), ...plan.screens] }\n  }\n");
await fs.writeFile(corePath,core);

const decision=`## Recomposition gameplay — décision du 19 septembre 2026\n\nCette section remplace les anciennes consignes de composition ci-dessous lorsqu’elles se contredisent. Le jeu public reste la présentation restaurée, release 0.4.2 du 17 septembre (ajustement de métadonnées), en monde legacy 390×844. La nouvelle composition est une proposition, pas une validation ni une livraison gameplay.\n\n- Cible dédiée : MASTER 390×850, zone garantie 390×710, ancrage bottom y140→850. Toutes les cinq loges, la recette/timer, le score, le rack de vies, la prise/main et le grill doivent tenir. Au-dessus : décor uniquement. Les boîtes proposées commencent après y207 pour supporter aussi le diagnostic Brave dégradé.\n- Géométrie de travail : composition.json. Ne pas convertir directement les proportions d’une grande illustration en placements Phaser. Les guides de blockout sont des annotations techniques, pas des textures finales.\n- Style conservé : pixel art gothique BBQ, pierre sombre, or/rouge, portraits de la version 1 renvoyée le 13 septembre. L’image fixe le traitement, pas les coordonnées. Les autres images rejetées et les extractions trouées ne sont pas des sources utilisables.\n- File : client ACTIF EN HAUT, cinq loges fixes entièrement visibles, attente en dessous ; la file monte après un départ. Niches vides fermées par grille. Portraits légèrement reculés, masqués par la tablette, corps et bouche entiers.\n- Recette : un seul cartouche proche du client du haut, jusqu’à cinq aliments morts/grillés sur une broche horizontale. Timer intégré à droite ; cadre dimensionné au contenu sans étirer les coins. Aucun deuxième panneau de commande.\n- Bave : pixels sous la bave reconstruits, jamais rendus transparents. Portrait opaque sous la bave indépendante ; émission à la bouche, écoulement de tablette en tablette / collecteur droit jusqu’au seau.\n- Broche : courte selon 2/3/4/5 ingrédients ; entrée par la pointe, glissement à la garde, pile vers le haut, angle et perforation préservés. La broche complète est visible et protégée 1 s avant livraison automatique vers le client du haut. Pas de service manuel.\n- Physique Matter approuvée conservée, sans force artificielle d’accélération ajoutée. Pointe-harpon invisible comme hitbox ; ni halo jaune, ni ligne pointillée de geste.\n- Aliments : mêmes dix variétés que le code, ail danger et sang bonus séparés. Joie puis panique, fils noirs et mains blanches dessinés par-dessus les corps ; morts/grillés sur la broche. Naissance hors champ, pas de traînée. Ils peuvent passer devant les clients sans transformer les loges en mur.\n- FX : gerbes de jus coloré et débris sous gravité, intensité normal→×5, limites de particules à mesurer. BRUTALITY! temporaire en haut du champ utile et pluie derrière les cibles ; commande, timer et visages restent lisibles.\n- Texte : score total à droite, gain au service, combo persistant près de la main. Aucune parole de nourriture à l’embrochement ; onomatopée d’impact seulement. Remarque courte, rare et bitmap uniquement au grill. Pas de titre du jeu, pause, slogan ou panneau explicatif permanent.\n- Niveau : transition lisible puis disparue ; LEVEL n, icônes disponibles, effectif. Conserver la progression et le scoring courant (chaîne factorielle × beauté moyenne), pas les anciens barèmes de septembre.\n- Sources PNG natives et futurs dérivés WebP lossless séparés. Pas de lissage global, franges cyan, upscaling de preview, recadrage destructeur ou suppression alpha des visages. Les éléments masqués doivent être reconstruits avant animation.\n\nValidation requise : composition + états, puis mini-tranche. Le Production Lab expose les captures réelles et le blockout ; les nœuds de sources finales restent bloqués/à produire. Covers inchangées.\n\n`;
const artPath=`${gameDir}/ART_DIRECTION.md`;
let art=await fs.readFile(artPath,'utf8');
if(!art.includes('## Recomposition gameplay — décision du 19 septembre 2026')) {
 const split=art.indexOf('\n\n');
 art=art.slice(0,split+2)+decision+'## Références et historique antérieurs — à lire sous les décisions ci-dessus\n\n'+art.slice(split+2);
 await fs.writeFile(artPath,art);
}
const status=`# Les Brochettes de Vlad — Suivi\n\n## État au 19 septembre 2026\n\nJeu public : release 0.4.2 du 17 septembre, runtime historique 390×844. La refonte graphique est en préparation ; aucun code gameplay, score, physique, contrôle ni cover n’est remplacé par cette passe.\n\n## Lot actif : recomposition mesurée\n\n- Autorisation : refaire la maquette complète, même style, en réconciliant les retours de septembre.\n- Base inspectée : 02dfb0ebfba28c80c9cd3244ac98297a5b8388ab ; branche temporaire chatgpt/vlad-composition-review, PR25.\n- Nouveau contrat : MASTER 390×850, zone garantie 390×710, bottom y140→850. Les anciennes indications 390×662 de ce suivi ne sont plus la cible de conception.\n- Vérité visuelle : 15 captures du vrai runtime dans le banc existant, cinq formats (A54 Chrome, taille iPhone, Brave dégradé, master legacy et bureau) et trois situations (départ, file pleine, Brutality). Chromium CI : ce ne sont pas des tests Safari/Brave natifs ni une preuve de l’application déployée. Aucun pageerror/HTTP error dans le rapport initial.\n- Défauts constatés : score/panneau de niveau recadrés sur vues courtes ; Brutality déjà présent mais mal placé dans le feu ; silhouettes de clients mal contenues. Les éléments absents à l’écran ne sont donc pas tous absents du code.\n- Proposition de géométrie : composition.json ; cinq loges, commande 2–5, timer intégré, rack gauche, main/grill et seau tiennent dans les six simulations géométriques. Cela prouve les boîtes, pas l’art, les hitboxes ou la qualité sur appareil.\n- Production Lab : trois captures Proto, quatre blockouts DA (jeu, broche protégée, Brutality, niveau), inventaire sémantique couvrant structure, clients, états, gameplay, texte, FX et son. Aucune nouvelle Release ni faux asset final.\n\n## Décisions réconciliées\n\nVoir ART_DIRECTION.md, section du 19 septembre : actif en haut ; portraits intacts ; bave séparée vers le seau ; ordre/temps ensemble ; empilement à la garde ; seconde protégée ; physique validée conservée ; aucun changement silencieux de scoring ou de progression.\n\n## Fichiers et preuves\n\n- public/assets/generated/vlads-skewers/production-lab/ : captures réelles, blockouts techniques, geometry-report.json et report.json ; jamais des textures du jeu public.\n- composition.json : coordonnées de proposition.\n- production-plan.json : Plan canonique de revue, affiché par le Production Lab.\n- PR25 : espace de préparation ; la présence d’un fichier sur la branche n’est ni acceptation artistique ni déploiement du gameplay.\n\n## Contrôles et suite\n\nContrôle diagnostic runtime : effectué. Contrôle géométrique des boîtes : effectué. Maquette pixel-art et comparaison au gabarit : à produire/revoir. Validation artistique utilisateur : en attente. Découpage, réfection des portraits, export runtime, mini-tranche puis intégration complète : non commencés.\n\nL’enseignement de cette passe est de mesurer le cadre visible avant le dessin. Ne pas relancer l’intégration rejetée ni reprendre l’ancien atlas troué. La prochaine validation porte sur la composition et les états, pas sur un déploiement.\n`;
await fs.writeFile(`${gameDir}/GAME_STATUS.md`,status);
const manifestPath=`${gameDir}/ASSET_MANIFEST.md`;
let manifest=await fs.readFile(manifestPath,'utf8');
if(!manifest.includes('## Revue de recomposition du 19 septembre'))manifest+='\n\n## Revue de recomposition du 19 septembre\n\nLe tableau historique ci-dessus décrit le runtime inchangé. La nouvelle production vise 390×850 / garantie 390×710 bottom ; composition.json est une proposition mesurée, non une géométrie déjà intégrée.\n\nproduction-lab/master-*.png sont des captures réelles du monde legacy. production-lab/blockout-*.png et .svg sont des guides techniques de placement et d’états, REFERENCE ONLY, sans valeur artistique finale. Ils ne doivent jamais être chargés par VladsSkewersScene. Les rapports de géométrie ne certifient pas la qualité des sources.\n\nLe Plan production-plan.json inventorie les futurs assets et tous les éléments moteur-owned : cinq loges vides/grillées, portraits entiers et expressions, bouche/ancrages/bave, seau, cartouche extensible et timer, corps/faces/membres alimentaires, broches 2–5 et état complet, trois vies, chiffres/police bitmap, niveau, jus cinq paliers, Brutality et audio. Aucun sprite final issu du blockout n’existe. Chaque entrée IMAGE reste à produire/bloquée tant qu’une vraie source indépendante n’est pas contrôlée.\n\nPriorité : validation de composition puis une seule tranche représentative (loge/portrait/commande + broche complète protégée). La séparation doit reconstruire les pixels masqués, pas trouer les visages ou couvrir une découpe contaminée par un rectangle. Sources PNG intactes ; dérivés WebP lossless seulement après approbation et contrôles.\n';
await fs.writeFile(manifestPath,manifest);
console.log(JSON.stringify({prepared:true,geometryChecks:checks.length,screens:plan.screens.length,nodes:plan.nodes.length,gameplayChanged:false}));
