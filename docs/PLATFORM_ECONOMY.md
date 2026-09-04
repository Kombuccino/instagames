# MiniFugg Platform Economy

This document is the product/economic contract for MiniFugg. It defines how coins, Free Play, pricing and monetization should appear and behave across Core, storefronts and game-launch flows.

## 1. Executive summary

MiniFugg is an arcade platform, not a conventional mobile F2P economy.

- **Free access:** every player receives **20 renewable coins per day**.
- **One coin = one play.** Coins launch/relaunch games; they do not buy power, levels or gameplay advantages.
- **Main coin display is unified:** the UI shows one total coin number, even though Core internally tracks renewable daily coins separately from durable coins.
- **Durable coins:** purchased, gifted or otherwise permanent coins never expire.
- **Spend order:** use renewable daily coins first, then durable coins.
- **Daily refresh:** the renewable portion returns to 20 each day; unused renewable coins do not stack indefinitely.
- **Occasional free coins:** MiniFugg may sometimes give or reveal bonus coins as small surprises. The intended everyday experience is roughly 20–25 available plays for an active free player, without turning this into a complicated reward economy.
- **Lifetime / Free Play:** a one-time purchase removes the coin limit for MiniFugg games forever.
- **Founder pricing:** Lifetime starts at **€9.99 until MiniFugg reaches 50 games**, then rises to **€12.99**. Later increases may continue gradually toward a soft ceiling around **€15** as the catalog grows.
- **Lifetime is never discounted as a normal sales tactic.** Its value proposition is that buying earlier is cheaper; the price only moves upward as MiniFugg grows.
- **Coin packs may be discounted heavily.** A reference offer is approximately **500 durable coins for €7–8**, with exact commercial values adjustable. This is the product that can participate in Steam/platform sales and deep promotions.
- **Successful MiniFugg games may become separate premium standalone products.** Lifetime covers unlimited play of games inside MiniFugg, not every future standalone edition.
- **Additional revenue:** OSTs, merch and other fan/collector products are encouraged when the universe supports them.

## 2. Coin accounting

Core must keep at least two internal balances:

1. `dailyCoins`: renewable allowance, maximum 20 after the daily refresh.
2. `durableCoins`: purchased, gifted or permanent bonus coins.

The player-facing default balance is:

`displayedCoins = dailyCoins + durableCoins`

The normal UI must **not** split these into two currencies. A player should simply see a coin icon and one number.

When a play is started:

1. consume one `dailyCoin` if available;
2. otherwise consume one `durableCoin`;
3. if neither is available, present the out-of-coins / Free Play purchase flow.

At the daily refresh, `dailyCoins` returns to 20. `durableCoins` is unchanged.

Example accounting: a player with 500 durable coins begins a refreshed day with a displayed total of 520. After the 20 renewable coins are consumed, plays begin using the durable balance. If 480 durable coins remain at the next daily refresh, the displayed total becomes 500.

## 3. Balance detail UI

The default coin counter shows only the combined total.

The player may inspect its composition without cluttering the main interface:

- desktop: hover/focus/click detail;
- touch: tap or equivalent compact detail interaction.

The detail may explain the renewable daily share, durable share and next refresh. This is explanatory UI, not two separate player-facing currencies.

## 4. Arcade design language

Monetization must be integrated into MiniFugg's fiction and visual language.

Prefer concepts such as:

- `INSERT COIN`
- coin insertion / arcade-machine feedback
- `FREE PLAY`
- an infinite-coin state for Lifetime owners
- physical/arcade metaphors for finding a stray or stuck coin

Avoid presenting MiniFugg like a SaaS subscription page or a generic mobile-game gem store.

A Lifetime owner may still see the coin-insertion ritual for continuity, but their usable balance should read as unlimited (`∞`) rather than decrementing.

## 5. Free bonus coins

MiniFugg may occasionally award small numbers of free durable coins or grant a free play through contextual surprises.

A canonical example is discovering a coin already stuck/left in the machine just before starting a game.

These rewards should:

- feel like small arcade-world surprises rather than a second progression system;
- remain simple and understandable;
- not create gameplay advantages;
- not require games to implement their own economy;
- keep the typical free player's usable daily play volume roughly in the 20–25 range rather than making the 20-coin allowance meaningless.

## 6. Commercial offers

### Free

- €0
- full access to the MiniFugg catalog, subject to available coins
- 20 renewable coins per day
- eligible for occasional free bonus coins

### Coin pack

Reference offer: approximately 500 durable coins for approximately €7–8.

Exact pack size/pricing may be tuned, but the commercial role is stable:

- finite, durable plays;
- can be discounted;
- can participate in Steam/store sales and temporary promotions;
- may serve as a lower-commitment purchase while making Lifetime visibly attractive by comparison.

### Lifetime / Free Play

One-time purchase for unlimited plays of all games that exist **inside MiniFugg**, current and future.

Pricing policy:

- €9.99 Founder price until 50 games;
- €12.99 from 50 games;
- later catalog milestones may raise the price gradually toward roughly €15;
- do not run normal percentage-off promotions on Lifetime;
- communicate clearly that the current price is an early-buyer price and increases as the catalog grows.

The price history should be credible: do not use fake countdowns or recurring artificial urgency.

## 7. Standalone games, OST and merch

MiniFugg also acts as a discovery/incubation platform.

When a game performs unusually well, it may receive a more developed standalone edition sold separately. The MiniFugg version remains available in the catalog; the standalone can add substantial modes, content, progression, art/audio production or other scope that does not belong in the compact MiniFugg version.

A MiniFugg Lifetime purchase does **not** automatically include separate standalone products.

Other valid revenue extensions include:

- OST releases;
- soundtrack collections;
- print-on-demand merchandise such as shirts and illustrated products;
- character/game-universe merchandise;
- other collector/fan products that do not distort game balance.

Prefer print-on-demand/partner fulfillment where appropriate so merchandise does not require MiniFugg to hold inventory.

## 8. Architecture and ownership

The economy belongs to **MiniFugg Core**, not to individual games.

Games should only request/start a session through Core and should not:

- maintain their own coin balance;
- implement purchase flows;
- distinguish purchased vs daily coins;
- import storefront SDKs;
- gate local content with MiniFugg coins.

Core/store adapters are responsible for web, Steam, mobile-store or other platform-specific purchase implementations while preserving the same player-facing economic semantics.

## 9. Design invariant

The simplest durable rule is:

> **1 coin = 1 play.**

Do not evolve MiniFugg coins into a generic premium currency for skins, power, upgrades, levels or pay-to-win mechanics. If MiniFugg later sells cosmetics, merchandise, standalone games or other extras, keep those concepts commercially and visually distinct from the arcade-play coin unless this contract is explicitly revised.
