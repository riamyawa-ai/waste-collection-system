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

## 🛠️ Implementation

### Quick Start

The complete SQL schema is available in:
```
supabase/migrations/001_complete_schema.sql
```

Copy and paste the entire file into the **Supabase SQL Editor** and execute.

---

## 📊 Database Schema Overview

### Custom Types (Enums)

| Type | Values |
|------|--------|
| `user_role` | admin, staff, client, collector |
| `user_status` | active, inactive, suspended |
| `request_status` | pending, accepted, rejected, payment_confirmed, assigned, accepted_by_collector, declined_by_collector, en_route, at_location, in_progress, completed, cancelled |
| `priority_level` | low, medium, urgent |
| `schedule_type` | one-time, weekly, bi-weekly, monthly |
| `schedule_status` | draft, active, completed, cancelled |
| `payment_status` | pending, verified, completed |
| `feedback_status` | new, reviewed, responded, flagged |
| `announcement_type` | info, success, warning, error, maintenance, event |
| `announcement_priority` | normal, important, urgent |
| `notification_type` | request_status_update, payment_verification, collector_assignment, collection_reminder, collection_complete, feedback_request, schedule_change, system_announcement |

---

### Tables Summary

| Table | Description | Key Features |
|-------|-------------|--------------|
| `profiles` | User profiles (extends auth.users) | Computed `full_name`, role-based status |
| `collection_requests` | Client pickup requests | Full workflow status tracking, reassignment support |
| `request_photos` | Photos attached to requests | Before/after collection photos |
| `request_status_history` | Audit trail for status changes | Automatic tracking via trigger |
| `collection_schedules` | Regular collection schedules | Recurring pattern support |
| `schedule_stops` | Locations within a route | Ordered stops with completion tracking |
| `payments` | Payment records | Auto-generated payment numbers |
| `feedback` | Client feedback | 24-hour edit window, single feedback per request |
| `announcements` | System announcements | Target audience filtering, maintenance mode |
| `notifications` | User notifications | Type-based categorization |
| `collector_attendance` | Attendance tracking | Auto-calculated duration |
| `activity_logs` | Admin audit trail | Full entity change tracking |

---

## 🔑 Key Schema Corrections Applied

### 1. Extended Request Status Values
```sql
CREATE TYPE request_status AS ENUM (
  'pending',              -- Initial status
  'accepted',             -- Staff approved
  'rejected',             -- Staff rejected
  'payment_confirmed',    -- Payment verified
  'assigned',             -- Collector assigned
  'accepted_by_collector', -- Collector accepted ✨ NEW
  'declined_by_collector', -- Collector declined ✨ NEW
  'en_route',             -- On the way ✨ NEW
  'at_location',          -- Arrived ✨ NEW
  'in_progress',          -- Collection ongoing
  'completed',            -- Finished
  'cancelled'             -- Cancelled
);
```

### 2. Profile Full Name (Computed Column)
```sql
full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED
```

### 3. Collector Rejection Tracking
```sql
-- In collection_requests table
collector_decline_reason TEXT,
collector_declined_at TIMESTAMPTZ,
reassignment_count INTEGER DEFAULT 0
```

### 4. Schedule Stops Updated_at
```sql
-- Added missing column
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### 5. Payment Status Enum
```sql
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'completed');
```

### 6. Feedback Edit Window
```sql
is_editable BOOLEAN DEFAULT TRUE,
last_edited_at TIMESTAMPTZ,
-- Trigger automatically sets is_editable = FALSE after 24 hours
```

### 7. Performance Indexes
Added indexes on:
- `profiles`: role, status, barangay
- `collection_requests`: client_id, status, priority, collector, date, barangay
- `payments`: request_id, client_id, status, date
- `feedback`: request_id, client_id, collector_id, rating, status
- `notifications`: user_id, unread status, created_at
- `activity_logs`: user_id, entity, action, created_at

---

## ⚙️ Functions & Triggers

| Function | Purpose |
|----------|---------|
| `update_updated_at_column()` | Auto-update timestamp on row changes |
| `handle_new_user()` | Create profile when user signs up |
| `track_request_status_change()` | Log status changes to history table |
| `get_collector_average_rating(uuid)` | Calculate collector's average rating |
| `get_available_collectors()` | List collectors currently on duty |
| `check_feedback_editable()` | Disable editing after 24 hours |
| `generate_request_number()` | Auto-generate REQ-YYYYMMDD-XXXX |
| `generate_payment_number()` | Auto-generate PAY-YYYYMMDD-XXXX |

---

## 🔐 Row Level Security (RLS) Policies

### Summary by Table

| Table | Client | Staff | Admin | Collector |
|-------|--------|-------|-------|-----------|
| profiles | R/U own | R all | R/U all | R own |
| collection_requests | CRUD own | CRUD all | CRUD all | R/U assigned |
| request_photos | R own | R all | R all | R/U assigned |
| request_status_history | R own | R all | R all | R assigned |
| collection_schedules | - | CRUD all | CRUD all | R/U assigned |
| schedule_stops | - | CRUD all | CRUD all | R/U assigned |
| payments | R own | CRUD all | CRUD all | - |
| feedback | CRUD own | R/U all | R/U all | R own |
| announcements | R published | CRUD all | CRUD all | R published |
| notifications | RUD own | - | - | RUD own |
| collector_attendance | - | R all | R all | CRUD own |
| activity_logs | - | R limited | R all | - |

---

## 📦 Storage Buckets Configuration

Run these in **Supabase Dashboard → Storage**:

### 1. avatars
```
Public: false
Max size: 5MB
Allowed: image/jpeg, image/png, image/webp
```

### 2. request-photos
```
Public: false
Max size: 5MB
Allowed: image/jpeg, image/png
```

### 3. receipts
```
Public: false
Max size: 10MB
Allowed: image/jpeg, image/png, application/pdf
```

### 4. announcements
```
Public: true
Max size: 10MB
Allowed: image/jpeg, image/png, image/gif, image/webp
```

---

## 🔄 Request Status Workflow

```
                                    ┌──→ rejected
                                    │
