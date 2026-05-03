-- ─────────────────────────────────────────────────────────────────
-- Recovery App — Consolidated Seed Data
-- Run AFTER schema.sql
-- All passwords: Password123!
--
-- 3 fake profiles, 10 posts, 30 check-ins per user (90 total),
-- 5 relapse patterns per user, 3 happy items per user,
-- and relapse word flags derived from check-in notes.
-- ─────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════════
-- Fixed UUIDs for the 3 seed users
-- ═══════════════════════════════════════════════════════════════════
-- User A: 00000000-0000-0000-0000-000000000001  (Sunrise Walker)
-- User B: 00000000-0000-0000-0000-000000000002  (River Stone)
-- User C: 00000000-0000-0000-0000-000000000003  (Quiet Harbor)

-- ═══════════════════════════════════════════════════════════════════
-- 1. Profiles (with hashed passwords — all passwords: Password123!)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO profiles (id, username, password_hash, tracking_mode, recovery_start_date, favorite_color, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sunrise Walker',  crypt('Password123!', gen_salt('bf')), 'daily_checkin',   '2025-03-01', '#4f8a6e', now()),
  ('00000000-0000-0000-0000-000000000002', 'River Stone',     crypt('Password123!', gen_salt('bf')), 'auto_increment',  '2025-02-15', '#6b5b95', now()),
  ('00000000-0000-0000-0000-000000000003', 'Quiet Harbor',    crypt('Password123!', gen_salt('bf')), 'daily_checkin',   '2025-01-10', '#d4a373', now())
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- 3. Posts (10 posts — mix of milestone, happy, vent)
--    user_id is nullable; some use seed profile UUIDs, some use NULL
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO posts (id, user_id, type, content, anonymous_name, created_at)
VALUES
  -- Milestone posts
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'milestone',
    '30 days clean today. I honestly didn''t think I''d make it this far. One day at a time really does work.',
    'Sunrise Walker',
    now() - interval '9 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'milestone',
    '6 months. Half a year. I cried in the shower this morning — happy tears for once.',
    'Quiet Harbor',
    now() - interval '8 days'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    NULL,
    'milestone',
    '1 year. I remember thinking I''d never see this day. To anyone just starting — keep going.',
    'Open Road',
    now() - interval '14 days'
  ),

  -- Happy posts
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'happy',
    'Made breakfast for my kids this morning without feeling like a zombie. Small thing but it meant everything.',
    'River Stone',
    now() - interval '7 days'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    NULL,
    'happy',
    'My sponsor called just to check in, not because I reached out. Felt seen for the first time in a long time.',
    'Morning Tide',
    now() - interval '6 days'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'happy',
    'Went for a run today. First time in years I did something just because it felt good, not to escape.',
    'Sunrise Walker',
    now() - interval '3 days'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000003',
    'happy',
    'Planted some herbs on my windowsill. Watching something grow feels like a metaphor I needed.',
    'Quiet Harbor',
    now() - interval '1 day'
  ),

  -- Vent posts
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000002',
    'vent',
    'Had a really hard week. Lost my job and the urge to use was overwhelming. I didn''t, but it was close. I''m scared of how close it was.',
    'River Stone',
    now() - interval '5 days'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    NULL,
    'vent',
    'Relapsed after 47 days. I''m not giving up but I needed to say it out loud somewhere safe. Starting again tomorrow.',
    'New Chapter',
    now() - interval '4 days'
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000001',
    'vent',
    'Family dinner was a trigger I didn''t see coming. The comments, the stress. I white-knuckled through it. Exhausted.',
    'Sunrise Walker',
    now() - interval '2 days'
  )
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- 4. Check-ins — 30 per user spanning ~60 days
--    Mix of clean and relapse, with notes and relapse reasons on some.
--    Dates are relative to now() so the data always looks recent.
-- ═══════════════════════════════════════════════════════════════════

