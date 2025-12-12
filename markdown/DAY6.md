# Day 6: Staff Features (Part 1)

**Date**: Day 6 of 10  
**Focus**: Staff Dashboard, User Management, Waste Collection Management

---

## 📋 Objectives

- [x] Build staff dashboard with analytics
- [x] Implement complete user management system
- [x] Create waste collection request processing workflow

---

## 🛠️ Tasks

### 6.1 Staff Dashboard (2.5 hours)

#### Page: `src/app/(staff)/dashboard/page.tsx`

#### Statistics Cards:
- [x] Total Users (with growth %)
- [x] Total Collections (Today/Week/Month)
- [x] Revenue (with trend graph)
- [x] Pending Vehicle Requests (actionable count)
- [x] Active Collectors (currently logged in)
- [x] System Uptime Status

#### Announcement Management Section:
- [x] Create Quick Announcement button
- [x] Recent announcements list (last 5)
- [x] Urgent announcements highlighted
- [x] Draft announcements saved

#### Quick Actions Panel:
- [x] Manage Users (direct link)
- [x] View All Collections (filtered to pending)
- [x] Create Schedule (shortcut to schedule creator)
- [x] Process Requests (pending count badge)
- [x] Record Payment (pending payments count)
- [x] View Feedback (unread count)

#### Charts & Analytics:
- [x] Collection trends (weekly/monthly graph)
- [x] Revenue charts (bar/line graphs)
- [x] Request status distribution (pie chart)
- [x] Collector performance metrics
- [x] Busiest barangays (bar chart)

#### Recent Activity Feed:
- [x] Latest user registrations
- [x] Recent requests submitted
- [x] Payments verified
- [x] Collections completed
- [x] Real-time updates (last 20 activities)

### 6.2 User Management (4 hours)

#### Page: `src/app/(staff)/users/page.tsx`

#### Summary Cards:
- [x] Total Users
- [x] Active Users (logged in last 7 days)
- [x] Inactive Users (30+ days no login)
- [x] Suspended Users
- [x] By Role: Staff, Clients, Collectors

#### Add User Modal:
- [x] First Name, Last Name (required)
- [x] Email Address (required, unique validation)
- [x] Phone Number (required, format validation)
- [x] Complete Address (required)
- [x] Barangay (dropdown, required)
- [x] Role selection (Staff, Client, Collector)
- [x] Account Status (Active, Inactive, Suspended)
- [x] Password (with generator option)
- [x] Confirm Password
- [x] Auto-verify checkbox (for Staff and Collector roles)
- [x] Send welcome email checkbox

#### Users Table:
- [x] Columns: User ID, Name/Photo, Email/Phone, Role (badge), Status (color-coded), Created, Last Login, Actions
- [x] Actions: View, Edit, Delete, Suspend/Activate, Reset Password

#### View User Modal:
- [x] Complete profile information
- [x] Account history (registration, last login, modifications)
- [x] Request history (for clients)
- [x] Collection statistics (for collectors)
- [x] Collector-Specific Info:
  - Today's Attendance Status (Logged In/Out)
  - Login/Logout Times
  - Total Duration (today)
  - Attendance History (filterable by date range)
  - Performance Metrics (completion rate, average rating)
- [x] Payment history (for clients)
- [x] Feedback received (for collectors)
- [x] Action logs and notes

#### Advanced Filters:
- [x] Search by name, email, phone
- [x] Filter by role, status, barangay
- [x] Date range (registration date, last login)
- [x] Sort options (name, date created, last active)

#### Bulk Actions:
- [ ] Export selected users (CSV/Excel)
- [ ] Bulk status change
- [ ] Send bulk notifications

#### Collector Attendance Tracking:
- [x] Daily attendance report
- [x] Real-time online status indicator
- [x] Login/logout timestamps
- [x] Total hours worked (daily/weekly/monthly)
- [x] Attendance calendar view
- [ ] Export attendance reports

### 6.3 Waste Collection Management (3.5 hours)

#### Page: `src/app/(staff)/collections/page.tsx`

