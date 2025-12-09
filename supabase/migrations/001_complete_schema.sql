-- ============================================================================
-- WASTE COLLECTION MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- Version: 1.0.0
-- Date: 2025-12-09
-- 
-- This schema includes all corrections from the codebase audit:
-- 1. Extended request status values to match SYSTEM-OVERVIEW workflow
-- 2. Added full_name computed field to profiles
-- 3. Added collector_rejection_reason tracking
-- 4. Added updated_at to schedule_stops
-- 5. Added proper CHECK constraints for payment status
-- 6. Added performance indexes
-- 7. Included comprehensive RLS policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: CUSTOM TYPES (ENUMS)
-- ============================================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'client', 'collector');

-- User status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Request status enum (matches SYSTEM-OVERVIEW Section 4.3 workflow)
CREATE TYPE request_status AS ENUM (
  'pending',              -- Initial status when client submits request
  'accepted',             -- Staff approved, awaiting payment
  'rejected',             -- Staff rejected the request
  'payment_confirmed',    -- Payment verified, ready for assignment
  'assigned',             -- Collector assigned by staff
  'accepted_by_collector', -- Collector accepted the assignment
  'declined_by_collector', -- Collector declined (triggers reassignment)
  'en_route',             -- Collector is on the way
  'at_location',          -- Collector arrived at location
  'in_progress',          -- Collection in progress
  'completed',            -- Collection finished
  'cancelled'             -- Cancelled by client or staff
);

-- Priority level enum
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'urgent');

-- Schedule type enum
CREATE TYPE schedule_type AS ENUM ('one-time', 'weekly', 'bi-weekly', 'monthly');

-- Schedule status enum
CREATE TYPE schedule_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'completed');

-- Feedback status enum
CREATE TYPE feedback_status AS ENUM ('new', 'reviewed', 'responded', 'flagged');

-- Announcement type enum
CREATE TYPE announcement_type AS ENUM ('info', 'success', 'warning', 'error', 'maintenance', 'event');

