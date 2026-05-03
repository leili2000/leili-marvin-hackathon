-- Recovery App — Full Database Schema

-- Profiles
CREATE TABLE profiles (
  id                  UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username            TEXT NOT NULL,
  tracking_mode       TEXT NOT NULL DEFAULT 'auto_increment'
                        CHECK (tracking_mode IN ('daily_checkin', 'auto_increment')),
  recovery_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  favorite_color      TEXT NOT NULL DEFAULT '#4f8a6e',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and edit their own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $func$
BEGIN
  INSERT INTO public.profiles (id, username, recovery_start_date, favorite_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Anonymous'),
    COALESCE(
      (NEW.raw_user_meta_data->>'recovery_start_date')::DATE,
      CURRENT_DATE
    ),
    COALESCE(NEW.raw_user_meta_data->>'favorite_color', '#4f8a6e')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Posts (user_id nullable for seed data)
CREATE TABLE posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID,
  type           TEXT NOT NULL CHECK (type IN ('milestone', 'happy', 'vent')),
  content        TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read posts"
  ON posts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage their own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- Replies
CREATE TABLE replies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  sender_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only sender and recipient can see replies"
  ON replies FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send replies"
  ON replies FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Check-ins
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

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own checkins"
  ON checkins FOR ALL USING (auth.uid() = user_id);

-- Relapse Patterns
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

ALTER TABLE relapse_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own patterns"
  ON relapse_patterns FOR ALL USING (auth.uid() = user_id);

-- Happy Items (NEW)
CREATE TABLE happy_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  energy_level INT NOT NULL DEFAULT 2 CHECK (energy_level BETWEEN 1 AND 5),
  prep_level   INT NOT NULL DEFAULT 1 CHECK (prep_level BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE happy_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own happy items"
  ON happy_items FOR ALL USING (auth.uid() = user_id);

-- Relapse Word Flags (NEW)
CREATE TABLE relapse_word_flags (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  word      TEXT NOT NULL,
  frequency INT NOT NULL DEFAULT 1,
  last_seen DATE,
  UNIQUE (user_id, word)
);

ALTER TABLE relapse_word_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own word flags"
  ON relapse_word_flags FOR ALL USING (auth.uid() = user_id);
