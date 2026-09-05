# MiniFugg Platform Economy

This document is the product/economic contract for MiniFugg. It defines how coins, Lifetime access, pricing and monetization should appear and behave across Core, discovery and game-launch flows.

Read together with `docs/DISCOVERY_NAVIGATION.md` for how coin state affects cover browsing and launch UX.

## 1. Executive summary

MiniFugg is an arcade platform, not a conventional mobile F2P economy.

- **Free access:** every free player receives **40 renewable coins per day**.
- **Play cost depends on curation status:** Fugg = 2 coins, Bêta = 1 coin, Caca = free.
- **Coins launch/relaunch games; they do not buy power, levels or gameplay advantages.**
- **Main coin display is unified:** the UI shows one total coin number, even though Core internally tracks renewable daily coins separately from durable coins.
- **Durable coins:** purchased, gifted or otherwise permanent coins never expire.
- **Spend order:** use renewable daily coins first, then durable coins.
- **Daily refresh:** the renewable portion resets to the account's daily allowance; unused renewable coins do not stack indefinitely.
- **Occasional free coins:** MiniFugg may sometimes give or reveal bonus coins as small surprises.
- **Lifetime:** a one-time purchase raises the renewable allowance to **999 coins per day**. Lifetime is deliberately not mathematically unlimited.
- **Founder pricing:** Lifetime starts at **€9.99 until MiniFugg reaches 50 games**, then rises to **€12.99**. Later increases may continue gradually toward a soft ceiling around **€15** as the catalog grows.
- **Lifetime is never discounted as a normal sales tactic.** Its value proposition is that buying earlier is cheaper; the price only moves upward as MiniFugg grows.
- **Coin packs may be discounted heavily.** A reference offer is approximately **500 durable coins for €7–8**, with exact commercial values adjustable.
- **Successful MiniFugg games may become separate premium standalone products.** Lifetime applies to the MiniFugg platform catalog, not every future standalone edition.
- **Additional revenue:** OSTs, merch and other fan/collector products are encouraged when the universe supports them.

## 2. Play cost by status

The current Core pricing contract is:

| Status | Cost per play |
| --- | ---: |
| `fugg` | **2 coins** |
| `beta` | **1 coin** |
| `trash` / Caca | **0 coins** |

A replay is another play and uses the same cost unless Core explicitly grants a free retry later.

Individual games must never decide their own MiniFugg coin price.

This replaces the former invariant `1 coin = 1 play`.

The durable invariant is now:

> **Coins are arcade play tokens. The session price is determined centrally by game curation status.**

Do not turn MiniFugg coins into a generic premium currency for skins, power, upgrades, levels or pay-to-win mechanics.

## 3. Coin accounting

Core must keep at least two internal balances:

1. `dailyCoins`: renewable allowance for the current day.
2. `durableCoins`: purchased, gifted or permanent bonus coins.

The daily allowance depends on account entitlement:

- free account: **40 daily coins**;
- Lifetime account: **999 daily coins**.

The player-facing default balance is:

`displayedCoins = dailyCoins + durableCoins`

The normal UI must **not** split these into two currencies. A player should simply see a coin icon and one number.

When a paid play is started:

1. determine the Core status cost for the game;
2. consume renewable daily coins first;
3. if the renewable portion is insufficient, consume the remainder from durable coins;
4. if the combined balance is insufficient, present the out-of-coins / purchase flow;
5. Caca games with a 0-coin cost never debit the balance.

At the daily refresh, `dailyCoins` returns to the account's current daily allowance. `durableCoins` is unchanged.

Example for a free account: a player with 500 durable coins begins a refreshed day with a displayed total of 540. Paid plays consume from the 40 renewable coins first, then from the durable balance. If 480 durable coins remain at the next daily refresh, the displayed total becomes 520.

Example for a Lifetime account: with no durable balance, a refreshed day begins at 999 coins. Plays debit that visible balance normally; the next daily refresh restores the renewable portion to 999.

## 4. Balance UI

The default coin counter shows only the combined total.

For players it should remain visible during the full-screen cover discovery flow so the player always understands whether the current game is affordable.

The player may inspect its composition without cluttering the main interface:

- desktop: hover/focus/click detail;
- touch: tap or equivalent compact detail interaction.

The detail may explain the renewable daily share, durable share and next refresh. This is explanatory UI, not two separate player-facing currencies.

Lifetime users display their real remaining coin count. **Do not use `∞` for Lifetime.**

## 5. Discovery behavior at zero coins

