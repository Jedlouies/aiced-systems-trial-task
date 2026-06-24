

create table notes (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references groups(id) on delete cascade,
  author_id  uuid not null references users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


grant select, insert on notes to authenticated;


alter table notes enable row level security;


-- 1. A user may read notes ONLY for groups they are a member of
create policy "Users can view notes in their groups"
  on notes for select
  to authenticated
  using (
    exists (
      select 1 
      from memberships 
      where memberships.group_id = notes.group_id 
        and memberships.user_id = auth.uid()
    )
  );

-- 2. A user may create notes ONLY for groups they are a member of, and must be the author
create policy "Users can create notes in their groups"
  on notes for insert
  to authenticated
  with check (
    author_id = auth.uid() and
    exists (
      select 1 
      from memberships 
      where memberships.group_id = notes.group_id 
        and memberships.user_id = auth.uid()
    )
  );