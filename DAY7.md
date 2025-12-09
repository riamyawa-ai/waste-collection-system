# Day 7: Staff Features (Part 2)

**Date**: Day 7 of 10  
**Focus**: Schedule Management, Announcements, Feedback, Payment Management

---

## 📋 Objectives

- Implement collection schedule creation with Mapbox
- Build announcement management system
- Create feedback management interface
- Complete payment management workflow

---

## 🛠️ Tasks

### 7.1 Collection Schedule Management (4 hours)

#### Page: `src/app/(staff)/schedules/page.tsx`

#### Overview Cards:
- [ ] Total Active Schedules
- [ ] Schedules This Week
- [ ] Areas Covered
- [ ] Collectors Assigned

#### Create Schedule Modal:
- [ ] Quick Routes Selection (8 location type buttons):
  - Schools, Hospitals, Parks & Plaza, Government Offices
  - Establishments/Commercial, Residential Areas, Markets, All Types
- [ ] Mapbox Integration (per Section 4.4):
  - Display Panabo City boundary on map
  - Load location markers filtered by type selection
  - Click markers to view location details popup
  - Route line drawing between selected stops
  - Current location tracking
- [ ] Location Filter & Selection Panel:
  - Dynamic list based on type selection
  - Checkbox for each location with name, address, barangay
  - Select/Deselect All option
  - Search within list
- [ ] Drag-and-drop route ordering
- [ ] Route optimization button (shortest path algorithm)
- [ ] Schedule Parameters (name, type, dates, times)
- [ ] Collector Assignment section:
  - Display available collectors (currently on duty)
  - Show attendance status, current assignment load, average rating
  - Select primary and backup collector
- [ ] Special Instructions
- [ ] Broadcast Settings (notify collectors, clients)
- [ ] Review & Confirmation with map visualization

#### Schedule Table:
- [ ] Columns: ID, Name, Route Type, Date/Time, Frequency, Collector, Status, Actions
- [ ] Actions: View (with map), Edit, Duplicate, Cancel, Complete, History, Print

#### Filters:
- [ ] Status, Area, Route Type, Collector, Date Range, Frequency

### 7.2 Announcements Management (2.5 hours)

#### Page: `src/app/(staff)/announcements/page.tsx`

#### Overview Cards:
- [ ] Total, Active, Urgent, Scheduled

#### Create Announcement Modal:
- [ ] Image upload (1200x630px, 10MB)
- [ ] Title and content (rich text, 2000 chars)
- [ ] Type selection (6 types with colors)
- [ ] Target audience (multi-select)
- [ ] Scheduling (publish/expiry dates)
- [ ] Notification settings
- [ ] Maintenance mode option
- [ ] Priority level
- [ ] Preview & Publish

#### Announcements Table:
- [ ] Columns: Thumbnail, Title, Type, Audience, Dates, Status, Views, Actions
- [ ] Actions: Edit, Delete, Duplicate, Extend, Analytics, Archive

### 7.3 User Feedback Management (1.5 hours)

#### Page: `src/app/(staff)/feedback/page.tsx`

#### Overview Cards:
- [ ] Total Feedback, Average Rating, Pending Review, This Month

#### Feedback Table:
- [ ] Columns: ID, Date, Client, Request ID, Collector, Rating, Status, Actions

#### Features:
- [ ] Feedback Details Modal
- [ ] Filter by rating, date, collector, status
- [ ] Analytics Dashboard (ratings by collector, top performers)
- [ ] Export feedback reports
- [ ] Collector Performance Reports

### 7.4 Payment Management (2 hours)

#### Page: `src/app/(staff)/payments/page.tsx`

#### Overview Cards:
- [ ] Total Revenue, Pending Verification, Verified, Average Transaction

#### Search & Filters:
- [ ] Client name, Request ID, Reference number
- [ ] Date filters (today, week, month, custom)
- [ ] Status filter

#### Payment Records Table:
- [ ] Columns: Payment ID, Date, Client, Request ID, Service Date, Amount, Reference, Staff, Status
- [ ] Actions: View Receipt, Edit, Verify, Download, Print, Email

#### Features:
- [ ] Payment Details Modal
- [ ] Bulk operations (export, reports, batch verify, bulk receipts)
- [ ] Payment notifications

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(staff)/schedules/page.tsx` | Schedule management |
| `src/app/(staff)/announcements/page.tsx` | Announcements |
| `src/app/(staff)/feedback/page.tsx` | Feedback management |
| `src/app/(staff)/payments/page.tsx` | Payment management |
| `src/components/staff/ScheduleCreator.tsx` | Schedule form |
| `src/components/staff/MapboxRouteEditor.tsx` | Map component |
| `src/lib/mapbox/utils.ts` | Mapbox utilities |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Schedule Management | 4 hours |
| Announcements | 2.5 hours |
| Feedback Management | 1.5 hours |
| Payment Management | 2 hours |