-- Announcement priority enum
CREATE TYPE announcement_priority AS ENUM ('normal', 'important', 'urgent');

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'request_status_update',
  'payment_verification',
  'collector_assignment',
  'collection_reminder',
  'collection_complete',
  'feedback_request',
  'schedule_change',
  'system_announcement'
);

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 PROFILES TABLE (extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  barangay TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'client',
  status user_status NOT NULL DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_barangay ON profiles(barangay);

-- ----------------------------------------------------------------------------
-- 2.2 COLLECTION REQUESTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE collection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL DEFAULT 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  alt_contact_number TEXT,
  barangay TEXT NOT NULL,
  address TEXT NOT NULL,
  priority priority_level NOT NULL DEFAULT 'low',
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  special_instructions TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  
  -- Assignment fields
  assigned_collector_id UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES profiles(id),
  
  -- Scheduling fields
  scheduled_date DATE,
  scheduled_time TEXT,
  
  -- Completion fields
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_notes TEXT,
  
  -- Rejection/Cancellation fields
  rejection_reason TEXT,
  rejected_by UUID REFERENCES profiles(id),
  rejected_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,
  
  -- Collector decline tracking
  collector_decline_reason TEXT,
  collector_declined_at TIMESTAMPTZ,
  reassignment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_requests_client ON collection_requests(client_id);
CREATE INDEX idx_requests_status ON collection_requests(status);
CREATE INDEX idx_requests_priority ON collection_requests(priority);
CREATE INDEX idx_requests_collector ON collection_requests(assigned_collector_id);
CREATE INDEX idx_requests_date ON collection_requests(preferred_date);
CREATE INDEX idx_requests_barangay ON collection_requests(barangay);
CREATE INDEX idx_requests_created ON collection_requests(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2.3 REQUEST PHOTOS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE request_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES collection_requests(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT DEFAULT 'before', -- 'before' or 'after' collection
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_photos_request ON request_photos(request_id);

-- ----------------------------------------------------------------------------
-- 2.4 REQUEST STATUS HISTORY TABLE (Timeline tracking per Section 4.3)
-- ----------------------------------------------------------------------------
CREATE TABLE request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES collection_requests(id) ON DELETE CASCADE,
  previous_status request_status,
  new_status request_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  notes TEXT,
  metadata JSONB, -- For storing additional context (collector info, location, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_request ON request_status_history(request_id);
CREATE INDEX idx_status_history_created ON request_status_history(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2.5 COLLECTION SCHEDULES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE collection_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schedule_type schedule_type NOT NULL DEFAULT 'one-time',
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- For recurring schedules
  working_days TEXT[], -- ['monday', 'wednesday', 'friday']
  week_of_month INTEGER[], -- [1, 3] for 1st and 3rd week
  
  -- Collector assignment
  assigned_collector_id UUID REFERENCES profiles(id),
  backup_collector_id UUID REFERENCES profiles(id),
  
  special_instructions TEXT,
  status schedule_status NOT NULL DEFAULT 'draft',
  
  -- Collector confirmation
  confirmed_by_collector BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_schedules_collector ON collection_schedules(assigned_collector_id);
CREATE INDEX idx_schedules_status ON collection_schedules(status);
CREATE INDEX idx_schedules_dates ON collection_schedules(start_date, end_date);

-- ----------------------------------------------------------------------------
-- 2.6 SCHEDULE STOPS TABLE (Locations in a schedule route)
-- ----------------------------------------------------------------------------
CREATE TABLE schedule_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES collection_schedules(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL, -- 'school', 'hospital', 'park', 'government', 'commercial', 'residential', 'market'
  address TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  stop_order INTEGER NOT NULL,
  estimated_duration INTEGER, -- in minutes
  contact_person TEXT,
  contact_number TEXT,
  special_notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stops_schedule ON schedule_stops(schedule_id);
CREATE INDEX idx_stops_order ON schedule_stops(schedule_id, stop_order);
CREATE INDEX idx_stops_barangay ON schedule_stops(barangay);

-- ----------------------------------------------------------------------------
-- 2.7 PAYMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT UNIQUE NOT NULL DEFAULT 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8),
  request_id UUID NOT NULL REFERENCES collection_requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  reference_number TEXT,
  payment_method TEXT, -- 'cash', 'bank_transfer', 'gcash', 'maya', etc.
  date_received DATE,
  receipt_url TEXT,
  status payment_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_request ON payments(request_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(date_received);

-- ----------------------------------------------------------------------------
-- 2.8 FEEDBACK TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES collection_requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id),
  collector_id UUID NOT NULL REFERENCES profiles(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status feedback_status NOT NULL DEFAULT 'new',
  
  -- Staff response
  staff_response TEXT,
  responded_by UUID REFERENCES profiles(id),
  responded_at TIMESTAMPTZ,
  
  -- Edit tracking (editable within 24 hours)
  is_editable BOOLEAN DEFAULT TRUE,
  last_edited_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one feedback per request
  UNIQUE(request_id)
);

CREATE INDEX idx_feedback_request ON feedback(request_id);
CREATE INDEX idx_feedback_client ON feedback(client_id);
CREATE INDEX idx_feedback_collector ON feedback(collector_id);
CREATE INDEX idx_feedback_rating ON feedback(overall_rating);
CREATE INDEX idx_feedback_status ON feedback(status);

-- ----------------------------------------------------------------------------
-- 2.9 ANNOUNCEMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  type announcement_type NOT NULL DEFAULT 'info',
  priority announcement_priority NOT NULL DEFAULT 'normal',
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['all'], -- ['all'], ['client'], ['staff'], ['collector']
  image_url TEXT,
  publish_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  enable_maintenance_mode BOOLEAN DEFAULT FALSE,
  send_email_notification BOOLEAN DEFAULT FALSE,
  send_push_notification BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  
  -- Tracking who has read it
  read_by JSONB DEFAULT '[]'::JSONB, -- Array of {user_id, read_at}
  
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(is_published);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_dates ON announcements(publish_date, expiry_date);
CREATE INDEX idx_announcements_priority ON announcements(priority);

-- ----------------------------------------------------------------------------
-- 2.10 NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional metadata (request_id, collector_id, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2.11 COLLECTOR ATTENDANCE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE collector_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_time TIMESTAMPTZ NOT NULL,
  logout_time TIMESTAMPTZ,
  total_duration INTERVAL GENERATED ALWAYS AS (
    CASE WHEN logout_time IS NOT NULL 
      THEN logout_time - login_time 
      ELSE NULL 
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One attendance record per collector per day (can have multiple login/logout)
  UNIQUE(collector_id, date, login_time)
);

CREATE INDEX idx_attendance_collector ON collector_attendance(collector_id);
CREATE INDEX idx_attendance_date ON collector_attendance(date);
CREATE INDEX idx_attendance_active ON collector_attendance(collector_id, date) WHERE logout_time IS NULL;

-- ----------------------------------------------------------------------------
-- 2.12 ACTIVITY LOGS TABLE (Audit trail per Section 5.2)
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type TEXT, -- 'request', 'user', 'schedule', 'payment', etc.
  entity_id UUID,
  previous_data JSONB,
  new_data JSONB,
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_logs_action ON activity_logs(action);
CREATE INDEX idx_logs_created ON activity_logs(created_at DESC);

-- Partition activity_logs by month for performance (optional)
-- CREATE TABLE activity_logs_2025_01 PARTITION OF activity_logs 
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ============================================================================
-- SECTION 3: FUNCTIONS AND TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON collection_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON collection_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stops_updated_at
  BEFORE UPDATE ON schedule_stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON collector_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 3.2 Create profile on user signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    barangay, 
    address, 
    role,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1), ''),
    COALESCE(
      CASE 
        WHEN POSITION(' ' IN COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0 
        THEN SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1)
        ELSE ''
      END, 
      ''
    ),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'barangay',
    NEW.raw_user_meta_data->>'address',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ----------------------------------------------------------------------------
-- 3.3 Track request status changes
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION track_request_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO request_status_history (
      request_id,
      previous_status,
      new_status,
      changed_by,
      notes,
      metadata
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.assigned_by, -- or could use current_user context
      CASE 
        WHEN NEW.status = 'rejected' THEN NEW.rejection_reason
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        WHEN NEW.status = 'declined_by_collector' THEN NEW.collector_decline_reason
        ELSE NULL
      END,
      jsonb_build_object(
        'collector_id', NEW.assigned_collector_id,
        'scheduled_date', NEW.scheduled_date,
        'scheduled_time', NEW.scheduled_time
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_request_status
  AFTER UPDATE ON collection_requests
  FOR EACH ROW EXECUTE FUNCTION track_request_status_change();

-- ----------------------------------------------------------------------------
-- 3.4 Calculate collector average rating
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_collector_average_rating(collector_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  SELECT COALESCE(AVG(overall_rating), 0)
  INTO avg_rating
  FROM feedback
  WHERE collector_id = collector_uuid;
  
  RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3.5 Get available collectors (on duty)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_available_collectors()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone TEXT,
  active_assignments BIGINT,
  completed_today BIGINT,
  average_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    COUNT(cr.id) FILTER (WHERE cr.status IN ('assigned', 'accepted_by_collector', 'en_route', 'at_location', 'in_progress')) as active_assignments,
    COUNT(cr.id) FILTER (WHERE cr.status = 'completed' AND cr.completed_at::DATE = CURRENT_DATE) as completed_today,
    get_collector_average_rating(p.id) as average_rating
  FROM profiles p
  LEFT JOIN collection_requests cr ON cr.assigned_collector_id = p.id
  WHERE p.role = 'collector'
    AND p.status = 'active'
    AND EXISTS (
      SELECT 1 FROM collector_attendance ca 
      WHERE ca.collector_id = p.id 
        AND ca.date = CURRENT_DATE 
        AND ca.logout_time IS NULL
    )
  GROUP BY p.id, p.full_name, p.phone;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 3.6 Make feedback non-editable after 24 hours
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_feedback_editable()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_editable = TRUE AND 
     (NOW() - OLD.created_at) > INTERVAL '24 hours' THEN
    NEW.is_editable = FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_feedback_edit_window
  BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION check_feedback_editable();

-- ----------------------------------------------------------------------------
-- 3.7 Generate request number
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INTEGER;
BEGIN
  -- Get count of requests today
  SELECT COUNT(*) + 1 INTO seq_num
  FROM collection_requests
  WHERE DATE(created_at) = CURRENT_DATE;
  
  NEW.request_number = 'REQ-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_request_number
  BEFORE INSERT ON collection_requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_number();

-- ----------------------------------------------------------------------------
-- 3.8 Generate payment number
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INTEGER;
BEGIN
  -- Get count of payments today
  SELECT COUNT(*) + 1 INTO seq_num
  FROM payments
  WHERE DATE(created_at) = CURRENT_DATE;
  
  NEW.payment_number = 'PAY-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_payment_number
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION generate_payment_number();

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE collector_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 4.1 PROFILES POLICIES
-- ----------------------------------------------------------------------------

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Staff and Admin can view all profiles
CREATE POLICY "Staff can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admin can insert new profiles (for creating users)
CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 4.2 COLLECTION REQUESTS POLICIES
-- ----------------------------------------------------------------------------

-- Clients can view their own requests
CREATE POLICY "Clients can view own requests"
  ON collection_requests FOR SELECT
  USING (client_id = auth.uid());

-- Clients can create requests
CREATE POLICY "Clients can create requests"
  ON collection_requests FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can update pending requests only
CREATE POLICY "Clients can update pending requests"
  ON collection_requests FOR UPDATE
  USING (
    client_id = auth.uid() 
    AND status = 'pending'
  );

-- Staff/Admin can view all requests
CREATE POLICY "Staff can view all requests"
  ON collection_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Staff/Admin can update any request
CREATE POLICY "Staff can update any request"
  ON collection_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Collectors can view assigned requests
CREATE POLICY "Collectors can view assigned requests"
  ON collection_requests FOR SELECT
  USING (assigned_collector_id = auth.uid());

-- Collectors can update assigned requests (status changes)
CREATE POLICY "Collectors can update assigned requests"
  ON collection_requests FOR UPDATE
  USING (
    assigned_collector_id = auth.uid()
    AND status NOT IN ('pending', 'accepted', 'rejected', 'cancelled')
  );

-- ----------------------------------------------------------------------------
-- 4.3 REQUEST PHOTOS POLICIES
-- ----------------------------------------------------------------------------

-- Users can view photos of their requests
CREATE POLICY "Users can view own request photos"
  ON request_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = request_photos.request_id 
      AND (
        client_id = auth.uid() 
        OR assigned_collector_id = auth.uid()
      )
    )
  );

-- Staff can view all photos
CREATE POLICY "Staff can view all photos"
  ON request_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Clients can upload photos to their requests
CREATE POLICY "Clients can upload photos"
  ON request_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = request_photos.request_id 
      AND client_id = auth.uid()
    )
  );

-- Collectors can upload photos to assigned requests
CREATE POLICY "Collectors can upload photos"
  ON request_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = request_photos.request_id 
      AND assigned_collector_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 4.4 REQUEST STATUS HISTORY POLICIES
-- ----------------------------------------------------------------------------

-- Users can view history of their requests
CREATE POLICY "Users can view own request history"
  ON request_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = request_status_history.request_id 
      AND client_id = auth.uid()
    )
  );

-- Staff can view all history
CREATE POLICY "Staff can view all history"
  ON request_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Collectors can view history of assigned requests
CREATE POLICY "Collectors can view assigned request history"
  ON request_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = request_status_history.request_id 
      AND assigned_collector_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 4.5 SCHEDULES POLICIES
-- ----------------------------------------------------------------------------

-- Collectors can view their assigned schedules
CREATE POLICY "Collectors can view assigned schedules"
  ON collection_schedules FOR SELECT
  USING (
    assigned_collector_id = auth.uid() 
    OR backup_collector_id = auth.uid()
  );

-- Staff can manage all schedules
CREATE POLICY "Staff can view all schedules"
  ON collection_schedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can create schedules"
  ON collection_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update schedules"
  ON collection_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Collectors can update their confirmation status
CREATE POLICY "Collectors can confirm schedules"
  ON collection_schedules FOR UPDATE
  USING (
    (assigned_collector_id = auth.uid() OR backup_collector_id = auth.uid())
    AND status = 'active'
  );

-- ----------------------------------------------------------------------------
-- 4.6 SCHEDULE STOPS POLICIES
-- ----------------------------------------------------------------------------

-- Same as schedules - collectors see assigned, staff sees all
CREATE POLICY "View stops of accessible schedules"
  ON schedule_stops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collection_schedules cs
      WHERE cs.id = schedule_stops.schedule_id
      AND (
        cs.assigned_collector_id = auth.uid()
        OR cs.backup_collector_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('staff', 'admin')
        )
      )
    )
  );

