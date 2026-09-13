# MiniFugg Platform Data Model v1

MiniFugg Core owns social state, discussions, plays, friendships and competitive scores. Games only report gameplay events through the shared runtime.

## Recommended production database

Use PostgreSQL as the source of truth.

### identities / profiles

An anonymous identity cookie exists before full account creation. Profiles may provide handle, display name, bio and avatar. Future account linking upgrades the identity without discarding its history.

### creators / games

The schema can support multiple creators later, but the current public house creator identity is Fuggy; see `CREATOR_IDENTITY.md`. The Info panel does not duplicate a creator's game catalog.

### game_plays

One row per counted play/session, indexed by game and start time.

### game_loves / game_bookmarks

One row per `(game_id, identity_id)`.

### comments

Shared discussions are server-authoritative.

- `id` UUID primary key
- `game_id` text
- `identity_id` UUID nullable
- `nickname` text
- `body` text
- `created_at` timestamptz
- `deleted_at` timestamptz nullable

The current product exposes real flat comments. Reply/like/report controls are not shown until those features have real persisted behavior. A browser-local comment must never be presented as a public/shared comment.

### friendships

Accepted relationships power the FRIENDS leaderboard scope.

- `identity_id` UUID
- `friend_identity_id` UUID
- `status`: `pending`, `accepted` or `blocked`
- timestamps
- no self relationship

A relationship is treated symmetrically for ranking when its status is `accepted`. Account/friend management UI is separate from the leaderboard itself.

### scores

Store every submitted run exactly once.

- `id` UUID primary key
- `game_id` text
- `identity_id` UUID nullable
- `nickname` text
- `score` numeric
- `board_id` text nullable
- `run_id` optional unique run proof/id
- `metadata` jsonb
- `created_at` timestamptz

Periodic WEEK and EVER boards are views over these raw rows. A deterministic daily game supplies its exact board id, e.g. `2026-09-13`.

The ranking query keeps the best qualifying run per identity. Competitive client submissions remain untrusted until game-specific validation/run proofs are added.

## Leaderboard contract

See `LEADERBOARDS.md` for the canonical product behavior.

- daily challenge: exact date navigation + GLOBAL / FRIENDS; no EVER;
- periodic: WEEK and/or EVER + GLOBAL / FRIENDS;
- never manufacture players, friends or ranks.

## Core API surface

- `GET /v1/me`
- `PUT /v1/me/profile`
- `GET /v1/games/:gameId/stats`
- `POST /v1/games/:gameId/plays`
- `PUT|DELETE /v1/games/:gameId/love`
- `PUT|DELETE /v1/games/:gameId/bookmark`
- `GET|POST /v1/games/:gameId/comments`
- `POST /v1/scores`
- `GET /v1/leaderboards/:gameId/:boardId?scope=global|friends`
- legacy `POST /v1/leaderboards/:gameId/:boardId`

Comments and official social/competitive data use the remote Core API. Local browser storage remains useful for non-authoritative development state, but it must not masquerade as shared discussion or official friend data.
