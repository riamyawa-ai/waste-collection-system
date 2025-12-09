# Day 6: Staff Features (Part 1)

**Date**: Day 6 of 10  
**Focus**: Staff Dashboard, User Management, Waste Collection Management

---

## 📋 Objectives

- Build staff dashboard with analytics
- Implement complete user management system
- Create waste collection request processing workflow

---

## 🛠️ Tasks

### 6.1 Staff Dashboard (2.5 hours)

#### Page: `src/app/(staff)/dashboard/page.tsx`

#### Statistics Cards:
- [ ] Total Users (with growth %)
- [ ] Total Collections (Today/Week/Month)
- [ ] Revenue (with trend graph)
- [ ] Pending Vehicle Requests
- [ ] Active Collectors (online count)
- [ ] System Uptime Status

#### Dashboard Sections:
- [ ] Announcement Management Section (create quick, recent list)
- [ ] Quick Actions Panel (manage users, collections, schedules, payments)
- [ ] Charts & Analytics (collection trends, revenue, request distribution)
- [ ] Recent Activity Feed (last 20 activities)

### 6.2 User Management (4 hours)

#### Page: `src/app/(staff)/users/page.tsx`

#### Summary Cards:
- [ ] Total Users, Active, Inactive, Suspended, By Role

#### Add User Modal:
- [ ] Complete user creation form
- [ ] Role selection (Staff, Client, Collector)
- [ ] Status selection
- [ ] Password generator option
- [ ] Auto-verify and welcome email options

#### Users Table:
- [ ] Columns: User ID, Name/Photo, Email/Phone, Role, Status, Created, Last Login, Actions
- [ ] Actions: View, Edit, Delete, Suspend/Activate, Reset Password

#### View User Modal:
- [ ] Complete profile info
- [ ] Account history
- [ ] Collector-specific: Attendance, Performance Metrics
- [ ] Request/Payment history

#### Features:
- [ ] Advanced filters (name, email, role, status, date)
- [ ] Bulk actions (export, status change, notifications)
- [ ] Collector attendance tracking

### 6.3 Waste Collection Management (3.5 hours)

#### Page: `src/app/(staff)/collections/page.tsx`

#### Summary Cards:
- [ ] Total Requests, Pending Review, Accepted, In Progress, Completed, Rejected

#### Filter Section:
- [ ] Status dropdown (10 options)
- [ ] Barangay multi-select
- [ ] Priority Level
- [ ] Date Range
- [ ] Collector filter
- [ ] Search by ID/Name

#### Requests Table:
- [ ] All columns from spec
- [ ] Action buttons: View, Accept, Reject, Record Payment, Assign Collector, Track, Complete

#### Request Processing Workflow (per Section 4.3):
- [ ] Accept/Reject with notifications
- [ ] Payment Recording Modal
- [ ] Collector Assignment Modal (show available, auto-assign)
- [ ] Request Details Modal with timeline

#### Collector Response Handling (per Section 4.3 Step 5):
- [ ] If Collector Accepts:
  - Status changes to "Accepted by Collector"
  - Client receives confirmation with collector details
  - Collection proceeds
- [ ] If Collector Rejects:
  - Record and store rejection reason
  - Activate reassignment workflow:
    1. If multiple collectors online → Auto-offer to next available
    2. If only one collector online → Notify that collector, alert staff
    3. If no collectors online → Flag request with "No collectors available" alert
  - Staff notified of reassignment
  - Decline logged for performance review

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(staff)/layout.tsx` | Staff layout |
| `src/app/(staff)/dashboard/page.tsx` | Staff dashboard |
| `src/app/(staff)/users/page.tsx` | User management |
| `src/app/(staff)/collections/page.tsx` | Collection management |
| `src/components/staff/*.tsx` | Staff components |
| `src/lib/actions/users.ts` | User server actions |
| `src/lib/actions/collections.ts` | Collection server actions |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Staff Dashboard | 2.5 hours |
| User Management | 4 hours |
| Collection Management | 3.5 hours |