CREATE POLICY "Staff can manage stops"
  ON schedule_stops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Collectors can update completion status
CREATE POLICY "Collectors can complete stops"
  ON schedule_stops FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collection_schedules cs
      WHERE cs.id = schedule_stops.schedule_id
      AND cs.assigned_collector_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 4.7 PAYMENTS POLICIES
-- ----------------------------------------------------------------------------

-- Clients can view their own payments
CREATE POLICY "Clients can view own payments"
  ON payments FOR SELECT
  USING (client_id = auth.uid());

-- Staff can manage all payments
CREATE POLICY "Staff can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update payments"
  ON payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- ----------------------------------------------------------------------------
-- 4.8 FEEDBACK POLICIES
-- ----------------------------------------------------------------------------

-- Clients can view and create their own feedback
CREATE POLICY "Clients can view own feedback"
  ON feedback FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create feedback"
  ON feedback FOR INSERT
  WITH CHECK (
    client_id = auth.uid()
    -- Ensure request is completed
    AND EXISTS (
      SELECT 1 FROM collection_requests 
      WHERE id = feedback.request_id 
      AND status = 'completed'
      AND client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update own feedback"
  ON feedback FOR UPDATE
  USING (
    client_id = auth.uid() 
    AND is_editable = TRUE
  );

-- Collectors can view feedback about them
CREATE POLICY "Collectors can view feedback about them"
  ON feedback FOR SELECT
  USING (collector_id = auth.uid());

-- Staff can view and respond to all feedback
CREATE POLICY "Staff can view all feedback"
  ON feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff can update feedback"
  ON feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- ----------------------------------------------------------------------------
-- 4.9 ANNOUNCEMENTS POLICIES
-- ----------------------------------------------------------------------------

-- All authenticated users can view published announcements for their role
CREATE POLICY "Users can view published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = TRUE
    AND publish_date <= NOW()
    AND (expiry_date IS NULL OR expiry_date > NOW())
    AND (
      'all' = ANY(target_audience)
      OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role::TEXT = ANY(target_audience)
      )
    )
  );

