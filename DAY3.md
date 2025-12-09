# Day 3: Database Schema & Core Models

**Date**: Day 3 of 10  
**Focus**: PostgreSQL database design, Supabase tables, RLS policies, and seed data

---

## 📋 Objectives

- Design and implement complete database schema
- Set up Row Level Security (RLS) policies
- Create database functions and triggers
- Generate TypeScript types from database
- Create seed data for development

---

## 🛠️ Tasks

### 3.1 Database Schema Design (3 hours)

#### Tables to Create:

##### Users & Profiles
```sql
-- profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  barangay TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'staff', 'client', 'collector')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Collection Requests
```sql
-- collection_requests
CREATE TABLE collection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  alt_contact_number TEXT,
  barangay TEXT NOT NULL,
  address TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'urgent')),
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_collector_id UUID REFERENCES profiles(id),
  scheduled_date DATE,
  scheduled_time TEXT,
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Collection Schedules
```sql
-- collection_schedules
CREATE TABLE collection_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('one-time', 'weekly', 'bi-weekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  working_days TEXT[],
  assigned_collector_id UUID REFERENCES profiles(id),
  backup_collector_id UUID REFERENCES profiles(id),
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- schedule_stops (locations in a schedule)
CREATE TABLE schedule_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES collection_schedules(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  address TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  stop_order INTEGER NOT NULL,
  contact_person TEXT,
  contact_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Payments
```sql
-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES collection_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id),
  amount DECIMAL(10, 2) NOT NULL,
  reference_number TEXT,
  date_received DATE,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Feedback
```sql
-- feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES collection_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES profiles(id),
  collector_id UUID REFERENCES profiles(id),
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Announcements
```sql
-- announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'maintenance', 'event')),
  priority TEXT NOT NULL DEFAULT 'normal',
  target_audience TEXT[] NOT NULL DEFAULT ARRAY['all'],
  image_url TEXT,
  publish_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  enable_maintenance_mode BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Notifications
```sql
-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Collector Attendance
```sql
-- collector_attendance
CREATE TABLE collector_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ NOT NULL,
  logout_time TIMESTAMPTZ,
  total_duration INTERVAL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Request Photos
```sql
-- request_photos
CREATE TABLE request_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES collection_requests(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

##### Request Status History (NEW - for timeline tracking per Section 4.3)
```sql
-- request_status_history (tracks all status changes)
CREATE TABLE request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES collection_requests(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_status_history_request ON request_status_history(request_id);
```

##### Activity Logs (NEW - for admin audit trail per Section 5.2)
```sql
-- activity_logs (comprehensive audit trail)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  previous_data JSONB,
  new_data JSONB,
  description TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_entity ON activity_logs(entity_type, entity_id);
```

### 3.2 Row Level Security (RLS) Policies (2 hours)

#### Setup RLS for Each Table:
- [ ] Enable RLS on all tables
- [ ] Create policies for profiles table:
  - Users can read their own profile
  - Users can update their own profile
  - Staff/Admin can read all profiles
  - Admin can update any profile
- [ ] Create policies for collection_requests:
  - Clients can read/create/update their own requests
  - Staff can read/update all requests
  - Collectors can read assigned requests
- [ ] Create policies for payments:
  - Clients can read their own payments
  - Staff can read/create/update all payments
- [ ] Create policies for feedback:
  - Clients can read/create their own feedback
  - Collectors can read feedback about them
  - Staff/Admin can read all feedback
- [ ] Create policies for announcements:
  - All authenticated users can read published announcements
  - Staff/Admin can create/update announcements
- [ ] Create policies for notifications:
  - Users can only read/update their own notifications

### 3.3 Database Functions & Triggers (1.5 hours)

#### Functions to Create:
- [ ] `update_updated_at()` - Trigger to auto-update timestamp
- [ ] `handle_new_user()` - Trigger to create profile on signup
- [ ] `calculate_collector_rating()` - Calculate average rating
- [ ] `get_available_collectors()` - Get collectors currently on duty
- [ ] `auto_assign_collector()` - Auto-assign logic for requests

#### Triggers:
```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 3.4 TypeScript Types Generation (1 hour)

#### Setup Tasks:
- [ ] Install Supabase CLI:
  ```bash
  npm install supabase --save-dev
  ```
- [ ] Generate types from database:
  ```bash
  npx supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
  ```
- [ ] Create helper types:
  - `src/types/models.ts` - Extended model types
  - `src/types/enums.ts` - Status and role enums
  - `src/types/api.ts` - API request/response types

### 3.5 Seed Data (1.5 hours)

#### Create Seed Scripts:
- [ ] `scripts/seed.ts` - Main seed script
- [ ] Create test users for each role:
  - 1 Admin user
  - 2 Staff users
  - 5 Client users
  - 3 Collector users
- [ ] Create sample data:
  - 10 collection requests (various statuses)
  - 5 collection schedules
  - 20 schedule stops
  - Sample payments
  - Sample feedback
  - Sample announcements
- [ ] Create barangay reference data

### 3.6 Supabase Storage Setup (1 hour)

#### Create Storage Buckets:
- [ ] `avatars` - User profile pictures
  - Max size: 5MB
  - Allowed types: image/jpeg, image/png
- [ ] `request-photos` - Collection request photos
  - Max size: 5MB
  - Allowed types: image/jpeg, image/png
- [ ] `receipts` - Payment receipt uploads
  - Max size: 10MB
  - Allowed types: image/*, application/pdf
- [ ] `announcements` - Announcement images
  - Max size: 10MB
  - Allowed types: image/*

#### Storage Policies:
- [ ] Set up RLS for storage buckets
- [ ] Configure public/private access

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `supabase/migrations/001_initial_schema.sql` | Initial database schema |
| `supabase/migrations/002_rls_policies.sql` | RLS policies |
| `supabase/migrations/003_functions_triggers.sql` | Functions and triggers |
| `src/types/database.types.ts` | Generated Supabase types |
| `src/types/models.ts` | Extended model types |
| `src/types/enums.ts` | Enum definitions |
| `scripts/seed.ts` | Database seed script |
| `src/lib/constants/barangays.ts` | Barangay list constant |

---

## ✅ Acceptance Criteria

- [ ] All tables created successfully in Supabase
- [ ] RLS enabled on all tables
- [ ] All RLS policies work correctly for each role
- [ ] Triggers execute properly
- [ ] TypeScript types generated and accurate
- [ ] Seed data populates correctly
- [ ] Storage buckets created with proper policies
- [ ] No SQL errors in migrations

---

## 📝 Database Design Notes

### Status Flow for Requests:
```
pending → accepted → payment_confirmed → assigned → in_progress → completed
       ↘ rejected
               ↘ cancelled (at any stage before in_progress)
```

### User Roles Hierarchy:
```
admin > staff > collector/client
```

### Barangays in Panabo City:
Complete list of 36 barangays as defined in the system overview.

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Database Schema Design | 3 hours |
| RLS Policies | 2 hours |
| Functions & Triggers | 1.5 hours |
| TypeScript Types | 1 hour |
| Seed Data | 1.5 hours |
| Storage Setup | 1 hour |