#### Summary Cards:
- [x] Total Requests (today/week/month)
- [x] Pending Review (actionable count)
- [x] Accepted Requests (awaiting payment)
- [x] In Progress Collections
- [x] Completed Today
- [x] Rejected Requests

#### Filter Section:
- [x] Status Dropdown (all options):
  - All Requests
  - Pending Review
  - Accepted (Awaiting Payment)
  - Payment Confirmed
  - Ready for Assignment
  - Assigned to Collector
  - Accepted by Collector
  - In Progress
  - Completed
  - Rejected
  - Cancelled
- [x] Barangay Filter (multi-select)
- [x] Priority Level (Low, Medium, Urgent)
- [x] Date Range Selector
- [x] Assigned Collector Filter
- [x] Search by Request ID or Client Name

#### Requests Table:
- [x] Columns:
  - Request ID (clickable)
  - Client Name & Contact
  - Barangay/Location
  - Priority Level (color-coded badge)
  - Requested Date & Time
  - Status (with progress indicator)
  - Assigned Collector (if any)
  - Actions
- [x] Action Buttons:
  - View: Full request details modal
  - Accept: Approve request (for Pending status)
  - Reject: Decline with reason (for Pending status)
  - Record Payment: Log payment receipt (for Accepted status)
  - Assign Collector: Select available collector (after payment confirmed)
  - Track: Real-time status (for In Progress)
  - Complete: Mark as done (staff override)
  - Generate Invoice: Create payment invoice
  - Print: Print request details

#### Request Processing Workflow (per Section 4.3):
- [x] Accept/Reject with notifications
- [x] Payment Recording Modal:
  - Request ID and Client details (read-only)
  - Amount Received
  - Reference Number
  - Date Received (date picker)
  - Receipt Upload (scan/photo of proof)
  - Staff Notes (optional)
  - Confirm Payment button
- [x] Collector Assignment Modal:
  - Display available collectors (currently on duty/attendance)
  - Collector details (name, contact, active assignments, completed today, rating, availability)
  - Special instructions for collector
  - Auto-assign option
- [x] Request Details Modal with timeline

#### Collector Response Handling (per Section 4.3 Step 5):
- [x] If Collector Accepts:
  - Status changes to "Accepted by Collector"
  - Client receives confirmation with collector details
  - Collection proceeds
- [x] If Collector Rejects:
  - Record and store rejection reason
  - Activate reassignment workflow:
    1. If multiple collectors online → Auto-offer to next available
    2. If only one collector online → Notify that collector, alert staff
    3. If no collectors online → Flag request with "No collectors available" alert
  - Staff notified of reassignment
  - Decline logged for performance review

#### Collection In Progress Features:
- [x] Collector updates status to "En Route" or "At Location"
- [x] Collector can add notes during collection
- [x] Photo uploads for verification

#### Bulk Operations:
- [ ] Select multiple requests
- [ ] Bulk status update
- [ ] Bulk assignment (same collector for multiple requests)
- [ ] Export selected requests

#### Notifications & Alerts:
- [x] High priority requests highlighted
- [x] Overdue requests flagged
- [x] Payment pending reminders
- [x] Unassigned requests after 24 hours

---

## 📁 Files to Create

| File | Description | Status |
|------|-------------|--------|
| `src/app/(staff)/layout.tsx` | Staff layout | ✅ |
| `src/app/(staff)/dashboard/page.tsx` | Staff dashboard | ✅ |
| `src/app/(staff)/users/page.tsx` | User management | ✅ |
| `src/app/(staff)/collections/page.tsx` | Collection management | ✅ |
| `src/components/staff/*.tsx` | Staff components | ✅ |
| `src/lib/actions/users.ts` | User server actions | ✅ (Wrapped in `staff.ts`) |
| `src/lib/actions/collections.ts` | Collection server actions | ✅ (Wrapped in `staff.ts`) |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration | Status |
|------|----------|--------|
| Staff Dashboard | 2.5 hours | ✅ |
| User Management | 4 hours | ✅ |
| Collection Management | 3.5 hours | ✅ |
