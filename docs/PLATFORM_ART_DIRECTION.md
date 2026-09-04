# MiniFugg — Platform Art Direction

Living direction for the MiniFugg platform itself: logo, mascot, cold-open/home splash, shared shell, social UI and the visual transition into games.

This document is deliberately separate from game-specific `ART_DIRECTION.md` files and from `docs/WELCOME_ART_STYLES.md`.

- **Platform identity** must feel modern, recognizable and durable.
- **Fugg welcome covers** may be retro, cultural, pulp, editorial or wildly authored.
- **Individual games** may be pixel art, simple 3D, vector, collage, etc.

The platform must hold all of those worlds together without visually becoming one of them.

---

## 1. The core problem

The current instinct to make the home splash as a beautiful illustrated poster is attractive but strategically wrong for MiniFugg.

A poster is a closed image. MiniFugg needs an **entry state into a living product**.

The first screen must already feel connected to what comes next: feed, game chrome, social actions, comments, favorites, profile, score, navigation. It should not feel like a decorative ad that disappears before the real interface begins.

The platform needs a visual identity that can exist on:

- a web app;
- an app icon;
- a favicon;
- Instagram/social media;
- a creator profile;
- a forum/comment surface;
- a Steam/itch-like storefront presence;
- game overlays;
- screenshots and trailers;
- physical or editorial merch later.

Therefore the platform home should be designed as **the first frame of the product**, not as a game box cover.

---

## 2. Brand personality

MiniFugg should feel:

- playful, but not childish;
- mischievous, but not meme-trash;
- indie, but not cheap;
- small-scale, but not amateur;
- contemporary, but not generic SaaS;
- capable of humor, absurdity and slightly mature themes;
- comfortable next to both silly games and more thoughtful games;
- visually authored rather than AI-default.

A useful sentence:

> **MiniFugg is a modern platform for tiny, strange, well-made games.**

The brand should communicate curiosity and appetite for surprise, not nostalgia for retro gaming.

Retro is a tool available to individual covers, not the platform's permanent costume.

---

## 3. Three visual layers that must remain distinct

### Layer 1 — MiniFugg platform shell

Modern, restrained, recognizable, stable across every game.

Owns:

- logo / mascot;
- navigation;
- game title / author metadata;
- comments;
- love / favorite / bookmark;
- leaderboard and score shell;
- profile;
- sheets / overlays;
- transitions between games.

### Layer 2 — Fugg welcome cover

Highly expressive and game-specific.

Can be pulp, microcomputer box art, editorial poster, Japanese edition, etc. It is intentionally theatrical and collectible.

### Layer 3 — Actual game

Independent art direction: pixel art, simple 3D, vector, collage, paper, toy-like objects, etc.

The Core shell should frame the game without forcing the game to visually imitate the platform.

This separation is essential. It lets MiniFugg feel coherent without making every game look the same.

---

## 4. Logo strategy

The logo must behave like a **platform mark**, not like the title treatment of one specific game.

### Required logo system

Design three linked assets:

1. **Symbol / mascot mark** — recognizable at favicon/app-icon size.
2. **Wordmark `MiniFugg`** — horizontal, simple enough to work in navigation and marketing.
3. **Lockup** — symbol + wordmark.

The symbol must work in one color before any texture, shading or animation is added.

### Mascot direction

The mascot should be extremely simple and reusable rather than a fully rendered cartoon character.

Desired personality:

- tiny creature / gremlin / odd companion;
- slightly asymmetrical;
- curious or mischievous rather than permanently smiling;
- not kawaii by default;
- not an emoji;
- not a generic AI blob;
- readable in silhouette;
- usable as profile placeholder, loading state, favicon, sticker, reaction or small animation.

A mascot with one small visual irregularity — uneven eyes, one tooth, a notch, a strange ear/horn — can make it recognizable without making it visually busy.

### Wordmark direction