Running out of coins must not turn MiniFugg into a dead-end paywall.

The discovery algorithm changes weighting instead. The exact cover-navigation contract is in `docs/DISCOVERY_NAVIGATION.md`.

Current target:

- while balance > 0: mostly Fugg, around 1 Bêta in 10, Caca normally absent from the standard weighted rotation;
- at balance = 0: around half the discovery slots become free Caca games, while the other half continue exposing Fugg/Bêta covers.

This preserves catalog discovery while always leaving something playable for free.

A Lifetime account is theoretically able to reach zero after consuming its 999 renewable coins plus any durable balance; if that happens, the normal zero-coin discovery behavior applies until refresh or additional durable coins are available.

## 6. Arcade design language

Monetization must be integrated into MiniFugg's fiction and visual language.

Prefer concepts such as:

- `INSERT COIN`;
- coin insertion / arcade-machine feedback;
- a visibly huge 999-coin daily allowance for Lifetime owners rather than mathematical infinity;
- physical/arcade metaphors for finding a stray or stuck coin;
- a short metallic `clang` synchronized with launching a paid game.

The play transition may visually feel like opening a game box / sleeve after the coin is accepted.

Avoid presenting MiniFugg like a SaaS subscription page or a generic mobile-game gem store.

Lifetime owners should still see and spend coins through the same arcade ritual. Their advantage is a 999-coin renewable daily allowance, not an infinite state.

## 7. Free bonus coins

MiniFugg may occasionally award small numbers of free durable coins or grant a free play through contextual surprises.

A canonical example is discovering a coin already stuck/left in the machine just before starting a game.

These rewards should:

- feel like small arcade-world surprises rather than a second progression system;
- remain simple and understandable;
- not create gameplay advantages;
- not require games to implement their own economy;
- keep the daily allowance meaningful.

## 8. Commercial offers

### Free

- €0
- full catalog discovery;
- 40 renewable coins per day;
- Fugg plays cost 2 coins;
- Bêta plays cost 1 coin;
- Caca plays are free;
- eligible for occasional bonus coins.

### Coin pack

Reference offer: approximately 500 durable coins for approximately €7–8.

Exact pack size/pricing may be tuned, but the commercial role is stable:

- finite, durable play credit;
- can be discounted;
- can participate in Steam/store sales and temporary promotions;
- may serve as a lower-commitment purchase while making Lifetime visibly attractive by comparison.

### Lifetime

One-time purchase that raises the account's renewable daily allowance to **999 coins per day** for the MiniFugg catalog, current and future.

Lifetime is intentionally finite in accounting terms. The player continues to see, insert and spend coins normally; 999/day is simply high enough to behave as effectively unrestricted for normal use while preserving the platform's coin language and accounting model.

Pricing policy:

- €9.99 Founder price until 50 games;
- €12.99 from 50 games;
- later catalog milestones may raise the price gradually toward roughly €15;
- do not run normal percentage-off promotions on Lifetime;
- communicate clearly that the current price is an early-buyer price and increases as the catalog grows.

The price history should be credible: do not use fake countdowns or recurring artificial urgency.

## 9. Standalone games, OST and merch

MiniFugg also acts as a discovery/incubation platform.

When a game performs unusually well, it may receive a more developed standalone edition sold separately. The MiniFugg version remains available in the catalog; the standalone can add substantial modes, content, progression, art/audio production or other scope that does not belong in the compact MiniFugg version.

A MiniFugg Lifetime purchase does **not** automatically include separate standalone products.

Other valid revenue extensions include OST releases, soundtrack collections, print-on-demand merchandise, character/game-universe merchandise and other fan products that do not distort game balance.

## 10. Architecture and ownership

The economy belongs to **MiniFugg Core**, not to individual games.

Games should only request/start a session through Core and should not:

- maintain their own coin balance;
- decide their own curation-price mapping;
- implement purchase flows;
- distinguish purchased vs daily coins;
- import storefront SDKs;
- gate local content with MiniFugg coins.

Core/store adapters are responsible for web, Steam, mobile-store or other platform-specific purchase implementations while preserving the same player-facing economic semantics.

For online accounts, the server is the source of truth for daily allowance, durable balance, debits and refreshes. Lifetime is represented as an account entitlement that changes the daily renewable allowance from 40 to 999.

For offline-capable Lifetime builds, Core may maintain a local 999/day allowance and reconcile when connectivity returns. This offline quota is a convenience feature for a paying user, not a high-security DRM boundary; do not make legitimate offline play fragile merely to prevent determined local tampering.
