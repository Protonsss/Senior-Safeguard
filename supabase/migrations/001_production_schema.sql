-- SENIOR SAFEGUARD - PRODUCTION DATABASE SCHEMA
-- Designed for HIPAA compliance, scalability, and real-time monitoring

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SENIORS TABLE - Core user profiles
-- ============================================================================
CREATE TABLE IF NOT EXISTS seniors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Personal Information (PHI - Protected Health Information)
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  phone_number TEXT,
  email TEXT,

  -- Settings
  language TEXT DEFAULT 'en',
  voice_preference TEXT DEFAULT 'female',
  font_size_multiplier DECIMAL(3,2) DEFAULT 1.0,

  -- Status
  scam_shield_active BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_active TIMESTAMPTZ,

  -- Device Information
  primary_device_id TEXT,
  device_type TEXT, -- 'phone', 'tablet', 'computer'

  -- Medical Context (for personalization)
  vision_impairment BOOLEAN DEFAULT false,
  hearing_impairment BOOLEAN DEFAULT false,
  motor_impairment BOOLEAN DEFAULT false,
  cognitive_notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,

  CONSTRAINT valid_language CHECK (language IN ('en', 'es', 'zh', 'hi', 'vi', 'tl')),
  CONSTRAINT valid_font_size CHECK (font_size_multiplier >= 0.5 AND font_size_multiplier <= 3.0)
);

-- Indexes for performance
CREATE INDEX idx_seniors_active ON seniors(is_active, last_active DESC);
CREATE INDEX idx_seniors_phone ON seniors(phone_number);

-- ============================================================================
-- SCAM_ATTEMPTS TABLE - Threat detection logs
-- ============================================================================
CREATE TABLE scam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,

  -- Detection Details
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  scam_type TEXT NOT NULL, -- 'phishing', 'tech_support', 'gift_card', 'romance', 'lottery', 'irs'
  threat_level INTEGER NOT NULL, -- 0-100 score

  -- URL Analysis
  url TEXT,
  domain TEXT,
  is_known_threat BOOLEAN DEFAULT false,
  threat_source TEXT, -- 'phishtank', 'google_safe_browsing', 'manual', 'ai'

  -- Visual Analysis (Gemini Vision)
  screenshot_url TEXT,
  visual_indicators JSONB, -- {urgency: true, fake_logo: true, grammar_errors: 3}

  -- Behavioral Analysis
  user_hesitation_seconds INTEGER,
  mouse_pattern TEXT, -- 'erratic', 'hesitant', 'confident'

  -- AI Analysis
  ai_analysis TEXT,
  ai_confidence DECIMAL(4,3), -- 0.000-1.000

  -- Action Taken
  was_blocked BOOLEAN DEFAULT true,
  block_method TEXT, -- 'url_filter', 'ai_intervention', 'caregiver_manual'
  senior_acknowledged BOOLEAN DEFAULT false,

  -- Financial Impact
  estimated_loss_prevented DECIMAL(10,2),

  -- Metadata
  session_id UUID,
  user_agent TEXT,
  ip_address INET
);

-- Indexes for analytics and reporting
CREATE INDEX idx_scam_attempts_senior ON scam_attempts(senior_id, detected_at DESC);
CREATE INDEX idx_scam_attempts_blocked ON scam_attempts(was_blocked, detected_at DESC);
CREATE INDEX idx_scam_attempts_threat_level ON scam_attempts(threat_level DESC, detected_at DESC);
CREATE INDEX idx_scam_attempts_type ON scam_attempts(scam_type, detected_at DESC);

-- ============================================================================
-- ALERTS TABLE - Real-time caregiver notifications
-- ============================================================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,

  -- Alert Classification
  alert_type TEXT NOT NULL, -- 'scam_detected', 'senior_stuck', 'frustration_detected', 'unusual_activity'
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  priority_score INTEGER NOT NULL, -- 0-100 (calculated by algorithm)

  -- Alert Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB, -- Additional data: {url, screenshot, activity}

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- Assignment
  assigned_to UUID, -- caregiver user ID
  acknowledged_by UUID,
  resolved_by UUID,

  -- Resolution
  resolution_notes TEXT,
  resolution_time_seconds INTEGER, -- For performance metrics

  -- Related Records
  scam_attempt_id UUID REFERENCES scam_attempts(id),
  session_id UUID,

  CONSTRAINT valid_severity CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed'))
);

-- Indexes for real-time dashboard
CREATE INDEX idx_alerts_pending ON alerts(status, priority_score DESC, created_at DESC) WHERE status = 'pending';
CREATE INDEX idx_alerts_senior ON alerts(senior_id, created_at DESC);
CREATE INDEX idx_alerts_assigned ON alerts(assigned_to, status, created_at DESC);

