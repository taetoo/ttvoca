-- Public 스키마에 profiles 테이블을 생성합니다. (auth.users와 1:1 관계)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  nickname text not null check (char_length(nickname) <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) 활성화
alter table public.profiles enable row level security;

-- 누구나 프로필을 조회할 수 있도록 하거나(전체 공개), 본인만 조회 가능하게 할 수 있습니다. 
-- 여기서는 본인 정보만 조회 가능하게 설정합니다.
create policy "Users can view own profile."
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- 회원가입 시 자동으로 profiles 테이블에 데이터를 넣어줄 트리거를 만들 수도 있지만, 
-- 코드에서 직접 insert 하는 것이 관리가 편하므로 코드 단에서 처리할 예정입니다.
