-- Recovery App — Full Database Schema (No Supabase Auth)
-- Uses custom username/password auth with pgcrypto for hashing.
-- RLS is disabled — access control is handled in the application layer.

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Profiles ────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username            TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  tracking_mode       TEXT NOT NULL DEFAULT 'auto_increment'
                        CHECK (tracking_mode IN ('daily_checkin', 'auto_increment')),
  recovery_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  favorite_color      TEXT NOT NULL DEFAULT '#4f8a6e',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Posts ───────────────────────────────────────────────────────
CREATE TABLE posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('milestone', 'happy', 'vent')),
  content        TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Replies ─────────────────────────────────────────────────────
CREATE TABLE replies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  sender_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  sender_name  TEXT NOT NULL DEFAULT 'Anonymous',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Check-ins ───────────────────────────────────────────────────
CREATE TABLE checkins (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date           DATE NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('clean', 'relapse')),
  note           TEXT,
  relapse_reason TEXT,
  ai_tags        TEXT[] DEFAULT '{}',
  ai_processed   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- ─── Relapse Patterns ────────────────────────────────────────────
CREATE TABLE relapse_patterns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL,
  description  TEXT NOT NULL,
  frequency    INT NOT NULL DEFAULT 1,
  tags         TEXT[] DEFAULT '{}',
  last_seen    DATE,
  side         TEXT NOT NULL DEFAULT 'regression'
                 CHECK (side IN ('regression', 'protective')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Happy Items ─────────────────────────────────────────────────
CREATE TABLE happy_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  energy_level INT NOT NULL DEFAULT 2 CHECK (energy_level BETWEEN 1 AND 5),
  prep_level   INT NOT NULL DEFAULT 1 CHECK (prep_level BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Relapse Word Flags ──────────────────────────────────────────
CREATE TABLE relapse_word_flags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  word      TEXT NOT NULL,
  frequency INT NOT NULL DEFAULT 1,
  last_seen DATE,
  UNIQUE (user_id, word)
);

-- ─── Auth helper functions ───────────────────────────────────────

-- Sign up: create a new profile with hashed password
CREATE OR REPLACE FUNCTION public.signup(
  p_username TEXT,
  p_password TEXT,
  p_recovery_start_date DATE DEFAULT CURRENT_DATE,
  p_favorite_color TEXT DEFAULT '#4f8a6e'
)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO profiles (username, password_hash, recovery_start_date, favorite_color)
  VALUES (p_username, crypt(p_password, gen_salt('bf')), p_recovery_start_date, p_favorite_color)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sign in: verify username + password, return profile id or null
CREATE OR REPLACE FUNCTION public.signin(
  p_username TEXT,
  p_password TEXT
)
RETURNS UUID AS $$
DECLARE
  found_id UUID;
BEGIN
  SELECT id INTO found_id
  FROM profiles
  WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash);
  RETURN found_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
