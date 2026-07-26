-- profiles: add avatar_url (safe no-op if the column already exists)
alter table public.profiles
  add column if not exists avatar_url text;

-- profiles RLS: replace the owner-only read policy from the previous
-- migration with a public-read / owner-write policy set.
drop policy if exists "Profiles are viewable by owner" on public.profiles;
drop policy if exists "Profiles are insertable by owner" on public.profiles;
drop policy if exists "Profiles are updatable by owner" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- portfolios

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null,
  is_public boolean not null default false,
  content jsonb,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists portfolios_user_id_idx on public.portfolios (user_id);

alter table public.portfolios enable row level security;

drop policy if exists "portfolios_select" on public.portfolios;
drop policy if exists "portfolios_insert_own" on public.portfolios;
drop policy if exists "portfolios_update_own" on public.portfolios;
drop policy if exists "portfolios_delete_own" on public.portfolios;

create policy "portfolios_select"
  on public.portfolios for select
  using (is_public = true or auth.uid() = user_id);

create policy "portfolios_insert_own"
  on public.portfolios for insert
  with check (auth.uid() = user_id);

create policy "portfolios_update_own"
  on public.portfolios for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "portfolios_delete_own"
  on public.portfolios for delete
  using (auth.uid() = user_id);

-- files

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  storage_path text not null,
  file_type text,
  size integer,
  created_at timestamptz not null default now()
);

create index if not exists files_portfolio_id_idx on public.files (portfolio_id);

alter table public.files enable row level security;

drop policy if exists "files_select" on public.files;
drop policy if exists "files_insert_own" on public.files;
drop policy if exists "files_update_own" on public.files;
drop policy if exists "files_delete_own" on public.files;

create policy "files_select"
  on public.files for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = files.portfolio_id
        and (p.is_public = true or p.user_id = auth.uid())
    )
  );

create policy "files_insert_own"
  on public.files for insert
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = files.portfolio_id
        and p.user_id = auth.uid()
    )
  );

create policy "files_update_own"
  on public.files for update
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = files.portfolio_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
      where p.id = files.portfolio_id
        and p.user_id = auth.uid()
    )
  );

create policy "files_delete_own"
  on public.files for delete
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = files.portfolio_id
        and p.user_id = auth.uid()
    )
  );
