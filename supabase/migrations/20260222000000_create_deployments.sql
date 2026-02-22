-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: create_deployments
--
-- What this does:
--   Creates a table to record every deployment that the CI/CD pipeline makes.
--   Each row represents one push → deploy cycle.
--
-- This file lives in supabase/migrations/ and is applied automatically by the
-- GitHub Actions workflow whenever it runs (via `supabase db push`).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.deployments (
  id             uuid        primary key default gen_random_uuid(),
  commit_sha     text        not null,
  commit_message text,
  branch         text        default 'main',
  status         text        default 'success',
  deployed_at    timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- RLS must be enabled on all public tables in Supabase.
-- Without it, anyone could write to this table via the anon key.
alter table public.deployments enable row level security;

-- Allow anyone with the public anon key to READ deployments.
-- This is what the frontend uses to show the deployment history.
create policy "Public read access"
  on public.deployments
  for select
  to anon
  using (true);

-- NOTE: There is no INSERT policy for anon.
-- Only the service_role key (used by GitHub Actions) can insert rows,
-- because the service_role key bypasses RLS entirely. This means the
-- deployment log can only be written by the pipeline — not by anyone visiting
-- the website.
