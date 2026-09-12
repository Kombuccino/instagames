# Géométrie de référence — rame japonaise

Construction validée le 12 septembre 2026. Elle remplace le blockout dessiné à l'œil de `metro-geometry-v1`.

## Références techniques

- Tokyo Metro 17000 : rame de 20 m, quatre portes par côté, plancher à 1 140 mm et largeur de siège portée à 460 mm : <https://www.tokyometro.jp/news/2019/205131.html>
- Tokyo Metro 10000 / Hitachi : véhicule de 20 m avec quatre portes par côté : <https://www.hitachirail.com/products-and-solutions/rolling-stock/metro-trains/tokyo-metro-10000/>
- J-TREC sustina : coupes techniques donnant environ 2 598 mm de largeur intérieure utile pour une rame métropolitaine japonaise comparable : <https://www.j-trec.co.jp/company/070/02/jtr02.pdf>
- J-TREC, recherche sur les mains courantes : position des barres au droit de l'avant des sièges et contraintes d'usage : <https://www.j-trec.co.jp/company/070/01/jtr01_58-63.pdf>

## Dimensions du modèle

Dimensions directement documentées ou déduites du module réel :

- caisse : `20,00 × 2,80 m` ;
- largeur intérieure utile simplifiée : `2,60 m` ;
- quatre portes de `1,30 m` par côté ;
- banquette de sept places entre deux portes : environ `3,22 m` à raison de `460 mm` par place.

Hypothèses de travail à vérifier visuellement, et non présentées comme des cotes exactes du 17000 :

- hauteur intérieure : `2,35 m` ;
- profondeur de banquette : `0,52 m` ;
- hauteur d'assise : `0,45 m` ;
- rail longitudinal : `2,08 m` ;
- bas des poignées : `1,68 m`.

## Méthode

1. `01-plan-dessus-reel.png` place portes, fenêtres, banquettes, rails, barres, caméra et personnages en mètres.
2. `02-coupe-transversale.png` place les mêmes éléments dans la largeur et la hauteur du cuboïde.
3. `03-projection-cuboide.png` applique une projection pinhole mathématique à leurs coordonnées `(x, y, z)`, avec seulement `2,3°` d'oblique. La paroi opposée varie ainsi d'environ 10 % entre ses deux bords visibles.
4. `04-rendu-geometrie-corrige.png` est le premier rendu artistique artistiquement exploitable construit avec cette géométrie. Les deux portes sont dégagées et comprennent deux vitrages chacune ; la banquette reste strictement entre les portes.
5. `04-rendu-geometrie-corrige-mobile.png` ajoute le cadre logique mobile `390 × 844` pour vérifier la composition commune.
6. `05-rendu-peuple-corrige.png` conserve la géométrie, élargit visuellement les portes, avance les barres vers le milieu du couloir et peuple les côtés à plusieurs profondeurs.
7. `05-rendu-peuple-corrige-mobile.png` contrôle cette nouvelle composition dans le cadre mobile commun.
8. `06-camera-moins-20.png` avance la caméra de 20 % vers la banquette opposée, à focale et hauteur constantes. C'est le cadrage de production validé.
9. `07-camera-moins-30.png` teste le même mouvement avec 30 % de distance en moins. Il reste une alternative compatible, sans être le cadrage actif.

Les barres dorées sont des segments verticaux dont le pied et le sommet possèdent le même `(x, y)`. Les poignées sont des objets identiques distribués sur un seul rail 3D. Leur alignement et leur changement d'échelle proviennent donc de la projection, et non d'un placement manuel dans l'image.

Toute nouvelle dérivation doit préserver cette géométrie validée.
