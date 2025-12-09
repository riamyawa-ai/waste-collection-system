# Day 4: Client Features (Part 1)

**Date**: Day 4 of 10  
**Focus**: Client Dashboard, Collection Schedule, and Request Service

---

## 📋 Objectives

- Build client dashboard with statistics and quick actions
- Implement collection schedule with calendar view
- Create request service form with full functionality
- Build request management table with filters

---

## 🛠️ Tasks

### 4.1 Client Dashboard (3 hours)

#### Page: `src/app/(client)/dashboard/page.tsx`

#### Dashboard Components to Build:

##### Overview Cards:
- [ ] Total Requests (all-time count)
- [ ] Completed Collections (success rate %)
- [ ] Pending Requests (awaiting review)
- [ ] Active Collections (in progress)

##### Calendar Section:
- [ ] Monthly calendar view component
- [ ] Color-coded request status indicators:
  - Green: Completed
  - Blue: Scheduled/Confirmed
  - Yellow: Pending
  - Orange: In Progress
  - Red: Cancelled/Rejected
- [ ] Click date to view scheduled collections modal
- [ ] Upcoming collections highlight

##### Quick Actions Panel:
- [ ] Request New Pickup button (primary CTA)
- [ ] View Payment History link
- [ ] View Collection Schedule link
- [ ] Submit Feedback link

##### Recent Activity Feed:
- [ ] Last 5 transactions/updates
- [ ] Real-time status changes display
- [ ] Notification preview cards

#### Components to Create:
- [ ] `src/components/client/DashboardStats.tsx`
- [ ] `src/components/client/CollectionCalendar.tsx`
- [ ] `src/components/client/QuickActions.tsx`
- [ ] `src/components/client/RecentActivity.tsx`

### 4.2 Collection Schedule Page (2.5 hours)

#### Page: `src/app/(client)/schedule/page.tsx`

#### View Options to Implement:

##### Calendar View Tab:
- [ ] Full monthly calendar with react-day-picker or similar
- [ ] Color-coded status markers
- [ ] Click date for detailed modal
- [ ] Filter by date range and status
- [ ] Month/Week view toggle

##### Regular Schedules Table Tab:
- [ ] Columns: Schedule ID, Barangay/Area, Collection Day, Time, Assigned Collector, Status
- [ ] View Details action
- [ ] Download Schedule button

##### Collection History Table Tab:
- [ ] Columns: Date, Time, Location, Collector Name, Status, Feedback Given
- [ ] Pagination (25 records per page)
- [ ] Export to PDF/Excel options
- [ ] Actions: View Details, View Receipt, Rate Service

#### Additional Features:
- [ ] Refresh button for syncing updates
- [ ] Request Pickup quick access button
- [ ] Search and filter functionality
- [ ] Download monthly schedule as PDF

#### Components to Create:
- [ ] `src/components/client/ScheduleCalendarView.tsx`
- [ ] `src/components/client/RegularSchedulesTable.tsx`
- [ ] `src/components/client/CollectionHistoryTable.tsx`
- [ ] `src/components/client/ScheduleDetailModal.tsx`

### 4.3 Request Service Page (4.5 hours)

#### Page: `src/app/(client)/requests/page.tsx`

#### Summary Cards:
- [ ] Pending Requests (yellow badge)
- [ ] Accepted Requests (blue badge)
- [ ] In Progress (orange badge)
- [ ] Completed (green badge)
- [ ] Rejected (red badge)

#### Request Pickup Modal Form:

##### 1. Requester Information Section:
- [ ] Requester Name/Facility Name (auto-filled, editable)
- [ ] Contact Number (primary)
- [ ] Alternative Contact Number (optional)

##### 2. Location Details Section:
- [ ] Barangay dropdown (Panabo City areas - 36 options)
- [ ] Complete Address with landmarks textarea

##### 3. Schedule Preferences Section:
- [ ] Priority Level selector:
  - Low (green indicator)
  - Medium (yellow indicator)
  - Urgent (red indicator)
