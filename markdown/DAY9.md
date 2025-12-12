# Day 9: Collector Features & Integrations

**Date**: Day 9 of 10  
**Focus**: Collector Schedule, Pickup Requests, Mapbox Integration, Real-time

---

## 📋 Objectives

- Complete collector schedule management
- Build pickup request handling workflow
- Implement Mapbox for routing and navigation
- Set up real-time updates and notifications

---

## 🛠️ Tasks

### 9.1 Collector Schedule Management (2.5 hours)

#### Page: `src/app/(collector)/schedule/page.tsx`

#### Calendar View:
- [ ] Monthly calendar with status indicators
- [ ] Color-coded schedule markers
- [ ] Click date for details

#### Schedule Details Modal:
- [ ] Route info, collection type, times
- [ ] Number of stops
- [ ] Mapbox route visualization
- [ ] Turn-by-turn directions button
- [ ] Special instructions
- [ ] Contact person details

#### Schedule Actions:
- [ ] Confirm Schedule (notify staff)
- [ ] Decline Schedule (with reasons)
- [ ] Complete Collection

#### Additional Tabs:
- [ ] Regular Schedules (recurring)
- [ ] Collection History

### 9.2 Pickup Request Management (3 hours)

#### Page: `src/app/(collector)/requests/page.tsx`

#### Overview Cards:
- [ ] Pending Acceptance, Accepted, In Progress, Completed, Declined

#### Request Assignment Notifications:
- [ ] Push notification on assignment
- [ ] Quick accept/decline buttons

#### Assigned Requests Table:
- [ ] Columns: Request ID, Client/Contact, Location, Priority, Schedule, Status, Actions

#### Request Details Modal:
- [ ] Complete client info
- [ ] Priority and special instructions
- [ ] Staff notes

#### Collector Actions Flow (per Section 6.3):
- [ ] Accept Request:
  - Status updates to "Accepted by Collector"
  - Client receives notification with collector details (name, contact)
  - Request added to personal queue
- [ ] Decline Request with reason modal:
  - Already at capacity
  - Outside service area
  - Schedule conflict
  - Vehicle/equipment issue
  - Health reasons
  - Other (specify)
  - Auto-reassignment to next available collector
  - Decline logged for performance review
- [ ] Start Service → "On the Way" status button:
  - Status updates to "En Route"
  - Client notified
- [ ] At Location → "Arrived at Location" button:
  - Arrival timestamp recorded
  - Client notified
  - Begin collection process
- [ ] Complete Request → "Mark as Complete" button:
  - Status updates to "Completed"
  - Client receives completion notification
  - Feedback request sent to client
  - Staff receives completion report
  - Performance metrics updated

### 9.3 Mapbox Integration (2.5 hours)

#### Setup:
- [ ] Install mapbox-gl and @mapbox/mapbox-gl-geocoder
- [ ] Configure Mapbox access token
- [ ] Create base map component

#### Map Features:
- [ ] Route visualization
- [ ] Stop markers with numbers
- [ ] Current location tracking
- [ ] Turn-by-turn navigation
- [ ] Route optimization
- [ ] Geocoding for addresses

#### Components:
- [ ] `src/components/maps/MapView.tsx`
- [ ] `src/components/maps/RouteMap.tsx`
- [ ] `src/components/maps/LocationMarker.tsx`
- [ ] `src/lib/mapbox/routing.ts`

### 9.4 Real-time Updates (2 hours)

#### Supabase Realtime Setup:
- [ ] Subscribe to request status changes
- [ ] Subscribe to collector assignments
- [ ] Subscribe to schedule updates
- [ ] Subscribe to notifications table

#### Live Features:
- [ ] Request status changes
- [ ] Collector location tracking
- [ ] Schedule modifications
- [ ] Payment verification
- [ ] New announcements

#### Auto-Refresh:
- [ ] Dashboard auto-updates
- [ ] Table data refresh
- [ ] Map location updates
- [ ] Notification polling

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(collector)/schedule/page.tsx` | Collector schedule |
| `src/app/(collector)/requests/page.tsx` | Request management |
| `src/components/maps/*.tsx` | Map components |
| `src/lib/mapbox/*.ts` | Mapbox utilities |
| `src/lib/realtime/*.ts` | Realtime subscriptions |
| `src/hooks/useRealtime.ts` | Realtime hook |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Collector Schedule | 2.5 hours |
| Pickup Requests | 3 hours |
| Mapbox Integration | 2.5 hours |
| Real-time Updates | 2 hours |