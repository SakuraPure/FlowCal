-- Create a table for public profiles (optional, but good practice)
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text,
  full_name text,
  avatar_url text
  -- constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create Folders Table
create table public.folders (
    id text not null, -- using text ID to match local uuid strings
    user_id uuid references auth.users not null default auth.uid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    parent_id text,
    color text,
    icon text,
    is_expanded boolean default false,
    
    primary key (id, user_id) -- Composite PK ensures uniqueness per user
);

alter table public.folders enable row level security;

create policy "Users can view their own folders." on public.folders
    for select using (auth.uid() = user_id);

create policy "Users can insert their own folders." on public.folders
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own folders." on public.folders
    for update using (auth.uid() = user_id);

create policy "Users can delete their own folders." on public.folders
    for delete using (auth.uid() = user_id);

-- Create Tasks Table
create table public.tasks (
    id text not null,
    user_id uuid references auth.users not null default auth.uid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    title text not null,
    description text,
    status text not null, -- 'todo', 'in_progress', 'done'
    dates text[], -- Array of strings YYYY-MM-DD
    
    -- Hierarchy
    parent_id text,
    
    -- Advanced
    list_id text not null,
    start_date text,
    due_date text,
    
    -- Reminder JSON
    reminder jsonb,
    
    priority text not null default 'medium',
    tags text[],
    
    duration numeric default 0,
    
    -- Pomodoro JSON
    pomodoro jsonb,
    
    color_theme text,
    
    primary key (id, user_id)
);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks." on public.tasks
    for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks." on public.tasks
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks." on public.tasks
    for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks." on public.tasks
    for delete using (auth.uid() = user_id);

-- Create Sessions Table (for Pomodoro history)
create table public.sessions (
    id text not null,
    user_id uuid references auth.users not null default auth.uid(),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    task_id text not null,
    start_time bigint not null,
    end_time bigint not null,
    duration numeric not null,
    type text not null, -- 'pomodoro' | 'stopwatch'
    
    primary key (id, user_id)
);

alter table public.sessions enable row level security;

create policy "Users can view their own sessions." on public.sessions
    for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions." on public.sessions
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own sessions." on public.sessions
    for update using (auth.uid() = user_id);

create policy "Users can delete their own sessions." on public.sessions
    for delete using (auth.uid() = user_id);

-- Create Daily Activity Table
-- This can be an aggregation or just a simple record table
create table public.daily_activity (
    date text not null, -- YYYY-MM-DD
    user_id uuid references auth.users not null default auth.uid(),
    minutes numeric default 0,
    
    primary key (date, user_id)
);

alter table public.daily_activity enable row level security;

create policy "Users can view their own daily activity." on public.daily_activity
    for select using (auth.uid() = user_id);

create policy "Users can insert their own daily activity." on public.daily_activity
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own daily activity." on public.daily_activity
    for update using (auth.uid() = user_id);
