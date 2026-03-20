-- Enable pgcrypto for UUIDs
create extension if not exists pgcrypto;

-- 1. Create User Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  points integer default 0, -- 积分奖励系统
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Posts Table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references profiles(id) on delete cascade not null,
  category text not null, -- e.g., '经验分享', '求助讨论'
  title text not null,
  content text not null,
  tags text[] default '{}',
  views integer default 0,
  reward_points integer default 0, -- 悬赏积分
  is_resolved boolean default false, -- 是否已采纳
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Replies Table
create table if not exists replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_accepted boolean default false, -- 是否被采纳
  likes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create function to accept a reply and award points
create or replace function accept_reply(p_reply_id uuid, p_post_id uuid, p_author_id uuid)
returns void as $$
declare
  v_post_author uuid;
  v_reply_author uuid;
  v_reward_points integer;
begin
  -- 获取帖子作者和悬赏积分
  select author_id, reward_points into v_post_author, v_reward_points 
  from posts where id = p_post_id;
  
  -- 只有帖子作者可以采纳，且帖子未被采纳
  if v_post_author != p_author_id then
    raise exception '只有帖子作者可以采纳回复';
  end if;

  -- 获取回复作者
  select author_id into v_reply_author from replies where id = p_reply_id;

  -- 标记回复为采纳
  update replies set is_accepted = true where id = p_reply_id;
  
  -- 标记帖子为已解决
  update posts set is_resolved = true where id = p_post_id;

  -- 给回复作者增加悬赏积分 (模拟积分系统)
  if v_reward_points > 0 then
    update profiles set points = points + v_reward_points where id = v_reply_author;
  end if;
end;
$$ language plpgsql security definer;

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table replies enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies for posts
create policy "Posts are viewable by everyone." on posts for select using (true);
create policy "Users can create posts." on posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts." on posts for update using (auth.uid() = author_id);

-- Policies for replies
create policy "Replies are viewable by everyone." on replies for select using (true);
create policy "Users can create replies." on replies for insert with check (auth.uid() = author_id);
create policy "Users can update own replies." on replies for update using (auth.uid() = author_id);