-- Staff can view all announcements
CREATE POLICY "Staff can view all announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Staff can create announcements
CREATE POLICY "Staff can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Staff can update announcements
CREATE POLICY "Staff can update announcements"
  ON announcements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Staff can delete announcements
CREATE POLICY "Staff can delete announcements"
  ON announcements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- ----------------------------------------------------------------------------
-- 4.10 NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- System can create notifications (via service role)
-- This policy allows inserts from service role key

-- ----------------------------------------------------------------------------
-- 4.11 COLLECTOR ATTENDANCE POLICIES
-- ----------------------------------------------------------------------------

-- Collectors can view and manage their own attendance
CREATE POLICY "Collectors can view own attendance"
  ON collector_attendance FOR SELECT
  USING (collector_id = auth.uid());

CREATE POLICY "Collectors can insert own attendance"
  ON collector_attendance FOR INSERT
  WITH CHECK (collector_id = auth.uid());

CREATE POLICY "Collectors can update own attendance"
  ON collector_attendance FOR UPDATE
  USING (collector_id = auth.uid());

-- Staff can view all attendance
CREATE POLICY "Staff can view all attendance"
  ON collector_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- ----------------------------------------------------------------------------
-- 4.12 ACTIVITY LOGS POLICIES
-- ----------------------------------------------------------------------------