- [ ] Preferred Date (calendar picker, min 1 day advance)
- [ ] Preferred Time Slot dropdown:
  - Morning slots (7AM-12PM)
  - Afternoon slots (1PM-5PM)
  - Flexible option

##### 4. Request Details Section:
- [ ] Special Instructions textarea (500 char max)
  - Placeholder hints:
    - Access codes/gate information
    - Waste and Volume description
    - Specific location details
    - Safety precautions
    - Best approach routes

##### 5. Photo Upload Section:
- [ ] Drag-and-drop upload area
- [ ] Maximum 5 photos
- [ ] 5MB per photo limit
- [ ] Preview before upload
- [ ] Delete uploaded photo option

##### 6. Submit Process:
- [ ] Submit Request button
- [ ] Confirmation modal with:
  - Request summary
  - Terms & Conditions display
  - Confirmation checkbox
  - Final "Confirm & Submit" button

#### Requests Management Table:
- [ ] Columns:
  - Request ID (clickable)
  - Date Requested
  - Barangay
  - Priority (badge)
  - Status (badge with color)
  - Date Scheduled
  - Assigned Collector
  - Actions
- [ ] Action Buttons:
  - View (always available)
  - Edit (Pending status only)
  - Cancel (Pending/Accepted status)
  - Track (In Progress)
  - Download Receipt (Completed)
- [ ] Filters: Status, Date Range, Barangay, Priority
- [ ] Search: By Request ID or location
- [ ] Sort: By date, priority, status

#### Components to Create:
- [ ] `src/components/client/RequestSummaryCards.tsx`
- [ ] `src/components/client/RequestPickupModal.tsx`
- [ ] `src/components/client/RequestForm.tsx`
- [ ] `src/components/client/RequestsTable.tsx`
- [ ] `src/components/client/RequestDetailModal.tsx`
- [ ] `src/components/client/PhotoUploader.tsx`
- [ ] `src/components/client/ConfirmRequestModal.tsx`
- [ ] `src/components/client/TrackCollectorModal.tsx`
- [ ] `src/components/client/CancelRequestModal.tsx`

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(client)/layout.tsx` | Client layout wrapper |
| `src/app/(client)/dashboard/page.tsx` | Client dashboard |
| `src/app/(client)/schedule/page.tsx` | Collection schedule |
| `src/app/(client)/requests/page.tsx` | Request service |
| `src/components/client/*.tsx` | Client-specific components |
| `src/lib/actions/requests.ts` | Server actions for requests |
| `src/lib/validators/request.ts` | Zod schemas for requests |
| `src/hooks/useRequests.ts` | Custom hook for requests |

---

## 🗄️ Server Actions

```typescript
// src/lib/actions/requests.ts
export async function createRequest(data: CreateRequestInput) { }
export async function updateRequest(id: string, data: UpdateRequestInput) { }
export async function cancelRequest(id: string, reason: string) { }
export async function getClientRequests(filters: RequestFilters) { }
export async function getRequestById(id: string) { }
```

---

## ✅ Acceptance Criteria

- [ ] Dashboard loads with accurate statistics
- [ ] Calendar displays scheduled collections correctly
- [ ] Color coding matches status definitions
- [ ] Request form validates all required fields
- [ ] Photo upload works with preview
- [ ] Confirmation modal displays summary
- [ ] Request creates successfully in database
- [ ] Requests table loads with proper pagination
- [ ] Filters and search work correctly
- [ ] Edit and cancel actions work for allowed statuses
- [ ] All modals open/close properly
- [ ] Loading states display during async operations
- [ ] Error messages display for failed operations

---

## 📝 Notes

- Use React Query or SWR for data fetching and caching
- Implement optimistic updates for better UX
- Add proper loading skeletons
- Ensure mobile responsiveness on all components
- Use Supabase Realtime for live updates on dashboard

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Client Dashboard | 3 hours |
| Collection Schedule | 2.5 hours |
| Request Service | 4.5 hours |