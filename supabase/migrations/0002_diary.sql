-- ─────────────────────────────────────────────────────────────
-- 0002 · 小岛日记
-- 一张事件表 + 一个私有照片桶
-- 执行方式（本地）：supabase db reset  或  supabase migration up
-- ─────────────────────────────────────────────────────────────

-- 1. 记录事件
create table if not exists public.diary_events (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid          not null references auth.users (id) on delete cascade,
  kind        text          not null check (kind in ('meal', 'water', 'poop', 'vomit', 'weight', 'mood', 'photo')),
  value_text  text          check (value_text is null or char_length(value_text) <= 32),
  value_num   numeric(6, 2) check (value_num is null or (value_num >= 0 and value_num <= 200)),
  note        text          check (note is null or char_length(note) <= 200),
  photo_path  text          check (photo_path is null or char_length(photo_path) <= 256),
  occurred_at timestamptz   not null default now(),
  created_at  timestamptz   not null default now()
);

comment on table public.diary_events is '小岛日记：吃饭/喝水/便便/呕吐/体重/心情/照片，一条记录一行';

-- 报告按时间区间查，这个索引是必须的
create index if not exists diary_events_user_time_idx
  on public.diary_events (user_id, occurred_at desc);

alter table public.diary_events enable row level security;

drop policy if exists "diary_events_owner" on public.diary_events;
create policy "diary_events_owner"
  on public.diary_events
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.diary_events from anon;
grant select, insert, update, delete on public.diary_events to authenticated;

-- 2. 照片桶：私有，只有本人能读自己目录下的对象
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'diary-photos',
  'diary-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

drop policy if exists "diary_photos_read_own" on storage.objects;
create policy "diary_photos_read_own"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'diary-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "diary_photos_insert_own" on storage.objects;
create policy "diary_photos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'diary-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "diary_photos_update_own" on storage.objects;
create policy "diary_photos_update_own"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'diary-photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'diary-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "diary_photos_delete_own" on storage.objects;
create policy "diary_photos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'diary-photos' and (storage.foldername(name))[1] = auth.uid()::text);