Prefer a contemporary custom grotesk / geometric sans base with one or two authored alterations.

Avoid:

- retro arcade lettering;
- 3D bevels;
- giant cartoon bubble letters;
- fake 1980s outlines;
- chrome/neon treatments;
- a wordmark that only works as a large poster title.

The wordmark must survive as black-on-white and white-on-black.

---

## 5. The home splash is not a poster

The first MiniFugg screen should have **spatial depth, interaction and continuity with the actual UI**.

It should feel like a game/platform title screen or an interactive ident.

Recommended composition rule:

- one dominant brand mark;
- one central interaction idea;
- a lot of breathing room;
- very few props;
- the real platform UI already partially present or ready to emerge;
- motion doing part of the storytelling instead of filling the static frame with objects.

Do not represent the current catalog by showing a train, tooth, tetromino, paperwork, skewers, etc. That accidentally tells the user that MiniFugg is only those games.

The imagery should represent **possibility**, not inventory.

---

## 6. Strongest proposed direction — “Device Portal”

This is currently the recommended direction to prototype first.

### Concept

A restrained modern 3D scene. A hand, stand, table or small physical setting holds a phone-like screen/device. The MiniFugg logo and mascot exist on or around that device.

The device is not covered in examples of existing games. It is a **window into an unknown stream of tiny games**.

The environment may be slightly surreal or tactile, but should remain sparse.

### Why it works

It solves the biggest current problem: the transition between splash art and product UI.

The screen shown inside the device can already contain the **actual MiniFugg HTML interface**. When the user enters, the camera/device moves toward the viewer until the phone screen fills the viewport. The physical 3D surroundings disappear, but the live interface remains in exactly the same visual position.

The transition therefore feels like entering MiniFugg rather than dismissing a poster.

### Important implementation principle

Do not render the important UI into the illustration/video.

The 3D scene may be pre-rendered, but logo, navigation and screen UI should preferably remain live DOM/UI layers. This ensures responsive sizing, accessible text and a seamless transition.

A sophisticated result does **not** require heavy realtime 3D.

A practical implementation can use:

- pre-rendered 3D background / foreground layers;
- a live DOM device screen;
- 2.5D camera movement;
- subtle light animation;
- scale/position transforms during entry;
- optional very short pre-rendered motion loop for physical atmosphere.

This can look expensive while remaining lightweight.

---

## 7. Alternative direction A — “Quiet Spatial Brand Room”

A minimal spatial scene rather than a literal phone-in-hand.

Imagine a contemporary small dark/light room, pedestal, kiosk, workbench or impossible architectural space with a single MiniFugg screen/window at its center.

The mascot may live physically in the scene at tiny scale.

Characteristics:

- strong negative space;
- 3D or 2.5D materials;
- one light source;
- matte surfaces;
- restrained palette;
- almost no literal game references;
- the UI window is the focal point.

This feels more premium and less explicitly mobile than the hand/phone idea, but risks becoming too “design exhibition” if it is too sterile.

---

## 8. Alternative direction B — “Kinetic Identity”

No elaborate scene. The platform opens with logo + mascot + a highly authored motion system.

The logo forms, breaks, compresses, slides or reveals a viewport. UI pieces enter with precise motion, and the viewport becomes the first game slot.

This direction is:

- more graphic;
- faster;
- easier to keep modern;
- very scalable to marketing/social media;
- naturally connected to the actual interface.

It requires excellent typography, timing and motion design. If poorly executed it can look like a startup animation; if well executed it can become a very strong brand signature.

---

## 9. Direction to avoid — “Catalog Fantasy Poster”

Do not make the platform splash a collage of every possible game genre.

A castle + spaceship + blocks + train + tooth + papers + fantasy creature + arcade objects may look attractive, but it causes four problems:

- it becomes a poster rather than an interface;
- it visually limits the platform to represented genres;
- it creates the generic AI “everything floating around a central hero” composition;
- it has no natural transition into Core UI.

