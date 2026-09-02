# MiniFugg API deployment on Dokploy

The platform API lives in `api/` and uses PostgreSQL through `DATABASE_URL`.

## Dokploy application

Create a second Dokploy Application from the same repository:

- repository: `Kombuccino/instagames`
- branch: `main`
- build type: Dockerfile
- Dockerfile path: `api/Dockerfile`
- container port: `3000`

Recommended application name: `minifugg-api`.

## Environment variables

Set these only on the API service:

```env
DATABASE_URL=<paste Dokploy PostgreSQL Internal Connection URL here>
PORT=3000
CORS_ORIGIN=https://minifugg.proto.xroot.com
COOKIE_SECURE=true
```

Never expose `DATABASE_URL` to the Vite frontend and never commit it.

If the PostgreSQL password contains URL-reserved characters, use Dokploy's Internal Connection URL exactly as displayed rather than reconstructing it manually.

## Domain

Recommended public domain:

`https://api.minifugg.proto.xroot.com`

Route it to container port `3000` and enable HTTPS.

Health endpoint:

`GET /health`

Expected response:

```json
{"ok":true}
```

## Database migrations

The API runs `api/migrations/001_init.sql` automatically before it starts listening. The migration is idempotent (`CREATE TABLE/INDEX IF NOT EXISTS`).

## Frontend connection

Set this build-time environment variable on the existing MiniFugg frontend service:

```env
VITE_MINIFUGG_API_URL=https://api.minifugg.proto.xroot.com
```

Then rebuild/redeploy the frontend. `src/core/platformApi.ts` will use the API with `credentials: include`; if the API is unavailable, the current browser-local fallback remains available.

## Identity model

The API creates an anonymous identity cookie (`mf_id`) automatically. Loves, bookmarks, comments, plays and scores are associated with that identity. A profile can already be stored for the identity, and the schema includes a `users` table so a later account/signup flow can upgrade/associate that identity without discarding the anonymous history.

## Current API surface

- `GET /health`
- `GET /v1/me`
- `PUT /v1/me/profile`
- `GET /v1/games/:gameId/stats`
- `POST /v1/games/:gameId/plays`
- `PUT|DELETE /v1/games/:gameId/love`
- `PUT|DELETE /v1/games/:gameId/bookmark`
- `GET|POST /v1/games/:gameId/comments`
- `POST /v1/scores`
- `GET /v1/leaderboards/:gameId/:boardId`
- legacy `POST /v1/leaderboards/:gameId/:boardId`
