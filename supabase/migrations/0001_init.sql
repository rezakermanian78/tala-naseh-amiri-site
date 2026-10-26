-- ─────────────────────────────────────────────────────────────────────────────
-- Tala Naseh Amiri site — schema, Row Level Security and storage.
-- Run once in Supabase → SQL Editor (or `supabase db push`). Then run seed.sql.
--
-- Security model
--   • anon (public site): read visible content, insert contact messages only.
--   • admin: the single authenticated user whose JWT email is the allowed address.
--     Everyone else — including other signed-in users — gets the anon permissions.
-- ─────────────────────────────────────────────────────────────────────────────

-- Admin check used by every write policy. Change the email here (and only here) to
-- hand the admin panel to someone else.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = 'talanasehamiri@gmail.com'
$$;

-- Keeps updated_at current on every UPDATE.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profile & SEO (exactly one row, id = 1) ─────────────────────────────────
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  name_en text not null default '',
  name_fa text not null default '',
  headline_en text not null default '',
  headline_fa text not null default '',
  tagline_en text not null default '',
  tagline_fa text not null default '',
  status_en text not null default '',
  status_fa text not null default '',
  -- About section; paragraphs are separated by a blank line.
  bio_en text not null default '',
  bio_fa text not null default '',
  content_intro_en text not null default '',
  content_intro_fa text not null default '',
  goals_intro_en text not null default '',
  goals_intro_fa text not null default '',
  research_interests_en text[] not null default '{}',
  research_interests_fa text[] not null default '{}',
  email text not null default '',
  linkedin_url text not null default '',
  github_url text not null default '',
  instagram_url text not null default '',
  avatar_url text not null default '',
  cv_url text not null default '',
  seo_title_en text not null default '',
  seo_title_fa text not null default '',
  seo_description_en text not null default '',
  seo_description_fa text not null default '',
  updated_at timestamptz not null default now()
);

-- ── List sections ───────────────────────────────────────────────────────────
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  group_en text not null default '',
  group_fa text not null default '',
  name_en text not null default '',
  name_fa text not null default '',
  level smallint check (level between 0 and 5),
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.languages (
  id uuid primary key default gen_random_uuid(),
  name_en text not null default '',
  name_fa text not null default '',
  -- Shown next to the name, e.g. the language's own name ("Deutsch").
  native_en text not null default '',
  native_fa text not null default '',
  level smallint not null default 3 check (level between 0 and 5),
  level_en text not null default '',
  level_fa text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_fa text not null default '',
  institution_en text not null default '',
  institution_fa text not null default '',
  field_en text not null default '',
  field_fa text not null default '',
  -- Free text so "2019", "Sep 2019" or "Present" all work.
  start_date text not null default '',
  end_date text not null default '',
  description_en text not null default '',
  description_fa text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_fa text not null default '',
  badge_en text not null default '',
  badge_fa text not null default '',
  coauthors_en text not null default '',
  coauthors_fa text not null default '',
  description_en text not null default '',
  description_fa text not null default '',
  link text not null default '',
  image_url text not null default '',
  tags_en text[] not null default '{}',
  tags_fa text[] not null default '{}',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  authors text not null default '',
  venue_en text not null default '',
  venue_fa text not null default '',
  status_en text not null default '',
  status_fa text not null default '',
  year text not null default '',
  link text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_work (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_fa text not null default '',
  description_en text not null default '',
  description_fa text not null default '',
  link text not null default '',
  image_url text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null default '',
  caption_en text not null default '',
  caption_fa text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Contact messages ────────────────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message text not null check (char_length(message) between 1 and 5000),
  read boolean not null default false,
  -- md5 of the sender's IP, used only for rate limiting (raw IPs are never stored).
  ip_hash text,
  created_at timestamptz not null default now()
);
create index messages_created_at_idx on public.messages (created_at desc);
create index messages_ip_hash_idx on public.messages (ip_hash, created_at desc);

-- Server-side rate limit: at most 3 messages per IP per 10 minutes and 50 site-wide per hour.
-- Also forces read/created_at so the public cannot forge them.
create or replace function public.messages_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := split_part(coalesce(headers ->> 'x-forwarded-for', headers ->> 'x-real-ip', ''), ',', 1);
begin
  new.read := false;
  new.created_at := now();
  new.ip_hash := case when ip = '' then null else md5('tala-site:' || trim(ip)) end;

  if new.ip_hash is not null and (
    select count(*) from public.messages
    where ip_hash = new.ip_hash and created_at > now() - interval '10 minutes'
  ) >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  if (select count(*) from public.messages where created_at > now() - interval '1 hour') >= 50 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.messages_before_insert();

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['site_settings','skills','languages','education','projects','publications','content_work','gallery']
  loop
    execute format(
      'create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ── Row Level Security ──────────────────────────────────────────────────────
alter table public.site_settings enable row level security;
alter table public.skills enable row level security;
alter table public.languages enable row level security;
alter table public.education enable row level security;
alter table public.projects enable row level security;
alter table public.publications enable row level security;
alter table public.content_work enable row level security;
alter table public.gallery enable row level security;
alter table public.messages enable row level security;

-- Profile: everyone reads, admin writes.
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admin writes settings" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- List tables: everyone reads visible rows, admin reads and writes everything.
do $$
declare t text;
begin
  foreach t in array array['skills','languages','education','projects','publications','content_work','gallery']
  loop
    execute format(
      'create policy "public read visible" on public.%I for select to anon, authenticated using (visible or public.is_admin())',
      t
    );
    execute format(
      'create policy "admin insert" on public.%I for insert to authenticated with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "admin update" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      t
    );
    execute format(
      'create policy "admin delete" on public.%I for delete to authenticated using (public.is_admin())',
      t
    );
  end loop;
end;
$$;

-- Messages: anyone may send one, only the admin may read / mark read / delete.
create policy "anyone can send" on public.messages
  for insert to anon, authenticated with check (true);
create policy "admin reads messages" on public.messages
  for select to authenticated using (public.is_admin());
create policy "admin updates messages" on public.messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes messages" on public.messages
  for delete to authenticated using (public.is_admin());

-- Column privileges: the public can only fill in name/email/message.
revoke insert, update on public.messages from anon, authenticated;
grant insert (name, email, message) on public.messages to anon, authenticated;
grant update (read) on public.messages to authenticated;

-- ── Storage: "media" bucket (public read, admin write) ──────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public files are served from the public URL without a SELECT policy; these let the
-- admin list/overwrite/delete them.
create policy "admin reads media" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admin uploads media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admin updates media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
create policy "admin deletes media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
