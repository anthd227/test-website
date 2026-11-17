-- 게시판 테이블과 함수
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여 넣고 한 번 실행한다.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.posts (
  id          bigint generated always as identity primary key,
  title       text not null check (char_length(title) between 1 and 100),
  content     text not null check (char_length(content) between 1 and 5000),
  nickname    text not null check (char_length(nickname) between 1 and 20),
  pw_hash     text not null,
  views       integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.posts enable row level security;

-- 비밀번호 해시는 밖에서 읽지 못하게 컬럼 단위로만 조회 허용
revoke all on public.posts from anon, authenticated;
grant select (id, title, content, nickname, views, created_at) on public.posts to anon, authenticated;

drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select to anon, authenticated using (true);

-- 글쓰기
create or replace function public.create_post(p_title text, p_content text, p_nickname text, p_password text)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_id bigint;
begin
  if char_length(coalesce(p_password, '')) < 4 then
    raise exception '비밀번호는 4자 이상이어야 합니다';
  end if;
  insert into posts (title, content, nickname, pw_hash)
  values (btrim(p_title), p_content, btrim(p_nickname), crypt(p_password, gen_salt('bf')))
  returning id into new_id;
  return new_id;
end;
$$;

-- 수정 (비밀번호가 맞을 때만)
create or replace function public.update_post(p_id bigint, p_title text, p_content text, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update posts
     set title = btrim(p_title), content = p_content
   where id = p_id
     and pw_hash = crypt(p_password, pw_hash);
  return found;
end;
$$;

-- 삭제 (비밀번호가 맞을 때만)
create or replace function public.delete_post(p_id bigint, p_password text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from posts
   where id = p_id
     and pw_hash = crypt(p_password, pw_hash);
  return found;
end;
$$;

-- 조회수 증가
create or replace function public.view_post(p_id bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update posts set views = views + 1 where id = p_id;
$$;

grant execute on function public.create_post(text, text, text, text) to anon, authenticated;
grant execute on function public.update_post(bigint, text, text, text) to anon, authenticated;
grant execute on function public.delete_post(bigint, text) to anon, authenticated;
grant execute on function public.view_post(bigint) to anon, authenticated;