-- Only admin can view activity logs
CREATE POLICY "Admin can view activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Staff can view logs (limited to non-sensitive)
CREATE POLICY "Staff can view non-sensitive logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'staff'
    )
    AND action NOT IN ('password_reset', 'role_change', 'admin_action')
  );

-- ============================================================================
-- SECTION 5: STORAGE BUCKETS
-- ============================================================================

-- Note: Run these in Supabase Storage or via API
-- 
-- Bucket: avatars
-- - Public: false
-- - File size limit: 5MB
-- - Allowed mime types: image/jpeg, image/png, image/webp
--
-- Bucket: request-photos
-- - Public: false  
-- - File size limit: 5MB
-- - Allowed mime types: image/jpeg, image/png
--
-- Bucket: receipts
-- - Public: false
-- - File size limit: 10MB
-- - Allowed mime types: image/jpeg, image/png, application/pdf
--
-- Bucket: announcements
-- - Public: true (for announcement images)
-- - File size limit: 10MB
-- - Allowed mime types: image/jpeg, image/png, image/gif, image/webp

-- ============================================================================
-- SECTION 6: INITIAL SEED DATA (OPTIONAL)
-- ============================================================================

-- Insert default admin user (update with your email after signup)
-- This should be done after you create the first user via the auth system
-- 
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-admin@email.com';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
