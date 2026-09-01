# MiniFugg Platform Data Model v1

MiniFugg Core owns social state, plays and competitive scores. Games only report gameplay events through the shared runtime.

## Recommended production database

Use PostgreSQL as the source of truth.

### creators

- `id` UUID primary key
- `handle` unique text
- `display_name` text nullable
- `created_at` timestamptz

### games

- `id` text primary key (same id as `gameRegistry`)
- `creator_id` UUID -> creators.id
- `title` text
- `description` text
- `published_at` timestamptz
- `status` text

### game_plays

One row per counted play/session.

- `id` UUID primary key
- `game_id` text -> games.id
- `player_id` UUID nullable
- `anonymous_id` text nullable
- `started_at` timestamptz

Index: `(game_id, started_at)`.

A play should be counted when the game becomes active for the first time in a feed slot, not on every React render.

### game_loves

- `game_id` text -> games.id
- `player_id` UUID (or anonymous identity while accounts do not exist)
- `created_at` timestamptz

Unique: `(game_id, player_id)`.

### game_bookmarks

- `game_id` text -> games.id
- `player_id` UUID
- `created_at` timestamptz

Unique: `(game_id, player_id)`.

### comments

- `id` UUID primary key
- `game_id` text -> games.id
- `player_id` UUID nullable
- `nickname` text
- `body` text
- `created_at` timestamptz
- `deleted_at` timestamptz nullable

Index: `(game_id, created_at desc)`.

### scores

Store every submitted score once. Daily and weekly leaderboards are queries/views over these rows; do not duplicate the score just to create periods.

- `id` UUID primary key
- `game_id` text -> games.id
- `player_id` UUID nullable
- `nickname` text
- `score` numeric
- `run_id` UUID/text nullable
- `metadata` jsonb
- `created_at` timestamptz

Indexes:

- `(game_id, created_at desc)`
- `(game_id, score desc)` for descending-score games

For competitive games, client-only score submission is not secure. A later version should add run proofs or game-specific server validation.

## Leaderboard periods

The API exposes periods, while PostgreSQL keeps raw timestamps.

- Daily: UTC day, e.g. `day:2026-09-01`
- Weekly: ISO week, e.g. `week:2026-W36`
- Global: `global`

The server converts the requested board id into a timestamp window when necessary.

## API shape

Existing score transport remains:

- `GET /v1/leaderboards/:gameId/:boardId?limit=10&sort=desc`
- `POST /v1/leaderboards/:gameId/:boardId`

Social/core endpoints planned by the client:

- `GET /v1/games/:gameId/stats`
- `POST /v1/games/:gameId/plays`
- `PUT /v1/games/:gameId/love`
- `DELETE /v1/games/:gameId/love`
- `PUT /v1/games/:gameId/bookmark`
- `DELETE /v1/games/:gameId/bookmark`
- `GET /v1/games/:gameId/comments`
- `POST /v1/games/:gameId/comments`

Until the remote API exists, MiniFugg Core uses a browser-local fallback so UI development does not block on infrastructure.