The platform should communicate that there are countless possible games without literally illustrating all of them.

---

## 10. Recommended visual language for the platform shell

The shell should be quieter than the games.

### Palette

Start from a neutral modern system:

- near-black / graphite;
- warm off-white or very light neutral;
- one distinctive MiniFugg accent;
- optional second accent for status/interaction only.

Do not lock the identity to purple/cyan neon, gradient mesh or synthwave.

### Surfaces

Prefer:

- matte solids;
- crisp lines;
- subtle physical grain only when intentional;
- real shadows from spatial composition rather than UI drop-shadow everywhere;
- moderate corner radii or mixed square/rounded geometry rather than universal pill cards.

Avoid default glassmorphism.

### Typography

Use a strong contemporary sans/grotesk for platform information. Readability and brand voice matter more than decorative typography.

Game covers and games can use their own display typefaces inside their own art direction.

### Icons

Simple outline/fill icons, consistent stroke and optical size. They should remain legible over wildly different game backgrounds.

The current Instagram-like icon principle is directionally useful: icons should feel like platform controls rather than decorative buttons.

---

## 11. Motion language

Platform motion should feel precise and premium rather than bouncy by default.

Recommended characteristics:

- short easing with physical weight;
- restrained overshoot;
- depth through scale and occlusion;
- light/parallax where it communicates space;
- mascot micro-behavior used sparingly;
- no constant particle shower;
- no perpetual floating of every element.

The most important motion is **continuity**.

Examples:

- logo stays fixed while background changes;
- device screen grows into the real viewport;
- bottom navigation fades/slides into the exact position it will keep afterward;
- an icon visible in the splash becomes the same actual UI icon after entry;
- the mascot briefly reacts during transitions rather than looping forever.

---

## 12. Proposed entry storyboard for “Device Portal”

### Frame 1 — Cold open

Very short dark/neutral frame. Mascot mark appears or blinks once. No elaborate loading animation.

### Frame 2 — Brand scene

The sparse physical/3D scene is visible. The MiniFugg lockup is clear. A handheld/standing device shows a live MiniFugg viewport. The composition has large quiet areas.

### Frame 3 — Invitation

A minimal entry cue appears: swipe/enter. Ambient light or a tiny mascot action indicates the object is alive.

### Frame 4 — User gesture

On swipe/wheel/enter, camera and device move toward each other. The device frame expands past the edges of the viewport.

### Frame 5 — Seamless handoff

The pre-rendered surroundings disappear. The live MiniFugg Core UI that was already on the device remains, now fullscreen. The bottom nav/social chrome appears in its production position.

### Frame 6 — First game

The first Fugg welcome cover or game state now lives inside that same shell. No visual reset occurs.

This is the desired relationship between platform intro and in-product interface.

---

## 13. What to prototype together, not separately

Do not validate the home splash in isolation anymore.

Every candidate platform art direction should be shown as a small **system board** containing at least these four states:

1. **Cold-open / home splash**.
2. **Game feed / discovery state** with real Core chrome.
3. **Inside a game** with title/social/navigation overlays.
4. **A social sheet** such as comments, favorites or profile.

Also show the logo in:

- full lockup;
- icon/mascot-only;
- tiny favicon/app-icon size;
- monochrome.

If the four states do not clearly feel like the same product, reject the direction even if the splash alone is beautiful.

---

## 14. Anti-“ChatGPT graphic” rules for the platform

The platform identity must avoid patterns that image models produce automatically.

Do not use prompts or art direction built mostly from adjectives such as “beautiful, cinematic, magical, premium, futuristic”. Those tend to collapse into generic AI aesthetics.

Instead define concrete production constraints:

