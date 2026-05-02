-- ─────────────────────────────────────────────────────────────────
-- Seed fake users for Recover app
-- Run this BEFORE seed.sql
--
-- Creates fake auth users + their profiles in one transaction.
-- Passwords are all set to: Password123!
-- ─────────────────────────────────────────────────────────────────

-- Insert fake users directly into auth.users (Supabase allows this in SQL Editor)
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
values
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'sunrisewalker@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Sunrise Walker","recovery_start_date":"2026-04-01"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'riverstone@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"River Stone","recovery_start_date":"2026-03-15"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'quietharbor@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Quiet Harbor","recovery_start_date":"2025-10-30"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'morningtide@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Morning Tide","recovery_start_date":"2026-02-01"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'stillstanding@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Still Standing","recovery_start_date":"2026-01-10"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000000',
    'newchapter@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"New Chapter","recovery_start_date":"2025-12-01"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000000',
    'steadybreath@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Steady Breath","recovery_start_date":"2026-03-01"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000000',
    'openroad@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Open Road","recovery_start_date":"2025-04-26"}',
    false, 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000000',
    'clearsky@seed.recover',
    crypt('Password123!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"username":"Clear Sky","recovery_start_date":"2026-01-01"}',
    false, 'authenticated', 'authenticated'
  )
on conflict (id) do nothing;

-- The on_auth_user_created trigger will auto-create profile rows.
-- If the trigger isn't firing, run this to create profiles manually:
insert into public.profiles (id, username, tracking_mode, recovery_start_date)
values
  ('00000000-0000-0000-0000-000000000002', 'Sunrise Walker',  'auto_increment', '2026-04-01'),
  ('00000000-0000-0000-0000-000000000003', 'River Stone',     'auto_increment', '2026-03-15'),
  ('00000000-0000-0000-0000-000000000004', 'Quiet Harbor',    'auto_increment', '2025-10-30'),
  ('00000000-0000-0000-0000-000000000005', 'Morning Tide',    'auto_increment', '2026-02-01'),
  ('00000000-0000-0000-0000-000000000006', 'Still Standing',  'auto_increment', '2026-01-10'),
  ('00000000-0000-0000-0000-000000000007', 'New Chapter',     'auto_increment', '2025-12-01'),
  ('00000000-0000-0000-0000-000000000008', 'Steady Breath',   'auto_increment', '2026-03-01'),
  ('00000000-0000-0000-0000-000000000009', 'Open Road',       'auto_increment', '2025-04-26'),
  ('00000000-0000-0000-0000-000000000010', 'Clear Sky',       'auto_increment', '2026-01-01')
on conflict (id) do nothing;
