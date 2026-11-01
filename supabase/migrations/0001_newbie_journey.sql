-- ─────────────────────────────────────────────────────────────
-- 0001 · 新手航线
-- 三张表：任务打勾、适配测试结果、预算清单
-- 全部按 auth.uid() 做 owner-only 隔离
-- 执行方式（本地）：supabase db reset  或  supabase migration up
-- ─────────────────────────────────────────────────────────────

-- 1. 任务打勾：一行 = 用户完成了某个任务
create table if not exists public.newbie_progress (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  task_key     text        not null check (char_length(task_key) between 1 and 64),
  completed_at timestamptz not null default now(),
  primary key (user_id, task_key)
);

comment on table public.newbie_progress is '新手航线：用户勾选完成的任务';

alter table public.newbie_progress enable row level security;

drop policy if exists "newbie_progress_owner" on public.newbie_progress;
create policy "newbie_progress_owner"
  on public.newbie_progress
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. 适配测试结果：保留历史，最新一次生效
create table if not exists public.adoption_quiz_results (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  score      smallint    not null check (score between 0 and 100),
  verdict    text        not null,
  answers    jsonb       not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.adoption_quiz_results is '养宠适配测试：每次提交留一条，取最新';

create index if not exists adoption_quiz_results_user_time_idx
  on public.adoption_quiz_results (user_id, created_at desc);

alter table public.adoption_quiz_results enable row level security;

drop policy if exists "adoption_quiz_results_owner" on public.adoption_quiz_results;
create policy "adoption_quiz_results_owner"
  on public.adoption_quiz_results
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. 预算清单：一个用户一条，items 存 [{key,amount,included}]
create table if not exists public.pet_budget (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  items      jsonb       not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.pet_budget is '预算清单：用户改过的金额与勾选项';

alter table public.pet_budget enable row level security;

drop policy if exists "pet_budget_owner" on public.pet_budget;
create policy "pet_budget_owner"
  on public.pet_budget
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. 权限收敛：只给 authenticated，anon 一律不得读写
revoke all on public.newbie_progress        from anon;
revoke all on public.adoption_quiz_results  from anon;
revoke all on public.pet_budget             from anon;

grant select, insert, update, delete on public.newbie_progress       to authenticated;
grant select, insert, update, delete on public.adoption_quiz_results to authenticated;
grant select, insert, update, delete on public.pet_budget            to authenticated;
