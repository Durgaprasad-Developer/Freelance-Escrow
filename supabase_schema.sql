-- ─────────────────────────────────────────────────────────────────────────────
-- Freelance Escrow — Supabase Database Migration
-- Paste and run this script in: Dashboard -> SQL Editor -> Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  client_id TEXT NOT NULL,
  escrow_amount NUMERIC NOT NULL DEFAULT 0,
  escrow_status TEXT NOT NULL DEFAULT 'Created',
  github_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0,
  completion NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Not Started',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  evidence TEXT NOT NULL,
  client_translation TEXT,
  reviewer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Payouts Table
CREATE TABLE IF NOT EXISTS public.payouts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  release_percentage NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  tx_hash TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_transfer_id TEXT,
  hold_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Grant access
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Access Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Insert Access Projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access Projects" ON public.projects FOR UPDATE USING (true);

CREATE POLICY "Public Read Access Milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Public Insert Access Milestones" ON public.milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access Milestones" ON public.milestones FOR UPDATE USING (true);

CREATE POLICY "Public Read Access Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Access Reviews" ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Access Payouts" ON public.payouts FOR SELECT USING (true);
CREATE POLICY "Public Insert Access Payouts" ON public.payouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Access Payouts" ON public.payouts FOR UPDATE USING (true);
