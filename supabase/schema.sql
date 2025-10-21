-- Senior Safeguard Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('senior', 'caregiver', 'admin')),
  full_name TEXT,
  phone_number TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'zh', 'hi', 'ta')),
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Senior profiles with additional metadata
CREATE TABLE public.seniors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_notes TEXT,
  scam_shield_enabled BOOLEAN DEFAULT false,
  scam_shield_activated_at TIMESTAMPTZ,
  voice_speed TEXT DEFAULT 'slow' CHECK (voice_speed IN ('slow', 'normal', 'fast')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregiver-Senior relationships
CREATE TABLE public.caregiver_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caregiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('family', 'professional', 'friend', 'other')),
  access_level TEXT DEFAULT 'view' CHECK (access_level IN ('view', 'manage', 'admin')),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(caregiver_id, senior_id)
);

-- Session tracking for calls and web sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('ivr', 'web', 'sms')),
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'hi', 'ta')),
  language_detected_method TEXT CHECK (language_detected_method IN ('auto', 'menu', 'saved')),
  phone_number TEXT,
  call_sid TEXT,
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Conversation messages and interactions
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  detected_intent TEXT,
  task_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guided tasks execution log
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('zoom_join', 'phone_call', 'volume_adjust', 'wifi_connect', 'scam_check', 'sync_me_install', 'contact_family', 'general_qa')),
  task_status TEXT DEFAULT 'started' CHECK (task_status IN ('started', 'in_progress', 'completed', 'failed', 'abandoned')),
  language TEXT NOT NULL,
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER,
  task_data JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

-- Task step tracking for guided flows
CREATE TABLE public.task_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_status TEXT DEFAULT 'pending' CHECK (step_status IN ('pending', 'active', 'completed', 'skipped', 'failed')),
  user_input TEXT,
  assistant_response TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Scam detection and logging
CREATE TABLE public.scam_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  caller_name TEXT,
  scam_risk_level TEXT CHECK (scam_risk_level IN ('low', 'medium', 'high', 'critical')),
  scam_type TEXT CHECK (scam_type IN ('spam', 'robocall', 'phishing', 'fraud', 'unknown')),
  blocked BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'sync_me' CHECK (source IN ('sync_me', 'twilio', 'manual')),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Language preferences history
CREATE TABLE public.language_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'hi', 'ta')),
  detection_method TEXT CHECK (detection_method IN ('auto', 'menu', 'manual')),
  confidence_score DECIMAL(3,2),
  set_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS messages log
CREATE TABLE public.sms_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  message_body TEXT NOT NULL,
  language TEXT,
  message_sid TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trusted contacts for seniors
CREATE TABLE public.trusted_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT,
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity metrics for caregiver dashboard
CREATE TABLE public.activity_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  senior_id UUID REFERENCES public.seniors(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  total_sms INTEGER DEFAULT 0,
  total_web_sessions INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  scam_calls_blocked INTEGER DEFAULT 0,
  avg_session_duration_seconds INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(senior_id, metric_date)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX idx_seniors_profile_id ON public.seniors(profile_id);
CREATE INDEX idx_sessions_senior_id ON public.sessions(senior_id);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at);
CREATE INDEX idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX idx_conversations_senior_id ON public.conversations(senior_id);
CREATE INDEX idx_tasks_senior_id ON public.tasks(senior_id);
CREATE INDEX idx_tasks_session_id ON public.tasks(session_id);
CREATE INDEX idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX idx_scam_logs_senior_id ON public.scam_logs(senior_id);
CREATE INDEX idx_scam_logs_created_at ON public.scam_logs(created_at);
CREATE INDEX idx_sms_messages_senior_id ON public.sms_messages(senior_id);
CREATE INDEX idx_activity_metrics_senior_date ON public.activity_metrics(senior_id, metric_date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Seniors: Can view/update own data
CREATE POLICY "Seniors can view own data" ON public.seniors
  FOR SELECT USING (
    profile_id = auth.uid()
  );

CREATE POLICY "Seniors can update own data" ON public.seniors
  FOR UPDATE USING (profile_id = auth.uid());

-- Caregivers can view seniors they're connected to
CREATE POLICY "Caregivers can view their seniors" ON public.seniors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.caregiver_relationships cr
      JOIN public.profiles p ON p.id = cr.caregiver_id
      WHERE cr.senior_id = seniors.id
        AND cr.caregiver_id = auth.uid()
        AND cr.approved = true
    )
  );