- specific medium: 3D render, screenprint, flat vector, photographed model, etc.;
- exact material character: matte ABS, painted metal, textured paper, rough plaster, uncoated card;
- restrained object count;
- clear camera position / focal length family;
- one or two deliberate light sources;
- limited palette;
- explicit empty areas;
- asymmetric composition if appropriate;
- typography designed separately from the illustrative scene;
- UI rendered as live UI where possible instead of asking the image model to invent it.

Avoid:

- generic floating fantasy islands;
- piles of representative genre objects;
- glowing portals surrounded by dozens of symbols;
- glossy rounded devices with no design rationale;
- excessive purple/cyan lighting;
- “cinematic” fog and bloom everywhere;
- tiny nonsensical fake UI text;
- mascot rendered as a generic Pixar-like creature;
- random faux-retro distress on the platform shell.

A strong MiniFugg platform direction should still look convincing if all decorative effects are removed.

---

## 15. 3D treatment recommendation

3D is promising specifically for the platform because many individual games will use completely different art styles. A neutral physical/spatial wrapper can hold all of them.

But the desired 3D is **not** glossy AAA sci-fi.

Prefer:

- simple geometry;
- slightly imperfect/tactile materials;
- restrained lighting;
- a small number of intentional props;
- strong silhouette;
- editorial camera framing;
- subtle depth of field only if useful;
- believable physical scale.

Think “designed object / small installation / strange product photo” more than “fantasy key art”.

The mascot can exist as a tiny physical object, embossed mark, screen character or shadow rather than a large hero character.

---

## 16. Marketing consequence

The platform brand must be able to sit next to wildly different cover art without competing with it.

A strong identity system should let a social post look recognizably MiniFugg even if 90% of the image is a game's own artwork.

That is why the logo/mascot and Core UI need to be simple and repeatable.

The recognizable brand cues should come from:

- the symbol/mascot;
- wordmark;
- typography;
- one accent color or small palette;
- icon family;
- motion signature;
- framing / spacing logic.

Not from one giant permanent illustration style.

---

## 17. Research plan before final visual production

The next graphic-research round should study **systems**, not individual pretty posters.

Research categories:

- modern game-platform / launcher title screens;
- indie publisher brand idents;
- handheld-console UI and product identity;
- modern game title screens with minimal composition;
- physical product photography and small 3D installations;
- motion identities where a logo transforms into a UI viewport;
- social/community platforms with strong icon + mascot recognition;
- editorial 3D and tactile CGI that avoids glossy AI style;
- contemporary web experiences that transition from a spatial intro into live interface.

For every reference, evaluate:

- what survives at favicon size;
- how it transitions into UI;
- whether the identity works without its hero image;
- whether it feels modern rather than retro;
- whether it can coexist with very different games;
- what motion is part of the brand rather than decoration.

---

## 18. Recommended next design exercise

Do **three coherent systems**, not fifteen unrelated home pictures.

Each system should include the same deliverables:

- logo/mascot proposal;
- splash/home frame;
- first feed frame;
- in-game Core frame;
- comments/profile sheet;
- 3–5 second entry transition storyboard.

Suggested systems to prototype:

### System A — Device Portal

Sparse tactile 3D scene + live screen. Recommended first candidate.

### System B — Quiet Spatial Room

Minimal installation / portal screen + small mascot.

### System C — Kinetic Identity

Graphic logo/motion first, almost no illustrative environment.

Compare them as products, not as artworks.

---

## 19. Current recommendation

The strongest direction is currently **Device Portal + restrained modern Core**.

Why:

- it creates a literal transition into the product;
- it avoids representing the current game catalog;
- it can feel premium without making the whole platform retro;
- it gives the mascot/logo a real place to live;
- it naturally supports animation and lighting;
- it can be pre-rendered/lightweight rather than expensive realtime 3D;
- it makes the relationship between home, feed and in-game UI visible from the beginning.

The next visual research should therefore focus first on this direction, but compare it against one quieter spatial alternative and one graphic/motion alternative before locking the platform identity.
