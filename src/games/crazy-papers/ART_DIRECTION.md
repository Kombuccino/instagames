# CrazyPapers — Art Direction

## Base direction

- Oppressive low-resolution bureaucracy mood, with physical paper and hard printed edges.
- Historical reference: the administrative tension of *Papers, Please* without copying its interface, assets, characters, emblems or exact palette.
- Current gameplay renderer is Phaser 4 on the historical `390 × 844` stage. The validated new gameplay DA is the target for the next art/layout pass; new authored translation uses `390 × 850` with a guaranteed `390 × 710` gameplay zone. Dynamic gameplay state stays engine-owned; do not rebuild a DOM/CSS interface inside the scene.

## Gameplay DA validated — 19 September 2026

The user explicitly validated the exact gameplay reference `MiniFugg - Graphic Archive/Games/crazy-papers/Gameplay DA Validated - 2026-09-19/crazy-papers-gameplay-da-validated-2026-09-19.png` (private Drive file `1csaKcsx62GvWuBa716fXelhI2NqE2ZTT`, folder `1UGgUw1SPKimiTxQNhBy9uUxcelafpxRH`). Source: opaque PNG, `849 × 1851`, SHA-256 `5d3384b040167f1c76ad5cf4bd8673997c07451a64878340bc606246ef8e90f1`. Preserve this original unchanged: it is the canonical artistic/composition reference for the gameplay redesign.

Validation scope: **art direction and general early-game composition**, representing the desk after roughly one or two minutes of play, before heavy overload. It is not yet a production master or a runtime texture. Its ratio is already extremely close to the new MiniFugg master (at 390 logical units wide it maps to about 850.28 high), but the production translation still has to prove that every indispensable control and label fits inside the guaranteed `390 × 710` window.

This validation supersedes older gameplay-visual choices when they conflict with the points below:

- **Rendering:** deliberate constructed pixel art throughout — coherent pixel clusters, stepped edges, limited material detail, no smooth painted illustration merely filtered into pixels.
- **Five departments only:** `ACCOUNTING`, `CIVIL`, `PLANNING`, `HR`, `LEGAL`. Each department owns one stable color, one logo/pictogram and one distinct manager bay/office atmosphere.
- **Managers:** five compact portrait blocks at the top. In the normal initial state there are **no speech bubbles and no manager dialogue on screen**. Faces may have several states later, but only one manager speaks at a time.
- **Wrong department event:** a manager later throws a returned file into the middle through an intentionally oversized arm/hand. The returned file has a red backing and a large English `WRONG DEPARTMENT` stamp so the same physical dossier remains identifiable when it lands back on the wooden board. This is a later-state variation, not part of the normal starting scene.
- **Time:** no calendar date and no weekday name. Use an analog workday clock with a clearly visible red end-of-day sector. Prepare **six window/background states** across the day so light and skyline communicate time progression.
- **Backlog:** the numeric pending-file count and the physical side piles are two views of the same value. At the validated early state, side piles remain modest; they grow visibly and monotonically with pending work rather than serving as fixed decoration.
- **Document station:** one large active document on a broad wooden support, much flatter than the earlier angled clipboard studies. The support may overlap backlog piles if needed; physical realism is secondary to readability.
- **Document content:** paper texture, borders, logos and form geometry may be authored, but titles, names, numbers, clues, fields and other variable content stay engine-rendered/live. The active document must remain large enough to read comfortably at phone size.
- **Stamps:** five physical stamps on **one horizontal row**. Their bodies keep the department colors; their click face uses the department logo/pictogram rather than the department name. The whole hardware base is the obvious touch target, so the player never has to guess where to click.
- **Metronome:** visible in the office and tied to pressure. Its sound accelerates with level/pressure; the visual `TIC / TAC` stack cycles vertically. Level 1 shows only two simultaneous words before the oldest disappears; later intensity can rise progressively to six simultaneous words.
- **Text discipline:** all gameplay-visible text is English. No mugs with jokes, motivational notes, decorative slogans, fake handwritten chatter or ambient pseudo-copy. Functional text only.
- **Below-safe decoration:** desk objects and paper continuation may exist outside the guaranteed gameplay window, but they are expendable under crop and never carry required information.

Next mandatory production step is the DA → game translation board: canonical `390 × 850` composition, explicit vertical anchor, guaranteed-zone check, layer ownership, manager states, six window states, document templates, backlog/pile mapping, metronome storyboard and wrong-department arm event. Do not integrate the whole art pass before that board and a representative vertical slice are validated.

