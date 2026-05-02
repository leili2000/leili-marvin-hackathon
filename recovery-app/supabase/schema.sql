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

-- Auto-create profile row when a new auth user signs up
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
  on conflict (id) do nothing;  -- safe to call multiple times
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
  user_id uuid,  -- nullable: seed posts have no real author
  type text not null check (type in ('milestone', 'happy', 'vent')),
  content text not null,
  anonymous_name text not null,
  created_at timestamptz not null default now()
);

alter table posts enable row level security;

-- Anyone authenticated can read all posts
create policy "Authenticated users can read posts"
  on posts for select using (auth.role() = 'authenticated');

-- Users can insert their own posts
create policy "Users can create posts"
  on posts for insert with check (auth.uid() = user_id);

-- Users can update/delete their own posts
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

-- ─── Check-ins ───────────────────────────────────────────────────
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('clean', 'relapse')),
  note text,
  relapse_reason text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table checkins enable row level security;
create policy "Users manage their own checkins"
  on checkins for all using (auth.uid() = user_id);

-- ─── Relapse Patterns ────────────────────────────────────────────
-- Populated by AI analysis of relapse_reason text from checkins
create table relapse_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  pattern_type text not null,
  description text not null,
  frequency int not null default 1,
  created_at timestamptz not null default now()
);

alter table relapse_patterns enable row level security;
create policy "Users can view their own patterns"
  on relapse_patterns for all using (auth.uid() = user_id);
