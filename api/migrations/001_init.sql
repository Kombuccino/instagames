CREATE TABLE IF NOT EXISTS identities (
  id uuid PRIMARY KEY,
  kind text NOT NULL DEFAULT 'anonymous' CHECK (kind IN ('anonymous', 'user')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  identity_id uuid NOT NULL UNIQUE REFERENCES identities(id) ON DELETE CASCADE,
  email text UNIQUE,
  password_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  identity_id uuid PRIMARY KEY REFERENCES identities(id) ON DELETE CASCADE,
  handle text UNIQUE,
  display_name text,
  bio text,
  avatar_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY,
  handle text NOT NULL UNIQUE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY,
  creator_id uuid REFERENCES creators(id) ON DELETE SET NULL,
  title text,
  description text,
  status text NOT NULL DEFAULT 'published',
  published_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_plays (
  id uuid PRIMARY KEY,
  game_id text NOT NULL,
  identity_id uuid REFERENCES identities(id) ON DELETE SET NULL,
  started_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS game_plays_game_started_idx ON game_plays (game_id, started_at DESC);

CREATE TABLE IF NOT EXISTS game_loves (
  game_id text NOT NULL,
  identity_id uuid NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (game_id, identity_id)
);
CREATE INDEX IF NOT EXISTS game_loves_game_idx ON game_loves (game_id);

CREATE TABLE IF NOT EXISTS game_bookmarks (
  game_id text NOT NULL,
  identity_id uuid NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (game_id, identity_id)
);
CREATE INDEX IF NOT EXISTS game_bookmarks_game_idx ON game_bookmarks (game_id);

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY,
  game_id text NOT NULL,
  identity_id uuid REFERENCES identities(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS comments_game_created_idx ON comments (game_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY,
  game_id text NOT NULL,
  identity_id uuid REFERENCES identities(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  score double precision NOT NULL,
  board_id text,
  run_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scores_game_created_idx ON scores (game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scores_game_score_desc_idx ON scores (game_id, score DESC);
CREATE UNIQUE INDEX IF NOT EXISTS scores_game_run_unique_idx ON scores (game_id, run_id) WHERE run_id IS NOT NULL;
