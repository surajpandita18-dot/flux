-- Flux — Push Subscriptions Migration
-- Sprint 3 | SEED agent
-- Run in Supabase SQL editor after 001_initial_schema.sql

-- ============================================================
-- TABLE
-- ============================================================

CREATE TABLE push_subscriptions (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT        NOT NULL UNIQUE,
  p256dh     TEXT        NOT NULL,
  auth       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can insert/read/delete their own subscriptions
CREATE POLICY "push_subscriptions: user owns row" ON push_subscriptions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (used by /api/push/send cron) can read all subscriptions
-- This is granted automatically to the service_role key — no extra policy needed.
