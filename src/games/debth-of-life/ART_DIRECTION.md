# DebthOfLife — Art Direction v2

## Direction

Custom **financial-paper side scroller**. The world is built from bank statements, contracts, ledger lines, balance sheets, bar charts, stamps and debt marks. It should look like somebody turned a lifetime of paperwork into a running track.

This replaces the previous bright comic / emoji-card direction entirely.

## Core visual idea

The runner is a small black human silhouette carrying a briefcase through an enormous moving financial document.

- the ground is a bank-statement strip;
- distant buildings are financial bar charts / document columns;
- life decisions are large moving contract panels, one high and one low;
- unavoidable expenses are literal bills / invoices standing in the road;
- money pickups are blunt yellow euro coins;
- debt appears as a red territory advancing from the left toward the runner;
- as debt pressure rises, the paper becomes dirtier and darker rather than merely receiving a generic dark overlay.

## Palette

- ledger paper: `#EDE7D7`
- clean paper: `#F7F1E4`
- ink: `#151719`
- institutional navy: `#14324A`
- secondary blue: `#31566F`
- warning red: `#B42A22`
- deep warning red: `#7D211F`
- salary / action yellow: `#F0BD2D`
- muted gain green: `#1C6A4F`

No gradients, neon, glassmorphism, rounded app-card language or emoji-based game objects.

## Typography

Typography is part of the world, not a HUD skin:

- very bold Arial Narrow / condensed grotesk style for contract titles;
- small accounting labels for details;
- all consequences written directly on moving contracts;
- large terse financial impact captions after a choice.

The player must be able to read the two incoming choices quickly on a landscape phone.

## Gameplay language

The one-button mechanic is expressed visually as a binary vertical choice:

- stay low = sign the bottom contract;
- jump = sign the upper contract;
- longer hold makes the upper choice easier to reach;
- ageing progressively makes upper choices mechanically harder.

Neither lane is coded as universally good or bad. A high option may create debt but increase salary/assets; a low option may preserve cash but sacrifice long-term growth.

Between decision gates, invoice obstacles and euro pickups preserve runner timing and skill.

## Debt pressure

Debt is a physical pursuer. A red debt zone advances from the left based on financial pressure. It does not instantly kill the player; it communicates how close the life is to being financially swallowed.

Increasing pressure also dirties/desaturates the financial-paper world.

## Player ageing

The player remains an abstract black silhouette so the environment carries the visual identity.

Ageing changes:

- running cadence;
- forward bend;
- jump strength;
- scroll speed;
- eventual cane.

Do not turn ageing into a detailed character illustration system.

## End state

The final game-specific screen is a formal death / estate statement with:

- cash;
- assets;
- debt;
- net worth;
- life acquisitions.

It should look like a final accounting document, not a celebratory game-over card.

## Avoid

- emojis as objects;
- cute comic scenery;
- bright toy colors;
- obvious red hazard / green reward sorting;
- generic fintech dashboards;
- purely decorative darkness unrelated to debt pressure;
- tiny unreadable contracts;
- multiple gameplay buttons;
- fullscreen pointer capture or blocking the MiniFugg feed escape gesture.
