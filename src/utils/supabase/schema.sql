create table public.user_word_status (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  word_id integer not null,
  status text check (status in ('memorized', 'confused', 'unknown')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, word_id)
);

-- Row Level Security (RLS) 설정
alter table public.user_word_status enable row level security;

create policy "Users can view own word status."
  on public.user_word_status for select
  using (auth.uid() = user_id);

create policy "Users can insert own word status."
  on public.user_word_status for insert
  with check (auth.uid() = user_id);

create policy "Users can update own word status."
  on public.user_word_status for update
  using (auth.uid() = user_id);
