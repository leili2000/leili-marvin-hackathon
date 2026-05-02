-- ─────────────────────────────────────────────────────────────────
-- Seed posts for Recover app
-- Run AFTER schema.sql and seed_users.sql
-- ─────────────────────────────────────────────────────────────────

insert into posts (id, user_id, type, content, anonymous_name, created_at)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'milestone',
    '30 days clean today. I honestly didn''t think I''d make it this far. One day at a time really does work.',
    'Sunrise Walker',
    '2026-05-01T10:23:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'happy',
    'Made breakfast for my kids this morning without feeling like a zombie. Small thing but it meant everything.',
    'River Stone',
    '2026-05-01T08:45:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    'milestone',
    '6 months. Half a year. I cried in the shower this morning — happy tears for once.',
    'Quiet Harbor',
    '2026-04-30T19:12:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    'happy',
    'My sponsor called just to check in, not because I reached out. Felt seen for the first time in a long time.',
    'Morning Tide',
    '2026-04-30T14:30:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    'vent',
    'Had a really hard week. Lost my job and the urge to use was overwhelming. I didn''t, but it was close. I''m scared of how close it was.',
    'Still Standing',
    '2026-04-29T22:15:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    'vent',
    'Relapsed after 47 days. I''m not giving up but I needed to say it out loud somewhere safe. Starting again tomorrow.',
    'New Chapter',
    '2026-04-28T20:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    'vent',
    'Family dinner was a trigger I didn''t see coming. The comments, the stress. I white-knuckled through it. Exhausted.',
    'Steady Breath',
    '2026-04-27T23:45:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    'milestone',
    '1 year. I remember thinking I''d never see this day. To anyone just starting — keep going.',
    'Open Road',
    '2026-04-26T12:00:00Z'
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000010',
    'happy',
    'Went for a run today. First time in years I did something just because it felt good, not to escape.',
    'Clear Sky',
    '2026-04-25T07:30:00Z'
  )
on conflict (id) do nothing;
