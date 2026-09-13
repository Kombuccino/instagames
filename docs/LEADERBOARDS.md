# MiniFugg — Leaderboards

Canonical Core contract since 13 September 2026. This document supersedes older generic `DAY / WEEK / FRIENDS` wording in `PLATFORM_UI_SYSTEM.md` and `GAMEPLAY_SHELL.md` when they conflict.

Leaderboards belong to Core. Games only submit a finished score and, for a deterministic challenge, the exact board/challenge id they played.

## Two leaderboard families

### Daily challenge

Use for games where everybody plays the same dated challenge/grid.

- configuration: `mode: 'daily-challenge'`;
- one exact board per UTC calendar date;
- the panel can move to the previous/next day one day at a time;
- future dates are disabled;
- each date has `GLOBAL` and `FRIENDS` scopes;
- **no WEEK and no EVER board** for this mode;
- the game may submit an explicit board id such as `2026-09-13`; Core must preserve it exactly.

LineFugg is the first current daily-challenge game. Its deterministic grid and submitted `boardId` are both based on the same UTC date.

### Periodic / normal high score

Use for games whose runs are not tied to a shared daily board.

- configuration: `mode: 'periodic'`;
- default periods: `WEEK` and `EVER` (`weekly` and `global` internally);
- a game may expose only one of those periods when its product design calls for it;
- each period has `GLOBAL` and `FRIENDS` scopes;
- do not add a daily tab merely because Core can query timestamps by day.

`EVER` is the user-facing label for the internal `global` period.

## Ranking semantics

The API stores each finished run once. Periodic WEEK is a timestamp window over the raw runs; EVER is all runs for that game. A daily challenge uses the explicit challenge board id.

A leaderboard displays the best qualifying run per identity, not every run by the same player. `sort: desc` means larger score wins; `sort: asc` means smaller score wins.

Never fabricate a rank, player or friend score. The server returns whether a row belongs to the current identity so Core does not have to infer identity only from the nickname.

## Global / friends

`GLOBAL` considers all qualifying identities.

`FRIENDS` considers the current identity plus identities connected by an accepted friendship in the Core data model. The schema exists even before the account/friend-management UI is finished. If no accepted friends have a score, show an honest empty state; never populate the tab with sample players.

Friend discovery/add/remove/block UI is a separate Core account/social surface. It must not be implemented inside a game or faked by nicknames.

## API

Read:

`GET /v1/leaderboards/:gameId/:boardId?limit=100&sort=desc&scope=global|friends`

Submit a finished run:

`POST /v1/scores`

For a daily challenge, send its exact `boardId`. For a periodic run, omit `boardId`; WEEK and EVER remain server views over the same stored run.

The legacy board-specific POST endpoint remains only for old/special callers.
