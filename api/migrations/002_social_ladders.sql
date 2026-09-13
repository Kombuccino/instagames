CREATE TABLE IF NOT EXISTS friendships (
  identity_id uuid NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  friend_identity_id uuid NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (identity_id, friend_identity_id),
  CHECK (identity_id <> friend_identity_id)
);
CREATE INDEX IF NOT EXISTS friendships_friend_status_idx ON friendships (friend_identity_id, status);
CREATE INDEX IF NOT EXISTS friendships_identity_status_idx ON friendships (identity_id, status);
