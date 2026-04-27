-- Flux — Initial Schema Migration
-- Sprint 0 | SEED agent

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- TABLES
-- ============================================================

-- user_profiles
-- One row per authenticated user. Stores cycle baseline data.
CREATE TABLE user_profiles (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT        NOT NULL,
  cycle_length_avg INTEGER    NOT NULL DEFAULT 28 CHECK (cycle_length_avg BETWEEN 15 AND 60),
  last_period_date DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- cycle_logs
-- One row per period. Raw log — never inferred health data.
CREATE TABLE cycle_logs (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start_date   DATE        NOT NULL,
  period_end_date     DATE,
  flow_intensity      TEXT        NOT NULL CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (period_end_date IS NULL OR period_end_date >= period_start_date)
);

-- daily_logs
-- One row per user per day. 3-tap log: energy, mood, symptoms.
CREATE TABLE daily_logs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date      DATE        NOT NULL,
  energy_level  TEXT        NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
  mood          TEXT        NOT NULL,
  symptoms      TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- partner_connections
-- One row per partner invite. Women control this fully.
-- Never stores raw cycle data — access_level enforced at app layer.
CREATE TABLE partner_connections (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_email  TEXT        NOT NULL,
  access_level   TEXT        NOT NULL DEFAULT 'phase_card_only'
                             CHECK (access_level IN ('phase_card_only')),
  is_active      BOOLEAN     NOT NULL DEFAULT FALSE,
  invited_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, partner_email)
);

-- anomaly_flags
-- System-detected cycle irregularities. Dismissed by user. Never diagnoses.
CREATE TABLE anomaly_flags (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type    TEXT        NOT NULL CHECK (flag_type IN ('short_cycle', 'long_cycle', 'high_variance')),
  detected_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_cycle_logs_user_id          ON cycle_logs(user_id);
CREATE INDEX idx_cycle_logs_period_start     ON cycle_logs(user_id, period_start_date DESC);
CREATE INDEX idx_daily_logs_user_date        ON daily_logs(user_id, log_date DESC);
CREATE INDEX idx_partner_connections_user    ON partner_connections(user_id);
CREATE INDEX idx_partner_connections_email   ON partner_connections(partner_email);
CREATE INDEX idx_anomaly_flags_user          ON anomaly_flags(user_id);
CREATE INDEX idx_anomaly_flags_undismissed   ON anomaly_flags(user_id) WHERE dismissed_at IS NULL;


-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- ROW LEVEL SECURITY — enable on all tables
-- ============================================================

ALTER TABLE user_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_flags       ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- RLS POLICIES — user_profiles
-- ============================================================

CREATE POLICY "user_profiles: select own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles: insert own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles: update own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles: delete own"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- RLS POLICIES — cycle_logs
-- ============================================================

CREATE POLICY "cycle_logs: select own"
  ON cycle_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cycle_logs: insert own"
  ON cycle_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycle_logs: update own"
  ON cycle_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cycle_logs: delete own"
  ON cycle_logs FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- RLS POLICIES — daily_logs
-- ============================================================

CREATE POLICY "daily_logs: select own"
  ON daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_logs: insert own"
  ON daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_logs: update own"
  ON daily_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_logs: delete own"
  ON daily_logs FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- RLS POLICIES — partner_connections
-- ============================================================

CREATE POLICY "partner_connections: select own"
  ON partner_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "partner_connections: insert own"
  ON partner_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "partner_connections: update own"
  ON partner_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "partner_connections: delete own"
  ON partner_connections FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- RLS POLICIES — anomaly_flags
-- ============================================================

CREATE POLICY "anomaly_flags: select own"
  ON anomaly_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "anomaly_flags: insert own"
  ON anomaly_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anomaly_flags: update own"
  ON anomaly_flags FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anomaly_flags: delete own"
  ON anomaly_flags FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- PARTNER PHASE ACCESS — secure RPC function
-- Returns computed phase data only (never raw cycle_logs rows).
-- Callable only when an active partner_connection exists for
-- the requesting user's email.
-- ============================================================

CREATE OR REPLACE FUNCTION get_partner_phase_card(owner_user_id UUID)
RETURNS TABLE (
  display_name       TEXT,
  last_period_date   DATE,
  cycle_length_avg   INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_email TEXT;
BEGIN
  -- Resolve the calling user's email from auth.users
  SELECT email INTO requester_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Only return data if an active partner connection exists
  IF NOT EXISTS (
    SELECT 1 FROM partner_connections
    WHERE user_id      = owner_user_id
      AND partner_email = requester_email
      AND is_active     = TRUE
  ) THEN
    RAISE EXCEPTION 'Access denied: no active partner connection';
  END IF;

  RETURN QUERY
  SELECT
    up.display_name,
    up.last_period_date,
    up.cycle_length_avg
  FROM user_profiles up
  WHERE up.user_id = owner_user_id;
END;
$$;

-- Revoke direct execute from public; grant only to authenticated users
REVOKE EXECUTE ON FUNCTION get_partner_phase_card(UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION get_partner_phase_card(UUID) TO authenticated;
