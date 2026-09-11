# CrazyPapers — Art Direction

## Base direction

- Oppressive low-resolution bureaucracy mood, with physical paper and hard printed edges.
- Historical reference: the administrative tension of *Papers, Please* without copying its interface, assets, characters, emblems or exact palette.
- Gameplay renderer is Phaser 4 on the canonical `390 × 844` stage. Dynamic gameplay state stays engine-owned; do not rebuild a DOM/CSS interface inside the scene.

## Palette

- Wall / office grime: `#504b3d`, `#302d25`
- Desk wood: `#706145`, `#4c402d`
- Neutral paper: `#ded2ae`
- Accounting paper cue: dirty green `#d4dcc1`
- Civil-status paper cue: faded salmon `#dfcabb`
- Planning paper cue: blueprint grey-blue `#bed0d5`
- Human-resources paper cue: old yellow `#dad39e`
- Legal paper cue: dusty mauve-grey `#cbc4d0`
- Ink: `#1d1a14`, `#4b4333`
- Supervisor / error return: dried red `#a13930`, `#a62f27`

Keep colors dirty, matte and printed. No neon, glass, bloom or modern SaaS cards.

## Typography

- Monospace / typewriter-first.
- Uppercase administrative labels.
- Important document titles and warnings must remain readable at phone size.
- Avoid decorative tiny metadata unless it is purely atmospheric.

## Geometry and texture

- Hard rectangular edges, 2–4 logical-unit borders and offset shadows.
- Documents feel physical and slightly misaligned, never rotated enough to damage readability.
- Sector stamps are large physical desk controls, not rounded UI buttons.
- Five stamps use a `3 + 2` portrait layout so they stay large and readable instead of becoming five tiny equal-width controls.
- Paper grain, line work and pile silhouettes may be drawn procedurally in Phaser while no authored production asset exists; a later DA pass may replace those surfaces without changing gameplay geometry.

## Core document language

The player sorts documents into five administrative sectors:

- `COMPTABILITÉ`
- `ÉTAT CIVIL`
- `URBANISME`
- `RESSOURCES HUMAINES`
- `AFFAIRES JURIDIQUES`

Each sector owns four recurring document models, for twenty core models total. Models unlock progressively across early levels instead of exposing the whole vocabulary at once.

Every generated document is recognizable through up to five independent cue families:

1. document title / genre;
2. sector paper color;
3. document form / page geometry;
4. characteristic content (amounts and VAT, names and civil dates, parcels and square metres, matricules and absences, articles and clauses, etc.);
5. sector mark / printed symbol.

Difficulty removes cues by level from five down to one. A document must always preserve at least one independently useful clue; never create a pure guess.

## Career / level structure

- A level is a finite administrative workload, not an endless uniform stream.
- The desk starts with a visible pile and additional mail continues to arrive while the level is active.
- If the player empties the visible pile before scheduled mail has arrived, the next pending document arrives almost immediately: never leave a fast keyboard player staring at an empty desk.
- Once the entire workload has arrived and every sheet is cleared, show a short promotion card and load the next level automatically.
- Every level grants a more senior absurd administrative grade.
- Higher levels have larger workloads, faster arrivals, more unlocked document models and fewer visible cues.

## Surprise events

Surprises change pressure but must never make classification unfair:

- `LIASSE DU COURRIER`: three extra documents are dropped onto the desk.
- `DOSSIER URGENT`: one visibly urgent document jumps to the front of the queue, but follows normal classification rules.
- `PHOTOCOPIEUSE FOLLE`: the just-seen document family reappears in duplicate with fresh cue combinations.

Use short physical banners and paper effects. Surprises should be intermittent, not constant noise.

## Physical backlog and hybrid pressure — decision 11 September 2026

Pressure is not a meter replacing the fiction: the backlog must physically invade the office.

1. **Pile growth.** Pending documents are represented by three visible stacks behind the active sheet. The stacks rise as the queue grows and shrink when work is cleared.
2. **Overflow.** Above eight queued documents, loose sheets begin escaping from the stacks and intruding around the active document. More backlog means more loose paper, so readability becomes progressively less comfortable.
3. **Descending paper wave.** At roughly 55% of the maximum backlog, a dense paper curtain begins above CENTRE and descends as pressure rises. It progressively masks the HUD, document and finally the stamp controls. This is a physical loss of usable/readable space, not a separate progress bar.
4. **Submersion.** `MAX_BACKLOG = 24`. When the queue reaches that limit, input freezes and the paper curtain completes its descent over all of CENTRE before `session.finish`. The player sees the bureaucracy literally cover the game before the result screen appears.

The hybrid progression must stay immediately legible: piles first, loose overflow second, descending mass last. A sudden invisible threshold is forbidden.

## Document flow

- Pending work exists as visible paper on the desk behind the active document.
- New work visibly adds to the physical backlog.
- Taking the next document reduces it.
- The active document remains the dominant readable object until pressure itself deliberately obscures it.
- A stamped document exits to the right.
- A wrongly routed document later returns from the left with a large red `MAUVAIS SERVICE` mark.
- An error adds extra work while the supervisor blocks the player briefly, so the piles and pressure can keep rising during the interruption.

## Motion

- Dry, stepped, mechanical motion.
- Correct routing: immediate stamp press and document shoots right quickly.
- Wrong routing: same rightward departure, supervisor interruption, then abrupt left-to-centre return.
- Promotions and surprise banners use short snapped animations only.
- Pile growth and overflow are cheap and bounded; no decorative particle storm.
- The final paper curtain descends in roughly half a second when the backlog reaches 24 so the loss is visible before game over.
- Avoid long easing, squash-and-bounce and floaty decorative animation.

## Layout

- Portrait only, authored at `390 × 844` logical units.
- Essential gameplay stays inside CENTRE (`y 91 → 753`).
- The active document occupies the middle of CENTRE; the five stamp controls remain inside CENTRE in a `3 + 2` layout.
- HAUT/BAS contain only non-essential continuation/decor and may be cropped by Core.
- Core return/close controls remain outside the game scene and must stay reachable.
- Same logical geometry on phone, tablet and desktop; no alternate PC composition.
