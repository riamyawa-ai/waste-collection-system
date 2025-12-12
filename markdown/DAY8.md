# Day 8: Admin & Collector Features

**Date**: Day 8 of 10  
**Focus**: Admin Dashboard, Reports Module, Collector Dashboard & Schedule

---

## 📋 Objectives

- Build admin dashboard with enhanced controls
- Implement comprehensive reports module
- Create system configuration
- Build collector dashboard and schedule management

---

## 🛠️ Tasks

### 8.1 Admin Dashboard (2 hours)

#### Page: `src/app/(admin)/dashboard/page.tsx`

#### Enhanced Features (extends Staff dashboard):
- [ ] Total Revenue (All-time)
- [ ] User Growth Rate (monthly %)
- [ ] Active users online (real-time)

#### Admin Quick Actions:
- [ ] System Configuration
- [ ] View System Logs
- [ ] Generate Reports
- [ ] Manage Roles & Permissions
- [ ] Security Settings

### 8.2 Admin User Management (1 hour)

#### Extends: Staff User Management

#### Admin-Exclusive Features:
- [ ] Manage Staff accounts
- [ ] Role/permission assignment
- [ ] View all activity logs
- [ ] Force password reset
- [ ] Merge duplicate accounts
- [ ] Permanent delete (no grace period)
- [ ] Access deleted account archives

### 8.3 Reports Module (3.5 hours)

#### Page: `src/app/(admin)/reports/page.tsx`

#### Collection Reports:
- [ ] Daily/Weekly/Monthly/Annual summaries
- [ ] Collections by barangay, collector
- [ ] Revenue generated
- [ ] Completion/cancellation rates
- [ ] Seasonal patterns

#### Vehicle Assistance Reports:
- [ ] Requests received vs completed
- [ ] By priority level
- [ ] By area
- [ ] Peak times
- [ ] Rejection reasons

#### Payment Reports:
- [ ] Revenue Summary (all periods)
- [ ] By service type and area
- [ ] Pending/Overdue payments
- [ ] Collection efficiency

#### Attendance Reports:
- [ ] Daily attendance log
- [ ] Hours worked summary
- [ ] Attendance percentage
- [ ] Individual collector reports

#### Export Options:
- [ ] PDF (formatted with charts)
- [ ] Excel (raw data)
- [ ] CSV
- [ ] Print-friendly

### 8.4 System Configuration (1.5 hours)

#### Page: `src/app/(admin)/settings/page.tsx`

#### Settings Sections:
- [ ] General Settings (name, logo, contact, hours, timezone)
- [ ] Service Configuration (areas, working hours)
- [ ] Email Configuration (SMTP, templates)
- [ ] Security Settings (password policy, session timeout, 2FA, lockout)

### 8.5 Collector Dashboard (2 hours)

#### Page: `src/app/(collector)/dashboard/page.tsx`

#### Overview Cards:
- [ ] Today's Routes
- [ ] Assigned Requests
- [ ] In Progress
- [ ] Completed Today
- [ ] Pending Feedback

#### Dashboard Sections:
- [ ] Today's Schedule Summary
- [ ] Quick Action Buttons:
  - View Full Schedule, Start Navigation, View History, Report Issue
  - Clock In/Out (attendance recording)
- [ ] Today's Route & Actionable Picks
- [ ] Map Overview (current location, stops)
- [ ] Attendance Logs (auto-record on login/logout)
- [ ] Performance Summary

### 8.6 Collector Feedback Review (1 hour)

#### Page: `src/app/(collector)/feedback/page.tsx`

#### Features (per Section 6.4):
- [ ] Feedback Overview Cards:
  - Total feedback received
  - Average rating (overall)
  - Rating breakdown (1-5 stars)
  - Recent feedback (last 10)
- [ ] Feedback List Display:
  - Client name (or anonymous)
  - Service date and request ID
  - Overall Service rating (stars)
  - Written comments
  - Date submitted
- [ ] Feedback Analytics:
  - Rating trends over time (line graph)

### 8.7 Collector Announcements (0.5 hours)

#### Page: `src/app/(collector)/announcements/page.tsx`

#### Features (per Section 6.5):
- [ ] Announcements filtered for collectors
- [ ] Priority announcements pinned at top
- [ ] Unread count badge
- [ ] Categories: System updates, Service changes, Training, Safety alerts
- [ ] Event participation (tree planting, clean-up drives)
- [ ] Acknowledgment checkbox for important notices

### 8.8 Collector Profile & Settings (1 hour)

#### Page: `src/app/(collector)/profile/page.tsx`

#### Features (per Section 6.6):
- [ ] Personal Information:
  - View/edit basic details
  - Update contact numbers
  - Emergency contact information
  - Profile photo upload
  - Collector ID/badge number
- [ ] Attendance Records:
  - Today's login/logout status
  - Weekly/monthly attendance summary
  - Total hours worked
  - Attendance calendar view
- [ ] Performance Dashboard:
  - Collections completed (daily/weekly/monthly)
  - Average rating from clients
  - Customer feedback summary
- [ ] Account Security:
  - Change password
  - Enable two-factor authentication
  - View login history
- [ ] Notification Settings:
  - Push/email notification toggles
- [ ] Logout with clock-out reminder

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(admin)/layout.tsx` | Admin layout |
| `src/app/(admin)/dashboard/page.tsx` | Admin dashboard |
| `src/app/(admin)/reports/page.tsx` | Reports module |
| `src/app/(admin)/settings/page.tsx` | System config |
| `src/app/(collector)/layout.tsx` | Collector layout |
| `src/app/(collector)/dashboard/page.tsx` | Collector dashboard |
| `src/app/(collector)/feedback/page.tsx` | Collector feedback review |
| `src/app/(collector)/announcements/page.tsx` | Collector announcements |
| `src/app/(collector)/profile/page.tsx` | Collector profile & settings |
| `src/components/admin/*.tsx` | Admin components |
| `src/components/collector/*.tsx` | Collector components |
| `src/lib/actions/reports.ts` | Report generation |

---

## ⏱️ Estimated Time: 12.5 hours

| Task | Duration |
|------|----------|
| Admin Dashboard | 2 hours |
| Admin User Management | 1 hour |
| Reports Module | 3.5 hours |
| System Configuration | 1.5 hours |
| Collector Dashboard | 2 hours |
| Collector Feedback Review | 1 hour |
| Collector Announcements | 0.5 hours |
| Collector Profile & Settings | 1 hour |
