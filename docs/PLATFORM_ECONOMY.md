# MiniFugg Platform Economy

This document is the product/economic contract for MiniFugg. It defines coins, Lifetime access, paid-game offline access and the trust boundary between client and server.

Read together with `docs/DISCOVERY_NAVIGATION.md` and `docs/PLATFORM_EXPORTS.md`.

## 1. Executive summary

MiniFugg is an arcade platform, not a conventional mobile F2P economy.

- Free account: **40 renewable coins per day**.
- Fugg play: **2 coins**.
- Bêta play: **1 coin**.
- Caca / `trash` play: **free**.
- Durable purchased/gifted coins do not expire.
- Renewable coins are spent before durable coins.
- Lifetime raises the renewable allowance to **999 coins per day**; it is not mathematical infinity.
- Lifetime Founder price: **€9.99 until 50 games**, then **€12.99**, with later gradual increases possible toward roughly €15.
- Coin packs may be discounted; Lifetime is not normally discounted.
- Successful MiniFugg games may also become separately sold premium standalone products.
- A game that the player has purchased/owns may be allowed to run offline.
- Offline local economy is deliberately untrusted and never enters official ladders/server economy.

## 2. Play cost by curation status

| Status | Cost per play |
| --- | ---: |
| `fugg` | **2 coins** |
| `beta` | **1 coin** |
| `trash` / Caca | **0 coins** |

A replay is another play unless Core explicitly grants a free retry.

Individual games never determine their MiniFugg price.

> Coins are arcade play tokens. Session price is determined centrally by curation status.

Coins are not a pay-to-win currency and must not buy gameplay power inside individual games.

## 3. Online coin accounting

Core/server keeps at least:

1. `dailyCoins`: renewable allowance for the current day;
2. `durableCoins`: purchased, gifted or otherwise permanent coins.

Allowances:

- free account: **40 daily coins**;
- Lifetime account: **999 daily coins**.

Player-facing balance:

`displayedCoins = dailyCoins + durableCoins`

The default UI shows one coin total, not two currencies.

Spend order:

1. determine game cost from Core curation status;
2. spend renewable daily coins first;
3. spend durable coins for any remainder;
4. if total is insufficient, open the out-of-coins/purchase flow;
5. free Caca games do not debit the wallet.

At daily refresh, `dailyCoins` returns to the account allowance and `durableCoins` is unchanged.

## 4. Server authority

For connected play, the backend is the source of truth for:

- daily allowance and refresh;
- durable balance;
- debits;
- purchases;
- entitlements;
- official rewards;
- official leaderboard eligibility.

The client may cache/display state but may not authoritatively declare its wallet balance.

Never accept a reconnect message equivalent to “my local wallet now contains X coins”.

## 5. Paid/owned game offline access

If a player **owns a game**, MiniFugg may allow that owned game to launch offline.

This is intentionally different from trying to make the shared online arcade economy authoritative while disconnected.

Offline rules:

- the game is playable normally;
- local saves/progression may exist;
- local coins or other local values may be altered by the owner and that is acceptable;
- **no offline run is submitted to an official ladder**;
- **no offline run grants an official server reward**;
- local wallet values are never merged upward into the server wallet;
- reconnecting returns to the server-authoritative account/economy state.

A locally cached signed entitlement/license may prove that the game was previously purchased/owned. It should make legitimate offline use robust without pretending to be unbreakable DRM.

If a determined owner cracks their own offline client, the security impact should be limited to their local experience.

## 6. Lifetime vs owned standalone games

Lifetime is a MiniFugg platform entitlement that raises the renewable online daily allowance to **999 coins/day**.

It must not be casually conflated with ownership of every separately sold standalone game unless the product policy explicitly grants that entitlement.

A separately purchased game may have offline access because it is owned. MiniFugg Lifetime remains governed by its own catalog/coin entitlement rules.

## 7. Balance UI

The main coin counter shows the combined online balance.

Players may inspect renewable/durable composition in secondary detail UI, but the main experience should remain one understandable arcade balance.

Lifetime users see their real remaining count. Do **not** display `∞`.

## 8. Zero-coin discovery

Running out of coins must not create a dead-end paywall.

Current target weighting:

- balance > 0: mostly Fugg, around 1 Bêta in 10, Caca normally absent from standard weighted rotation;
- balance = 0: roughly half of discovery opportunities may become free Caca games while Fugg/Bêta covers remain discoverable.

Exact discovery behavior belongs in `docs/DISCOVERY_NAVIGATION.md`.

## 9. Arcade design language

Prefer:

- `INSERT COIN`;
- physical coin feedback;
- metallic launch sound;
- visibly huge `999` allowance for Lifetime rather than infinity;
- occasional “coin already stuck in the machine” surprises.

Avoid SaaS-subscription aesthetics and generic mobile gem-store language.

## 10. Bonus coins

MiniFugg may occasionally grant small durable bonuses or a contextual free play.

These should feel like arcade-world surprises, not a second progression economy. Individual games never implement their own MiniFugg wallet.

## 11. Commercial offers

### Free

- €0;
- full catalog discovery;
- 40 renewable coins/day;
- Fugg = 2 coins;
- Bêta = 1 coin;
- Caca = free.

### Coin pack

Reference offer: approximately **500 durable coins for €7–8**. Exact tuning may change. Coin packs may participate in temporary promotions.

### Lifetime

One-time MiniFugg platform purchase:

- 999 renewable coins/day;
- Founder price €9.99 until 50 games;
- €12.99 from 50 games;
- later gradual increases may approach roughly €15;
- no routine percentage-off discounting.

The credible proposition is “buying earlier is cheaper as the catalog grows”, not fake countdown urgency.

## 12. Standalone games, OST and merch

MiniFugg can incubate games that later receive larger standalone editions sold separately. A standalone can add substantial content, progression, production value or modes while the compact MiniFugg version remains in the platform catalog.

MiniFugg Lifetime does not automatically include every future separately sold standalone product.

OST releases, soundtrack collections, print-on-demand and universe merchandise are valid extensions when they do not distort game balance.

## 13. Architecture ownership

Economy belongs to Core/backend, not games.

Games must not:

- maintain MiniFugg wallet truth;
- decide curation pricing;
- implement store purchase flows;
- distinguish renewable vs durable wallet internals;
- import Steam/App Store/Google Play billing SDKs;
- submit offline scores to official ladders.

Core/store adapters preserve the same player-facing semantics across web, mobile and desktop distribution.