-- Sessions: Seniors and their caregivers can view
CREATE POLICY "View sessions policy" ON public.sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.seniors s
      WHERE s.id = sessions.senior_id
        AND (s.profile_id = auth.uid() OR
             EXISTS (
               SELECT 1 FROM public.caregiver_relationships cr
               WHERE cr.senior_id = s.id
                 AND cr.caregiver_id = auth.uid()
                 AND cr.approved = true
             ))
    )
  );

-- Conversations: Same as sessions
CREATE POLICY "View conversations policy" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.seniors s
      WHERE s.id = conversations.senior_id
        AND (s.profile_id = auth.uid() OR
             EXISTS (
               SELECT 1 FROM public.caregiver_relationships cr
               WHERE cr.senior_id = s.id
                 AND cr.caregiver_id = auth.uid()
                 AND cr.approved = true
             ))
    )
  );

-- Tasks: Same access pattern
CREATE POLICY "View tasks policy" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.seniors s
      WHERE s.id = tasks.senior_id
        AND (s.profile_id = auth.uid() OR
             EXISTS (
               SELECT 1 FROM public.caregiver_relationships cr
               WHERE cr.senior_id = s.id
                 AND cr.caregiver_id = auth.uid()
                 AND cr.approved = true
             ))
    )
  );

-- Scam logs: Viewable by senior and caregivers
CREATE POLICY "View scam logs policy" ON public.scam_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.seniors s
      WHERE s.id = scam_logs.senior_id
        AND (s.profile_id = auth.uid() OR
             EXISTS (
               SELECT 1 FROM public.caregiver_relationships cr
               WHERE cr.senior_id = s.id
                 AND cr.caregiver_id = auth.uid()
                 AND cr.approved = true
             ))
    )
  );

-- Activity metrics: Same pattern
CREATE POLICY "View activity metrics policy" ON public.activity_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.seniors s
      WHERE s.id = activity_metrics.senior_id
        AND (s.profile_id = auth.uid() OR
             EXISTS (
               SELECT 1 FROM public.caregiver_relationships cr
               WHERE cr.senior_id = s.id
                 AND cr.caregiver_id = auth.uid()
                 AND cr.approved = true
             ))
    )
  );

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seniors_updated_at BEFORE UPDATE ON public.seniors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caregiver_relationships_updated_at BEFORE UPDATE ON public.caregiver_relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trusted_contacts_updated_at BEFORE UPDATE ON public.trusted_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity metrics on session end
CREATE OR REPLACE FUNCTION update_activity_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    INSERT INTO public.activity_metrics (
      senior_id,
      metric_date,
      total_calls,
      total_sms,
      total_web_sessions
    )
    VALUES (
      NEW.senior_id,
      DATE(NEW.ended_at),
      CASE WHEN NEW.session_type = 'ivr' THEN 1 ELSE 0 END,
      CASE WHEN NEW.session_type = 'sms' THEN 1 ELSE 0 END,
      CASE WHEN NEW.session_type = 'web' THEN 1 ELSE 0 END
    )
    ON CONFLICT (senior_id, metric_date)
    DO UPDATE SET
      total_calls = activity_metrics.total_calls + CASE WHEN NEW.session_type = 'ivr' THEN 1 ELSE 0 END,
      total_sms = activity_metrics.total_sms + CASE WHEN NEW.session_type = 'sms' THEN 1 ELSE 0 END,
      total_web_sessions = activity_metrics.total_web_sessions + CASE WHEN NEW.session_type = 'web' THEN 1 ELSE 0 END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER session_activity_metrics AFTER UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_activity_metrics();