-- ============================================================================
-- SESSIONS TABLE - User activity tracking
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,

  -- Session Info
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Activity Tracking
  screens_visited INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  help_requests INTEGER DEFAULT 0,
  errors_encountered INTEGER DEFAULT 0,

  -- AI Assistance
  ai_interventions INTEGER DEFAULT 0,
  voice_commands INTEGER DEFAULT 0,

  -- Screen Recording (for training/review)
  recording_url TEXT,
  has_recording BOOLEAN DEFAULT false,

  -- Device Context
  device_type TEXT,
  device_id TEXT,
  ip_address INET,
  user_agent TEXT,

  -- Quality Metrics
  user_satisfaction_score INTEGER, -- 1-5 post-session rating
  completion_rate DECIMAL(4,3) -- Percentage of intended tasks completed
);

CREATE INDEX idx_sessions_senior ON sessions(senior_id, started_at DESC);
CREATE INDEX idx_sessions_active ON sessions(ended_at) WHERE ended_at IS NULL;

-- ============================================================================
-- SCREEN_ACTIVITY TABLE - Detailed interaction logs
-- ============================================================================
CREATE TABLE screen_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  senior_id UUID NOT NULL REFERENCES seniors(id) ON DELETE CASCADE,

  -- Timestamp
  occurred_at TIMESTAMPTZ DEFAULT NOW(),

  -- Activity Type
  activity_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'error', 'help_request'

  -- Context
  url TEXT,
  page_title TEXT,
  element_clicked TEXT,

  -- Computer Vision Data
  screenshot_url TEXT,
  cv_analysis JSONB, -- {ui_elements: [], detected_text: [], scam_indicators: []}

  -- Behavioral Data
  time_on_screen_seconds INTEGER,
  mouse_movements INTEGER,
  hesitation_detected BOOLEAN DEFAULT false,

  -- AI Response
  ai_assistance_provided BOOLEAN DEFAULT false,
  ai_suggestion TEXT
);

CREATE INDEX idx_screen_activity_session ON screen_activity(session_id, occurred_at DESC);
CREATE INDEX idx_screen_activity_type ON screen_activity(activity_type, occurred_at DESC);

-- ============================================================================
-- CAREGIVERS TABLE - Staff user management
-- ============================================================================
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,

  -- Role
  role TEXT DEFAULT 'caregiver', -- 'caregiver', 'supervisor', 'admin'
  facility_id UUID,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_on_duty BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,

  -- Performance Metrics
  seniors_assigned INTEGER DEFAULT 0,
  alerts_resolved INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,

  -- Preferences
  notification_preferences JSONB DEFAULT '{"push": true, "email": false, "sms": true}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_caregivers_active ON caregivers(is_active, is_on_duty);
CREATE INDEX idx_caregivers_facility ON caregivers(facility_id);

-- ============================================================================
-- ANALYTICS_DAILY TABLE - Pre-aggregated metrics for dashboards
-- ============================================================================
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  facility_id UUID,

  -- Scam Prevention Metrics
  scams_detected INTEGER DEFAULT 0,
  scams_blocked INTEGER DEFAULT 0,
  scam_block_rate DECIMAL(4,3),
  estimated_loss_prevented DECIMAL(10,2),

  -- Engagement Metrics
  active_seniors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration_minutes INTEGER,

  -- AI Performance
  ai_interventions INTEGER DEFAULT 0,
  ai_accuracy DECIMAL(4,3),
  voice_commands INTEGER DEFAULT 0,

  -- Caregiver Performance
  alerts_generated INTEGER DEFAULT 0,
  alerts_resolved INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,

  -- Quality Metrics
  avg_user_satisfaction DECIMAL(3,2),
  completion_rate DECIMAL(4,3),

  UNIQUE(date, facility_id)
);

CREATE INDEX idx_analytics_daily_date ON analytics_daily(date DESC);

-- ============================================================================
-- AUDIT_LOG TABLE - HIPAA compliance requirement
-- ============================================================================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Actor
  actor_id UUID, -- caregiver or system ID
  actor_type TEXT NOT NULL, -- 'caregiver', 'system', 'admin'

  -- Action
  action TEXT NOT NULL, -- 'view_senior_screen', 'take_control', 'block_url', 'export_data'
  resource_type TEXT, -- 'senior', 'session', 'alert'
  resource_id UUID,

  -- Details
  details JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Immutable audit log - no updates or deletes allowed
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id, timestamp DESC);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id, timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Caregivers can view seniors in their facility
CREATE POLICY caregivers_view_seniors ON seniors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregivers
      WHERE caregivers.id = auth.uid()
      AND caregivers.is_active = true
    )
  );

