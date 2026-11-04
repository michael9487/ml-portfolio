-- 在 Supabase SQL Editor 執行一次即可。
-- 所有存取都走 Next.js API（service role），瀏覽器不直接連資料庫，
-- 所以每張表都開 RLS 且不開任何 policy，函式也不開放給 anon / authenticated。

create table if not exists line_users (
  user_id       text primary key,
  display_name  text,
  picture_url   text,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists project_views (
  id         bigint generated always as identity primary key,
  project_id text not null,
  visitor_id uuid not null,
  user_id    text references line_users (user_id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists project_views_project_idx on project_views (project_id);
create index if not exists project_views_dedupe_idx on project_views (visitor_id, project_id, created_at desc);

create table if not exists favorites (
  user_id    text not null references line_users (user_id) on delete cascade,
  project_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create table if not exists votes (
  user_id    text not null references line_users (user_id) on delete cascade,
  project_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

alter table line_users    enable row level security;
alter table project_views enable row level security;
alter table favorites     enable row level security;
alter table votes         enable row level security;

-- 同一訪客 30 分鐘內重複看同一專案只算一次，避免重新整理灌數字。
create or replace function record_view(p_project text, p_visitor uuid, p_user text)
returns void language plpgsql set search_path = public as $$
begin
  if not exists (
    select 1 from project_views
    where visitor_id = p_visitor and project_id = p_project
      and created_at > now() - interval '30 minutes'
  ) then
    insert into project_views (project_id, visitor_id, user_id)
    values (p_project, p_visitor, p_user);
  end if;
end $$;

-- 登入時把這個瀏覽器先前的匿名瀏覽綁到 LINE 帳號，
-- 不重複訪客才不會把登入前和登入後的同一個人算成兩位。
create or replace function claim_views(p_user text, p_visitor uuid)
returns void language sql set search_path = public as $$
  update project_views set user_id = p_user
  where visitor_id = p_visitor and user_id is null;
$$;

create or replace function project_stats()
returns table (project_id text, views bigint, visitors bigint, favorites bigint, votes bigint)
language sql stable set search_path = public as $$
  with ids as (
    select v.project_id from project_views v
    union select f.project_id from favorites f
    union select o.project_id from votes o
  )
  select
    i.project_id,
    (select count(*) from project_views v where v.project_id = i.project_id),
    (select count(distinct coalesce(v.user_id, v.visitor_id::text)) from project_views v where v.project_id = i.project_id),
    (select count(*) from favorites f where f.project_id = i.project_id),
    (select count(*) from votes o where o.project_id = i.project_id)
  from ids i;
$$;

create or replace function site_stats()
returns table (views bigint, visitors bigint)
language sql stable set search_path = public as $$
  select count(*), count(distinct coalesce(user_id, visitor_id::text)) from project_views;
$$;

create or replace function toggle_favorite(p_user text, p_project text)
returns text language plpgsql set search_path = public as $$
begin
  delete from favorites where user_id = p_user and project_id = p_project;
  if found then return 'removed'; end if;
  insert into favorites (user_id, project_id) values (p_user, p_project)
  on conflict do nothing;
  return 'added';
end $$;

-- 票數上限在資料庫內檢查；advisory lock 讓同一帳號的投票排隊，
-- 連點或同時開兩個分頁都無法超過上限。
create or replace function toggle_vote(p_user text, p_project text, p_max int)
returns text language plpgsql set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user, 0));
  delete from votes where user_id = p_user and project_id = p_project;
  if found then return 'removed'; end if;
  if (select count(*) from votes where user_id = p_user) >= p_max then
    return 'limit';
  end if;
  insert into votes (user_id, project_id) values (p_user, p_project);
  return 'added';
end $$;

revoke all on function record_view(text, uuid, text)       from public, anon, authenticated;
revoke all on function claim_views(text, uuid)             from public, anon, authenticated;
revoke all on function project_stats()                     from public, anon, authenticated;
revoke all on function site_stats()                        from public, anon, authenticated;
revoke all on function toggle_favorite(text, text)         from public, anon, authenticated;
revoke all on function toggle_vote(text, text, int)        from public, anon, authenticated;
grant execute on function record_view(text, uuid, text)    to service_role;
grant execute on function claim_views(text, uuid)          to service_role;
grant execute on function project_stats()                  to service_role;
grant execute on function site_stats()                     to service_role;
grant execute on function toggle_favorite(text, text)      to service_role;
grant execute on function toggle_vote(text, text, int)     to service_role;
