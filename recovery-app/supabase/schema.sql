drop table if exists replies cascade;
drop table if exists posts cascade;
drop table if exists checkins cascade;
drop table if exists relapse_patterns cascade;
drop table if exists profiles cascade;
drop view if exists replies_with_sender cascade;
drop trigger if exists on_auth_user_created on auth.users;

-- ─── Profiles ────────────────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  tracking_mode text not null default 'auto_increment'
    check (tracking_mode in ('daily_checkin', 'auto_increment')),
  recovery_start_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view and edit their own profile"
  on profiles for all using (auth.uid() = id);

-- ─── Auto-create profile on signup ───────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, recovery_start_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'Anonymous'),
    coalesce(
      (new.raw_user_meta_data->>'recovery_start_date')::date,
      current_date
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Posts ───────────────────────────────────────────────────────
-- user_id is nullable so seed posts don't require a real auth user
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  type text not null check (type in ('milestone', 'happy', 'vent')),
  content text not null,
  anonymous_name text not null,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;
create policy "Authenticated users can read posts"
  on posts for select using (auth.role() = 'authenticated');
create policy "Users can create posts"
  on posts for insert with check (auth.uid() = user_id);
create policy "Users manage their own posts"
  on posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts"
  on posts for delete using (auth.uid() = user_id);

-- ─── Replies ─────────────────────────────────────────────────────
create table replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table replies enable row level security;
create policy "Only sender and recipient can see replies"
  on replies for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Authenticated users can send replies"
  on replies for insert with check (auth.uid() = sender_id);

-- View that joins sender username so the frontend doesn't need a second query
create view replies_with_sender as
  select
    r.id,
    r.post_id,
    r.sender_id,
    r.recipient_id,
    r.content,
    r.created_at,
    p.username as sender_name
  from replies r
  join profiles p on p.id = r.sender_id;

-- ─── Check-ins ───────────────────────────────────────────────────
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('clean', 'relapse')),
  note text,
  relapse_reason text,
  ai_tags text[] default '{}',
  ai_processed boolean default false,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table checkins enable row level security;
create policy "Users manage their own checkins"
  on checkins for all using (auth.uid() = user_id);

-- ─── Relapse Patterns ────────────────────────────────────────────
-- side = 'regression'  → triggers that lead to relapse
-- side = 'protective'  → habits that help stay clean
create table relapse_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  pattern_type text not null,
  description text not null,
  frequency int not null default 1,
  tags text[] default '{}',
  last_seen date,
  side text not null default 'regression'
    check (side in ('regression', 'protective')),
  created_at timestamptz not null default now()
);

alter table relapse_patterns enable row level security;
create policy "Users can view their own patterns"
  on relapse_patterns for all using (auth.uid() = user_id);