-- ── User A: Sunrise Walker (daily_checkin mode) ──────────────────
-- Recovery start: 2025-03-01. Mostly clean with a few relapses.
INSERT INTO checkins (id, user_id, date, status, note, relapse_reason, ai_tags, ai_processed)
VALUES
  ('20000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', (current_date - 59), 'clean',   'First day logging. Feeling cautiously hopeful.',                    NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', (current_date - 57), 'clean',   'Went to a meeting. Felt good to be around people who understand.',  NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', (current_date - 55), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', (current_date - 53), 'relapse', 'Couldn''t sleep. The loneliness hit hard.',                          'loneliness', '{"loneliness","insomnia"}', true),
  ('20000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', (current_date - 51), 'clean',   'Back on track. Called my sponsor.',                                 NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001', (current_date - 49), 'clean',   'Cooked dinner for myself. Small victory.',                          NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000001', (current_date - 47), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001', (current_date - 44), 'clean',   'Journaling helps. Writing things down makes them smaller.',         NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000009', '00000000-0000-0000-0000-000000000001', (current_date - 41), 'relapse', 'Stressed about money. Felt overwhelmed and gave in.',               'financial stress', '{"stress","financial","overwhelmed"}', true),
  ('20000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000001', (current_date - 39), 'clean',   'Talked to a counselor. Feeling more grounded.',                     NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000011', '00000000-0000-0000-0000-000000000001', (current_date - 36), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000001', (current_date - 33), 'clean',   'Two weeks since last slip. Grateful.',                              NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000001', (current_date - 30), 'clean',   'Went for a long walk. Nature helps clear my head.',                 NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000014', '00000000-0000-0000-0000-000000000001', (current_date - 27), 'relapse', 'Argument with family. Felt angry and alone.',                       'family conflict', '{"anger","family","lonely"}', true),
  ('20000000-0000-0000-0001-000000000015', '00000000-0000-0000-0000-000000000001', (current_date - 25), 'clean',   'Apologized. It was hard but necessary.',                            NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000016', '00000000-0000-0000-0000-000000000001', (current_date - 23), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000017', '00000000-0000-0000-0000-000000000001', (current_date - 20), 'clean',   'Started reading again. Forgot how much I loved it.',                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000018', '00000000-0000-0000-0000-000000000001', (current_date - 17), 'clean',   'Good day. Nothing special, just... normal. That''s enough.',        NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000019', '00000000-0000-0000-0000-000000000001', (current_date - 15), 'relapse', 'Ran into an old friend from using days. Triggered hard.',           'social trigger', '{"trigger","social","nostalgia"}', true),
  ('20000000-0000-0000-0001-000000000020', '00000000-0000-0000-0000-000000000001', (current_date - 13), 'clean',   'Blocked that number. Protecting my peace.',                         NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000021', '00000000-0000-0000-0000-000000000001', (current_date - 11), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000022', '00000000-0000-0000-0000-000000000001', (current_date - 9),  'clean',   'Feeling stronger. The gaps between hard days are getting longer.',  NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000023', '00000000-0000-0000-0000-000000000001', (current_date - 7),  'clean',   'Helped someone at a meeting today. Giving back feels right.',       NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000024', '00000000-0000-0000-0000-000000000001', (current_date - 6),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000025', '00000000-0000-0000-0000-000000000001', (current_date - 5),  'clean',   'Stressed about work but didn''t let it spiral.',                    NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000026', '00000000-0000-0000-0000-000000000001', (current_date - 4),  'clean',   'Feeling lonely tonight but reaching out instead of isolating.',     NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000027', '00000000-0000-0000-0000-000000000001', (current_date - 3),  'clean',   'Meditation is becoming a habit. 10 minutes every morning.',         NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000028', '00000000-0000-0000-0000-000000000001', (current_date - 2),  'relapse', 'Bad day. Overwhelmed at work, couldn''t cope.',                     'work stress', '{"stress","overwhelmed","work"}', true),
  ('20000000-0000-0000-0001-000000000029', '00000000-0000-0000-0000-000000000001', (current_date - 1),  'clean',   'Dusting myself off. Tomorrow is a new day.',                        NULL, '{}', false),
  ('20000000-0000-0000-0001-000000000030', '00000000-0000-0000-0000-000000000001', current_date,        'clean',   'Checking in. Still here.',                                          NULL, '{}', false)
ON CONFLICT (user_id, date) DO NOTHING;


-- ── User B: River Stone (auto_increment mode) ────────────────────
-- Recovery start: 2025-02-15. More relapses, struggling but persistent.
INSERT INTO checkins (id, user_id, date, status, note, relapse_reason, ai_tags, ai_processed)
VALUES
  ('20000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', (current_date - 58), 'clean',   'Day one again. I''ve lost count of how many day ones.',             NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', (current_date - 56), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002', (current_date - 54), 'relapse', 'Boredom is a killer. Nothing to do, nowhere to go.',                'boredom', '{"boredom","isolation"}', true),
  ('20000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002', (current_date - 52), 'clean',   'Signed up for a pottery class. Need to fill the empty hours.',      NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000002', (current_date - 50), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000002', (current_date - 47), 'relapse', 'Payday. Money in my pocket is dangerous.',                          'financial trigger', '{"money","trigger","payday"}', true),
  ('20000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000002', (current_date - 45), 'clean',   'Gave my card to my sister for safekeeping. Humbling but smart.',    NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000008', '00000000-0000-0000-0000-000000000002', (current_date - 43), 'clean',   'Pottery class was actually fun. Made a lopsided bowl.',             NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000009', '00000000-0000-0000-0000-000000000002', (current_date - 40), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000010', '00000000-0000-0000-0000-000000000002', (current_date - 37), 'relapse', 'Anniversary of my dad''s passing. The grief was unbearable.',        'grief', '{"grief","anniversary","loss"}', true),
  ('20000000-0000-0000-0002-000000000011', '00000000-0000-0000-0000-000000000002', (current_date - 35), 'clean',   'Visited his grave sober. First time.',                              NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000012', '00000000-0000-0000-0000-000000000002', (current_date - 32), 'clean',   'Making the lopsided bowl into a planter. Recovery metaphor.',       NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000013', '00000000-0000-0000-0000-000000000002', (current_date - 29), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000014', '00000000-0000-0000-0000-000000000002', (current_date - 26), 'relapse', 'Couldn''t sleep again. The anxiety was crushing.',                   'insomnia', '{"insomnia","anxiety","crushing"}', true),
  ('20000000-0000-0000-0002-000000000015', '00000000-0000-0000-0000-000000000002', (current_date - 24), 'clean',   'Doctor prescribed something for sleep. Hopeful.',                   NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000016', '00000000-0000-0000-0000-000000000002', (current_date - 22), 'clean',   'Slept 7 hours. Felt like a miracle.',                               NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000017', '00000000-0000-0000-0000-000000000002', (current_date - 19), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000018', '00000000-0000-0000-0000-000000000002', (current_date - 16), 'relapse', 'Party at a friend''s house. Should have said no to going.',          'social pressure', '{"social","pressure","party"}', true),
  ('20000000-0000-0000-0002-000000000019', '00000000-0000-0000-0000-000000000002', (current_date - 14), 'clean',   'Told my friend I can''t come to parties anymore. They understood.', NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000020', '00000000-0000-0000-0000-000000000002', (current_date - 12), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000021', '00000000-0000-0000-0000-000000000002', (current_date - 10), 'clean',   'Kids drew me a picture. "Best dad." I want to be that person.',     NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000022', '00000000-0000-0000-0000-000000000002', (current_date - 8),  'relapse', 'Boredom again. Same pattern. Need to recognize it sooner.',          'boredom', '{"boredom","pattern","restless"}', true),
  ('20000000-0000-0000-0002-000000000023', '00000000-0000-0000-0000-000000000002', (current_date - 7),  'clean',   'Downloaded a puzzle app. Anything to keep my hands busy.',          NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000024', '00000000-0000-0000-0000-000000000002', (current_date - 6),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000025', '00000000-0000-0000-0000-000000000002', (current_date - 5),  'clean',   'Feeling restless but holding on.',                                  NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000026', '00000000-0000-0000-0000-000000000002', (current_date - 4),  'clean',   'Made dinner with the kids. Spaghetti everywhere. Worth it.',        NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000027', '00000000-0000-0000-0000-000000000002', (current_date - 3),  'clean',   'Anxiety creeping in. Trying to breathe through it.',                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000028', '00000000-0000-0000-0000-000000000002', (current_date - 2),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000029', '00000000-0000-0000-0000-000000000002', (current_date - 1),  'clean',   'One more day. That''s all I need to do.',                           NULL, '{}', false),
  ('20000000-0000-0000-0002-000000000030', '00000000-0000-0000-0000-000000000002', current_date,        'clean',   'Still here. Still trying.',                                         NULL, '{}', false)
ON CONFLICT (user_id, date) DO NOTHING;


-- ── User C: Quiet Harbor (daily_checkin mode) ────────────────────
-- Recovery start: 2025-01-10. Longer recovery, fewer relapses, more reflective notes.
INSERT INTO checkins (id, user_id, date, status, note, relapse_reason, ai_tags, ai_processed)
VALUES
  ('20000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003', (current_date - 60), 'clean',   'Starting fresh with this app. 4 months into recovery already.',     NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003', (current_date - 58), 'clean',   'Therapy session went well. Learning about my attachment patterns.', NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000003', (current_date - 55), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000003', (current_date - 52), 'clean',   'Planted herbs on the windowsill. Basil, mint, rosemary.',           NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000003', (current_date - 49), 'relapse', 'Exhaustion caught up with me. Working too many hours.',              'exhaustion', '{"exhaustion","overwork","burnout"}', true),
  ('20000000-0000-0000-0003-000000000006', '00000000-0000-0000-0000-000000000003', (current_date - 47), 'clean',   'Talked to my boss about reducing hours. They were supportive.',     NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000007', '00000000-0000-0000-0000-000000000003', (current_date - 44), 'clean',   'The basil is sprouting. Tiny green leaves.',                        NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000008', '00000000-0000-0000-0000-000000000003', (current_date - 41), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000009', '00000000-0000-0000-0000-000000000003', (current_date - 38), 'clean',   'Went to the ocean. Sat and watched the waves for an hour.',         NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000010', '00000000-0000-0000-0000-000000000003', (current_date - 35), 'relapse', 'Loneliness again. It''s the quiet evenings that get me.',            'loneliness', '{"loneliness","evening","quiet"}', true),
  ('20000000-0000-0000-0003-000000000011', '00000000-0000-0000-0000-000000000003', (current_date - 33), 'clean',   'Joined an online book club. Trying to build connections.',          NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000012', '00000000-0000-0000-0000-000000000003', (current_date - 30), 'clean',   'Reading "The Body Keeps the Score." Eye-opening.',                  NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000013', '00000000-0000-0000-0000-000000000003', (current_date - 27), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000014', '00000000-0000-0000-0000-000000000003', (current_date - 24), 'clean',   'Made pesto from my own basil. Tasted like accomplishment.',         NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000015', '00000000-0000-0000-0000-000000000003', (current_date - 21), 'relapse', 'Holiday weekend. Everyone drinking. Felt like an outsider.',         'social isolation', '{"holiday","drinking","outsider","isolation"}', true),
  ('20000000-0000-0000-0003-000000000016', '00000000-0000-0000-0000-000000000003', (current_date - 19), 'clean',   'Hosted a sober brunch instead. Three people came. Enough.',         NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000017', '00000000-0000-0000-0000-000000000003', (current_date - 16), 'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000018', '00000000-0000-0000-0000-000000000003', (current_date - 13), 'clean',   'Therapist says I''m making real progress. Hard to see it myself.',  NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000019', '00000000-0000-0000-0000-000000000003', (current_date - 11), 'clean',   'The mint is taking over the windowsill. Life finds a way.',         NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000020', '00000000-0000-0000-0000-000000000003', (current_date - 9),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000021', '00000000-0000-0000-0000-000000000003', (current_date - 8),  'clean',   'Book club met tonight. Talked about resilience. Felt it.',          NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000022', '00000000-0000-0000-0000-000000000003', (current_date - 7),  'clean',   'Quiet evening. Made tea. Didn''t need anything else.',              NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000023', '00000000-0000-0000-0000-000000000003', (current_date - 6),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000024', '00000000-0000-0000-0000-000000000003', (current_date - 5),  'clean',   'Feeling exhausted again. Need to watch that pattern.',              NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000025', '00000000-0000-0000-0000-000000000003', (current_date - 4),  'clean',   'Took the day off. Rested. That''s allowed.',                        NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000026', '00000000-0000-0000-0000-000000000003', (current_date - 3),  'clean',   'Ocean again. The waves don''t judge.',                              NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000027', '00000000-0000-0000-0000-000000000003', (current_date - 2),  'clean',   NULL,                                                                NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000028', '00000000-0000-0000-0000-000000000003', (current_date - 1),  'clean',   'Grateful for the small things today.',                              NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000029', '00000000-0000-0000-0000-000000000003', current_date,        'clean',   'Another day. Another chance.',                                      NULL, '{}', false),
  ('20000000-0000-0000-0003-000000000030', '00000000-0000-0000-0000-000000000003', (current_date - 46), 'clean',   'Woke up early. Watched the sunrise. Felt peaceful.',               NULL, '{}', false)
ON CONFLICT (user_id, date) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- 5. Relapse Patterns — 5 per user (mix of regression and protective)
-- ═══════════════════════════════════════════════════════════════════

-- ── User A: Sunrise Walker ───────────────────────────────────────
INSERT INTO relapse_patterns (id, user_id, pattern_type, description, frequency, tags, last_seen, side)
VALUES
  ('30000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'emotional',    'Loneliness and isolation in the evenings tend to precede relapses.',
   3, '{"loneliness","evening","isolation"}', current_date - 2, 'regression'),
  ('30000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'situational',  'Financial stress and feeling overwhelmed at work are common triggers.',
   2, '{"stress","financial","work"}', current_date - 2, 'regression'),
  ('30000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'social',       'Encounters with people from past using days create strong urges.',
   1, '{"social","trigger","nostalgia"}', current_date - 15, 'regression'),
  ('30000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001',
   'coping',       'Calling sponsor or counselor after a difficult day prevents escalation.',
   4, '{"sponsor","counselor","support"}', current_date - 1, 'protective'),
  ('30000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001',
   'activity',     'Journaling and reading provide healthy distraction and self-reflection.',
   3, '{"journaling","reading","reflection"}', current_date - 3, 'protective');

-- ── User B: River Stone ──────────────────────────────────────────
INSERT INTO relapse_patterns (id, user_id, pattern_type, description, frequency, tags, last_seen, side)
VALUES
  ('30000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002',
   'emotional',    'Boredom and restlessness are the most frequent relapse triggers.',
   3, '{"boredom","restless","idle"}', current_date - 8, 'regression'),
  ('30000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002',
   'financial',    'Having cash on hand after payday creates dangerous impulses.',
   1, '{"money","payday","impulse"}', current_date - 47, 'regression'),
  ('30000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002',
   'grief',        'Anniversaries and reminders of loss trigger deep emotional pain.',
   1, '{"grief","anniversary","loss"}', current_date - 37, 'regression'),
  ('30000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002',
   'activity',     'Pottery class and creative activities fill empty time constructively.',
   2, '{"pottery","creative","hobby"}', current_date - 5, 'protective'),
  ('30000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000002',
   'family',       'Spending quality time with kids strengthens motivation to stay clean.',
   3, '{"kids","family","motivation"}', current_date - 4, 'protective');

-- ── User C: Quiet Harbor ─────────────────────────────────────────
INSERT INTO relapse_patterns (id, user_id, pattern_type, description, frequency, tags, last_seen, side)
VALUES
  ('30000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003',
   'physical',     'Exhaustion and overwork lower defenses and make cravings harder to resist.',
   2, '{"exhaustion","overwork","burnout"}', current_date - 5, 'regression'),
  ('30000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003',
   'emotional',    'Loneliness during quiet evenings is a recurring vulnerability.',
   2, '{"loneliness","evening","quiet"}', current_date - 35, 'regression'),
  ('30000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000003',
   'social',       'Social events where others are drinking create feelings of exclusion.',
   1, '{"holiday","drinking","outsider"}', current_date - 21, 'regression'),
  ('30000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000003',
   'nature',       'Visiting the ocean and spending time in nature provides calm and perspective.',
   3, '{"ocean","nature","peace"}', current_date - 3, 'protective'),
  ('30000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000003',
   'community',    'Book club and sober social gatherings build meaningful connections.',
   2, '{"book club","community","connection"}', current_date - 8, 'protective');


-- ═══════════════════════════════════════════════════════════════════
-- 6. Happy Items — 3 per user with varying energy/prep levels (1–5)
-- ═══════════════════════════════════════════════════════════════════

-- ── User A: Sunrise Walker ───────────────────────────────────────
INSERT INTO happy_items (id, user_id, title, description, energy_level, prep_level, created_at)
VALUES
  ('40000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'Morning walk around the block',
   'Just 15 minutes outside. Fresh air and movement help reset my mood.',
   2, 1, now() - interval '20 days'),
  ('40000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'Call my sponsor',
   'Even a 5-minute check-in makes me feel less alone.',
   1, 1, now() - interval '15 days'),
  ('40000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001',
   'Cook a real meal from scratch',
   'Something about chopping vegetables and following a recipe is meditative.',
   4, 3, now() - interval '10 days');

-- ── User B: River Stone ──────────────────────────────────────────
INSERT INTO happy_items (id, user_id, title, description, energy_level, prep_level, created_at)
VALUES
  ('40000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002',
   'Puzzle app on my phone',
   'Keeps my hands and brain busy when cravings hit. No prep needed.',
   1, 1, now() - interval '7 days'),
  ('40000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002',
   'Pottery class',
   'Wednesday evenings. Getting my hands dirty in a good way.',
   3, 4, now() - interval '30 days'),
  ('40000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002',
   'Play board games with the kids',
   'They love it and I get to be present with them. Win-win.',
   2, 2, now() - interval '12 days');

-- ── User C: Quiet Harbor ─────────────────────────────────────────
INSERT INTO happy_items (id, user_id, title, description, energy_level, prep_level, created_at)
VALUES
  ('40000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003',
   'Sit by the ocean',
   'Drive to the coast and just watch the waves. Nothing else needed.',
   2, 3, now() - interval '25 days'),
  ('40000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003',
   'Tend the windowsill herbs',
   'Water them, trim them, smell the basil. Grounding and simple.',
   1, 1, now() - interval '18 days'),
  ('40000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000003',
   'Host a sober brunch',
   'Invite a few people over. Cook something nice. Build community.',
   5, 5, now() - interval '8 days');


-- ═══════════════════════════════════════════════════════════════════
-- 7. Relapse Word Flags — derived from the seeded check-in notes
--    Words that appeared disproportionately before relapses.
-- ═══════════════════════════════════════════════════════════════════

-- ── User A: Sunrise Walker ───────────────────────────────────────
INSERT INTO relapse_word_flags (id, user_id, word, frequency, last_seen)
VALUES
  ('50000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'loneliness',   3, current_date - 2),
  ('50000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'overwhelmed',  2, current_date - 2),
  ('50000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'stressed',     3, current_date - 5),
  ('50000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'angry',        2, current_date - 27),
  ('50000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001', 'trigger',      2, current_date - 15)
ON CONFLICT (user_id, word) DO NOTHING;

-- ── User B: River Stone ──────────────────────────────────────────
INSERT INTO relapse_word_flags (id, user_id, word, frequency, last_seen)
VALUES
  ('50000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000002', 'boredom',      3, current_date - 8),
  ('50000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000002', 'anxiety',      2, current_date - 3),
  ('50000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000002', 'restless',     2, current_date - 5),
  ('50000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000002', 'grief',        2, current_date - 37),
  ('50000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000002', 'crushing',     2, current_date - 26)
ON CONFLICT (user_id, word) DO NOTHING;

-- ── User C: Quiet Harbor ─────────────────────────────────────────
INSERT INTO relapse_word_flags (id, user_id, word, frequency, last_seen)
VALUES
  ('50000000-0000-0000-0003-000000000001', '00000000-0000-0000-0000-000000000003', 'exhaustion',   2, current_date - 5),
  ('50000000-0000-0000-0003-000000000002', '00000000-0000-0000-0000-000000000003', 'loneliness',   2, current_date - 35),
  ('50000000-0000-0000-0003-000000000003', '00000000-0000-0000-0000-000000000003', 'outsider',     2, current_date - 21),
  ('50000000-0000-0000-0003-000000000004', '00000000-0000-0000-0000-000000000003', 'exhausted',    2, current_date - 5),
  ('50000000-0000-0000-0003-000000000005', '00000000-0000-0000-0000-000000000003', 'drinking',     2, current_date - 21)
ON CONFLICT (user_id, word) DO NOTHING;