## Cover research — 12 September 2026 — first three sources approved

The TetraMindFck cover collection is the reference for the **degree of authorship and stylistic distance**, not for its tetromino motifs, characters or compositions. CrazyPapers must remain its own oppressive bureaucracy fiction: an ordinary clerk, physical files, loose forms, stamps and an accumulating paper threat.

Four independent source covers were produced, one image per generation and one TetraMindFck edition used only as a style-family reference:

1. `pulp` — expressive European ink-and-gouache disaster scene;
2. `micro` — late-1980s European micro-computer box art and oppressive records machine;
3. `graphic` — asymmetric Eastern-European editorial poster and a single bureaucratic metaphor;
4. `japanese` — nervous early-1990s commercial manga print and diagonal paper avalanche.

The user subsequently validated the first three exact sources from this lot: `pulp`, `micro` and `graphic`. The fourth `japanese` source is not included in that validation. The three retained sources now have checked production masters and static lossless runtime derivatives. The closed text list is `CrazyPapers` only: no CTA, slogan, readable form copy, MiniFugg mark, platform UI or decorative pseudo-writing. Covers remain full bleed, without fake old-box frame or damaged corners. The lower desk, body and paper mass continue naturally into an expendable BAS so Core can crop from the bottom while keeping the useful width fixed.

## Cover selection — historical references transposed — 12 September 2026

After reviewing the 31 recovered historical CrazyPapers covers, the user identified 02, 07 and 08 as particularly strong, with additional useful directions in 13, 15, 16, 17/20, 23, 28 and 31. The retained qualities are bureaucratic submersion and physical crushing, ordinary non-glamorous workers, heavy-set or older bodies, exhaustion, and empty or unstable gazes. Historical logos from 13 and 23 were explicitly not retained; new title treatments must remain strong and authored.

Four new static sources were produced by crossing those qualities with the validated TetraMindFck cover grammars without copying Tetra motifs or compositions. The user retained the first three at concept and cover-source level:

1. `historical-inspired-a-pulp-clerk` — retained; grotesque European pulp clerk, derived from the roles of historical 02/28 and the validated pulp grammar;
2. `historical-inspired-b-constructivist-clerk` — retained; monumental paper architecture and older clerk, derived from historical 15/23 and the validated graphic-poster grammar;
3. `historical-inspired-c-showa-paper-wave` — retained; nervous Shōwa paper tsunami and older office worker, derived from historical 13/16 and the validated Japanese grammar;
4. `historical-inspired-d-micro-machine` — not retained in this lot, although positively assessed; keep archived as research only.

This decision approves the three exact source images and their artistic directions. Their `390 × 844` masters, Core-overlay clearance, static runtime derivatives and in-app crop behavior are now certified with the rest of the six-cover collection. Preserve the retained originals unchanged; rebuild derivatives from them rather than regenerating them.

The current CrazyPapers cover collection therefore contains **six user-validated source images**: the earlier `pulp`, `micro` and `graphic` sources, plus the historical-inspired `pulp-clerk`, `constructivist-clerk` and `showa-paper-wave` sources. They are the six canonical static Core covers. The two unselected fourth images remain research only and are not silently promoted into the collection.

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
- Five stamps use one horizontal row in the validated DA. Each uses its department color and pictogram/logo on the click face; the physical base remains a generous, explicit touch target.
- Paper grain, line work and pile silhouettes may be drawn procedurally in Phaser while no authored production asset exists; a later DA pass may replace those surfaces without changing gameplay geometry.

## Visible department language

The player sorts documents into five administrative sectors. In the validated gameplay DA, all visible department labels are English:

- `ACCOUNTING`
- `CIVIL`
- `PLANNING`
- `HR`
- `LEGAL`

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

- Portrait only.
- The **current runtime** remains a historical `390 × 844` game until the dedicated DA integration pass; do not stretch it merely to gain six pixels.
- The **new validated gameplay DA** is translated into the current MiniFugg production contract: MASTER `390 × 850`, guaranteed gameplay zone `390 × 710`, one explicit vertical anchor.
- Manager identity, active document, pending count/workday clock and all five stamp touch targets must survive the guaranteed window together. If the validated concept is vertically too generous, compact the manager/header area and non-essential desk decoration before shrinking the document.
- The active document stays dominant and readable; the five stamps remain in one horizontal row.
- HAUT/BAS outside the guaranteed window contain only crop-safe atmosphere/desk continuation.
- Core return/close controls remain outside the game scene and must stay reachable.
- Same logical geometry on phone, tablet and desktop; no alternate PC composition.