-- Policy: Only authorized caregivers can view alerts
CREATE POLICY caregivers_view_alerts ON alerts
  FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM caregivers
      WHERE caregivers.id = auth.uid()
      AND caregivers.role IN ('supervisor', 'admin')
    )
  );

-- Policy: Audit log is append-only, read-only for admins
CREATE POLICY audit_log_append_only ON audit_log
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY audit_log_admin_view ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM caregivers
      WHERE caregivers.id = auth.uid()
      AND caregivers.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on seniors table
CREATE TRIGGER update_seniors_updated_at
  BEFORE UPDATE ON seniors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregivers_updated_at
  BEFORE UPDATE ON caregivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate alert priority score
CREATE OR REPLACE FUNCTION calculate_alert_priority(
  p_alert_type TEXT,
  p_severity TEXT,
  p_senior_id UUID,
  p_scam_threat_level INTEGER DEFAULT 0
) RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER;
  senior_frailty_multiplier DECIMAL;
  time_multiplier DECIMAL;
  final_score INTEGER;
BEGIN
  -- Base score by severity
  base_score := CASE p_severity
    WHEN 'critical' THEN 90
    WHEN 'high' THEN 60
    WHEN 'medium' THEN 40
    WHEN 'low' THEN 20
    ELSE 10
  END;

  -- Add threat level for scams
  IF p_alert_type = 'scam_detected' THEN
    base_score := base_score + (p_scam_threat_level * 0.1);
  END IF;

  -- Frailty multiplier (based on impairments)
  SELECT
    1.0 + (
      CASE WHEN vision_impairment THEN 0.2 ELSE 0 END +
      CASE WHEN hearing_impairment THEN 0.1 ELSE 0 END +
      CASE WHEN motor_impairment THEN 0.15 ELSE 0 END +
      CASE WHEN cognitive_notes IS NOT NULL THEN 0.25 ELSE 0 END
    )
  INTO senior_frailty_multiplier
  FROM seniors
  WHERE id = p_senior_id;

  -- Time multiplier (night = higher priority)
  time_multiplier := CASE
    WHEN EXTRACT(HOUR FROM NOW()) BETWEEN 22 AND 6 THEN 1.2
    ELSE 1.0
  END;

  -- Calculate final score
  final_score := LEAST(100, (base_score * senior_frailty_multiplier * time_multiplier)::INTEGER);

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate ROI metrics
CREATE OR REPLACE FUNCTION calculate_daily_roi(p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  scams_blocked BIGINT,
  total_prevented DECIMAL,
  avg_loss_per_scam DECIMAL,
  roi_multiplier DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    SUM(estimated_loss_prevented),
    AVG(estimated_loss_prevented),
    (SUM(estimated_loss_prevented) / 50000.00) -- Assuming $50k annual system cost
  FROM scam_attempts
  WHERE
    DATE(detected_at) = p_date
    AND was_blocked = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert system caregiver (for automated actions)
INSERT INTO caregivers (id, full_name, email, role, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'System AI',
  'system@seniorsafeguard.ai',
  'admin',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS (Supabase-specific)
-- ============================================================================

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON seniors TO authenticated;
GRANT SELECT, INSERT ON scam_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON alerts TO authenticated;
GRANT SELECT, INSERT ON sessions TO authenticated;
GRANT SELECT, INSERT ON screen_activity TO authenticated;
GRANT SELECT ON caregivers TO authenticated;
GRANT INSERT ON audit_log TO authenticated;
GRANT SELECT ON analytics_daily TO authenticated;

-- Public read access for threat intelligence sharing (anonymized)
GRANT SELECT (scam_type, threat_level, detected_at, domain, visual_indicators) ON scam_attempts TO anon;

COMMENT ON TABLE seniors IS 'Core senior user profiles with PHI protection';
COMMENT ON TABLE scam_attempts IS 'Comprehensive threat detection and prevention logs';
COMMENT ON TABLE alerts IS 'Real-time caregiver notification system with intelligent prioritization';
COMMENT ON TABLE audit_log IS 'HIPAA-compliant immutable audit trail';
COMMENT ON FUNCTION calculate_alert_priority IS 'Intelligent alert scoring algorithm considering multiple factors';
COMMENT ON FUNCTION calculate_daily_roi IS 'ROI calculator showing fraud prevention value';