pending ──→ accepted ──→ payment_confirmed ──→ assigned
                                                   │
                                    ┌──────────────┴──────────────┐
                                    ↓                              ↓
                         accepted_by_collector          declined_by_collector
                                    │                        │
                                    ↓                        ↓
                               en_route               (reassignment)
                                    │                        │
                                    ↓                        └──→ assigned
                              at_location
                                    │
                                    ↓
                              in_progress
                                    │
                                    ↓
                              completed

(cancelled can occur at any stage before in_progress)
```

---

## 📝 TypeScript Types Generation

After running the schema, generate types:

```bash
# Install Supabase CLI if not installed
npm install supabase --save-dev

# Generate types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

### Create Helper Types

Create `src/types/models.ts`:
```typescript
import { Database } from './database.types';

// Table types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type CollectionRequest = Database['public']['Tables']['collection_requests']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];
export type Announcement = Database['public']['Tables']['announcements']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type CollectorAttendance = Database['public']['Tables']['collector_attendance']['Row'];
export type CollectionSchedule = Database['public']['Tables']['collection_schedules']['Row'];
export type ScheduleStop = Database['public']['Tables']['schedule_stops']['Row'];

// Enum types
export type UserRole = Database['public']['Enums']['user_role'];
export type RequestStatus = Database['public']['Enums']['request_status'];
export type PriorityLevel = Database['public']['Enums']['priority_level'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
```

---

## 🌱 Seed Data

After schema creation, seed initial data:

### 1. Create Admin User
Sign up normally, then run:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@wastecollection.com';
```

### 2. Create Test Users
```sql
-- This requires users to be created via auth.users first
-- Use the Supabase Dashboard or API to create test users
```

### 3. Sample Announcements
```sql
INSERT INTO announcements (title, content, type, priority, target_audience, publish_date, is_published, created_by)
VALUES 
  ('Welcome to Waste Collection System', 'We are pleased to launch our new waste collection management system for Panabo City.', 'info', 'normal', ARRAY['all'], NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('Collection Schedule Update', 'New collection schedules will be effective starting next week.', 'info', 'important', ARRAY['client'], NOW(), true, (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1));
```

---

## ✅ Acceptance Criteria

- [ ] All tables created successfully in Supabase
- [ ] All enums created with correct values
- [ ] RLS enabled on all tables
- [ ] All RLS policies work correctly for each role
- [ ] Triggers execute properly (updated_at, status history)
- [ ] TypeScript types generated and accurate
- [ ] Storage buckets created with proper policies
- [ ] No SQL errors in migrations
- [ ] Request workflow statuses match SYSTEM-OVERVIEW

---

## 📁 Files Created

| File | Description |
|------|-------------|
| `supabase/migrations/001_complete_schema.sql` | Complete database schema |
| `src/types/database.types.ts` | Generated Supabase types (after running gen command) |
| `src/types/models.ts` | Extended model types |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Review and understand schema | 1 hour |
| Execute schema in Supabase | 0.5 hours |
| Test RLS policies | 2 hours |
| Create storage buckets | 0.5 hours |
| Generate TypeScript types | 0.5 hours |
| Create helper types | 1 hour |
| Seed initial data | 1 hour |
| Testing and debugging | 3.5 hours |

---

## 🚨 Important Notes

1. **Execute in Order**: The schema must be executed in order due to foreign key dependencies
2. **Auth Users First**: The `handle_new_user()` trigger requires you to sign up users through Supabase Auth first
3. **Admin Creation**: After first signup, manually update the user's role to 'admin' to get system access
4. **RLS Testing**: Always test RLS policies with different user roles before going to production
5. **Backup**: Create a backup point before running migrations on production