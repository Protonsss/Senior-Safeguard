-- Senior Safeguard Test Seed Data
-- This creates sample data for development and testing

-- WARNING: This should only be run in development environments

-- Insert test users (you'll need to create these in Supabase Auth first)
-- These UUIDs are examples - replace with actual auth.users IDs

-- Example Senior User: John Smith
-- UUID: 11111111-1111-1111-1111-111111111111

INSERT INTO public.profiles (id, role, full_name, phone_number, preferred_language, timezone)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'senior', 'John Smith', '+14155551234', 'en', 'America/Los_Angeles'),
  ('22222222-2222-2222-2222-222222222222', 'senior', '王美玲 (Wang Meiling)', '+14155555678', 'zh', 'America/Los_Angeles'),
  ('33333333-3333-3333-3333-333333333333', 'senior', 'राज कुमार (Raj Kumar)', '+14155559012', 'hi', 'America/New_York'),
  ('44444444-4444-4444-4444-444444444444', 'senior', 'முருகன் (Murugan)', '+14155553456', 'ta', 'America/Chicago'),
  ('55555555-5555-5555-5555-555555555555', 'caregiver', 'Sarah Johnson', '+14155557890', 'en', 'America/Los_Angeles'),
  ('66666666-6666-6666-6666-666666666666', 'caregiver', 'Maria Garcia', '+14155552345', 'en', 'America/Los_Angeles');

-- Insert senior profiles
INSERT INTO public.seniors (id, profile_id, date_of_birth, emergency_contact_name, emergency_contact_phone, scam_shield_enabled, voice_speed)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '1945-03-15', 'Sarah Johnson', '+14155557890', true, 'slow'),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '1950-08-20', 'Wang Chen', '+14155556789', false, 'slow'),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '1948-12-05', 'Priya Kumar', '+14155558901', true, 'normal'),
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '1952-06-30', 'Lakshmi', '+14155554567', false, 'slow');

