-- ============================================================================
-- MIGRATION 016: CREATE SYSTEM SETTINGS TABLE
-- ============================================================================
-- This migration creates a system_settings table to store application-wide
-- configuration settings that can be managed by administrators.
-- ============================================================================

-- Create the system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general', -- 'general', 'service', 'security', 'email'
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create index for faster lookups
CREATE INDEX idx_settings_key ON system_settings(key);
CREATE INDEX idx_settings_category ON system_settings(category);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view and modify settings
CREATE POLICY "Admins can view settings"
  ON system_settings FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update settings"
  ON system_settings FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert settings"
  ON system_settings FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete settings"
  ON system_settings FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO system_settings (key, value, category, description) VALUES
('general', '{
  "systemName": "Waste Collection Management System",
  "organizationName": "Panabo City CENRO",
  "contactEmail": "cenro@panabocity.gov.ph",
  "contactPhone": "(084) 822-1234",
  "address": "City Hall, Panabo City, Davao del Norte",
  "timezone": "Asia/Manila"
}'::jsonb, 'general', 'General system settings'),

('service', '{
  "workingHoursStart": "07:00",
  "workingHoursEnd": "17:00",
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  "maxRequestsPerDay": "50",
  "advanceBookingDays": "1",
  "maxPhotosPerRequest": "5"
}'::jsonb, 'service', 'Service configuration settings'),

('security', '{
  "sessionTimeout": "30",
  "maxLoginAttempts": "5",
  "lockoutDuration": "15",
  "requireTwoFactor": false,
  "passwordMinLength": "8",
  "passwordRequireSpecial": true,
  "passwordRequireNumbers": true,
  "passwordRequireUppercase": true
}'::jsonb, 'security', 'Security and access control settings'),

('email', '{
  "smtpHost": "",
  "smtpPort": "587",
  "smtpUser": "",
  "smtpPassword": "",
  "fromEmail": "noreply@panabocity.gov.ph",
  "fromName": "Waste Collection System",
  "enableNotifications": true
}'::jsonb, 'email', 'Email and notification settings'),

('maintenance', '{
  "enabled": false,
  "message": "System is under maintenance. Please try again later.",
  "allowedRoles": ["admin"],
  "scheduledStart": null,
  "scheduledEnd": null
}'::jsonb, 'maintenance', 'System maintenance mode settings')

ON CONFLICT (key) DO NOTHING;

-- Verify settings were created
SELECT key, category, description FROM system_settings ORDER BY category, key;