-- Insert caregiver relationships
INSERT INTO public.caregiver_relationships (caregiver_id, senior_id, relationship_type, access_level, approved)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'a1111111-1111-1111-1111-111111111111', 'family', 'manage', true),
  ('55555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'professional', 'view', true),
  ('66666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'family', 'admin', true);

-- Insert trusted contacts
INSERT INTO public.trusted_contacts (senior_id, contact_name, phone_number, relationship, priority)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'Sarah Johnson (Daughter)', '+14155557890', 'Family', 1),
  ('a1111111-1111-1111-1111-111111111111', 'Robert Smith (Son)', '+14155556543', 'Family', 2),
  ('a1111111-1111-1111-1111-111111111111', 'Dr. Williams', '+14155558888', 'Doctor', 3),
  ('a2222222-2222-2222-2222-222222222222', 'Wang Chen', '+14155556789', 'Family', 1),
  ('a3333333-3333-3333-3333-333333333333', 'Priya Kumar', '+14155558901', 'Family', 1),
  ('a4444444-4444-4444-4444-444444444444', 'Lakshmi', '+14155554567', 'Family', 1);

-- Insert sample sessions
INSERT INTO public.sessions (id, senior_id, session_type, language, language_detected_method, phone_number, started_at, ended_at, duration_seconds)
VALUES 
  ('s1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'ivr', 'en', 'saved', '+14155551234', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '5 minutes', 300),
  ('s2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'web', 'en', 'saved', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '10 minutes', 600),
  ('s3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'ivr', 'zh', 'auto', '+14155555678', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '7 minutes', 420),
  ('s4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'ivr', 'hi', 'menu', '+14155559012', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '4 minutes', 240);

-- Insert sample conversations
INSERT INTO public.conversations (session_id, senior_id, message_type, content, language, detected_intent)
VALUES 
  ('s1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'assistant', 'Hello! I am here to help you. What do you need today, sir?', 'en', NULL),
  ('s1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'user', 'I need help joining a Zoom meeting', 'en', 'zoom_join'),
  ('s1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'assistant', 'Don''t worry, I will do it step by step with you. Do you have the Zoom meeting link or ID?', 'en', NULL),
  ('s3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'assistant', '您好！我在这里帮助您，今天您需要什么？', 'zh', NULL),
  ('s3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'user', '我想知道现在几点了', 'zh', 'general_qa'),
  ('s4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'assistant', 'नमस्ते! मैं आपकी मदद के लिए हूं, आज आपको क्या चाहिए?', 'hi', NULL);

-- Insert sample tasks
INSERT INTO public.tasks (id, session_id, senior_id, task_type, task_status, language, steps_completed, total_steps, started_at, completed_at, duration_seconds)
VALUES 
  ('t1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'zoom_join', 'completed', 'en', 5, 5, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours' + INTERVAL '4 minutes', 240),
  ('t2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'volume_adjust', 'completed', 'en', 3, 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes', 120),
  ('t3333333-3333-3333-3333-333333333333', 's4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'wifi_connect', 'failed', 'hi', 2, 4, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours' + INTERVAL '3 minutes', 180);

-- Insert task steps
INSERT INTO public.task_steps (task_id, step_number, step_name, step_status, assistant_response, completed_at)
VALUES 
  ('t1111111-1111-1111-1111-111111111111', 1, 'Get meeting info', 'completed', 'Please tell me your Zoom meeting ID or link', NOW() - INTERVAL '2 hours'),
  ('t1111111-1111-1111-1111-111111111111', 2, 'Open Zoom app', 'completed', 'Now I will help you open the Zoom app', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
  ('t1111111-1111-1111-1111-111111111111', 3, 'Enter meeting ID', 'completed', 'I heard the ID. Now entering it for you', NOW() - INTERVAL '2 hours' + INTERVAL '2 minutes'),
  ('t1111111-1111-1111-1111-111111111111', 4, 'Join meeting', 'completed', 'Joining the meeting now', NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),
  ('t1111111-1111-1111-1111-111111111111', 5, 'Confirm joined', 'completed', 'You are now in the meeting! Do you see other people?', NOW() - INTERVAL '2 hours' + INTERVAL '4 minutes');

-- Insert scam logs
INSERT INTO public.scam_logs (senior_id, phone_number, caller_name, scam_risk_level, scam_type, blocked, source, details)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', '+18005551111', 'IRS Scam', 'critical', 'fraud', true, 'sync_me', '{"reason": "Known IRS impersonation scam", "reports": 1547}'::jsonb),
  ('a1111111-1111-1111-1111-111111111111', '+18005552222', 'Unknown', 'high', 'spam', true, 'sync_me', '{"reason": "High spam score", "reports": 823}'::jsonb),
  ('a3333333-3333-3333-3333-333333333333', '+18005553333', 'Tech Support Scam', 'critical', 'phishing', true, 'sync_me', '{"reason": "Tech support scam pattern", "reports": 2103}'::jsonb);

-- Insert language preferences
INSERT INTO public.language_preferences (senior_id, language, detection_method, confidence_score)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'en', 'auto', 0.98),
  ('a2222222-2222-2222-2222-222222222222', 'zh', 'auto', 0.95),
  ('a3333333-3333-3333-3333-333333333333', 'hi', 'menu', 1.00),
  ('a4444444-4444-4444-4444-444444444444', 'ta', 'auto', 0.92);

-- Insert SMS messages
INSERT INTO public.sms_messages (senior_id, direction, from_number, to_number, message_body, language, status)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'inbound', '+14155551234', '+14155550000', 'HELP', 'en', 'received'),
  ('a1111111-1111-1111-1111-111111111111', 'outbound', '+14155550000', '+14155551234', 'I am here to help! Text MENU to see options, or ask me anything.', 'en', 'sent'),
  ('a2222222-2222-2222-2222-222222222222', 'inbound', '+14155555678', '+14155550000', '帮助', 'zh', 'received');

-- Insert activity metrics
INSERT INTO public.activity_metrics (senior_id, metric_date, total_calls, total_sms, total_web_sessions, tasks_completed, scam_calls_blocked)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE, 2, 2, 1, 2, 2),
  ('a1111111-1111-1111-1111-111111111111', CURRENT_DATE - 1, 1, 0, 0, 1, 0),
  ('a2222222-2222-2222-2222-222222222222', CURRENT_DATE, 1, 1, 0, 0, 0),
  ('a3333333-3333-3333-3333-333333333333', CURRENT_DATE, 1, 0, 0, 0, 1);

