# Day 5: Client Features (Part 2)

**Date**: Day 5 of 10  
**Focus**: Payment Monitoring, Feedback, Announcements, Notifications, Profile

---

## 📋 Objectives

- Implement payment monitoring dashboard
- Create feedback submission system
- Build announcements display
- Implement notifications center
- Complete profile and settings page

---

## 🛠️ Tasks

### 5.1 Payment Monitoring Page (2 hours)

#### Page: `src/app/(client)/payments/page.tsx`

- [ ] Summary Cards: Total Payments, Completed, Pending, Monthly Breakdown
- [ ] Payment Table with columns: Payment ID, Request ID, Date, Amount, Status, Receipt, Actions
- [ ] Status Filter: All, Pending, Verified, Completed
- [ ] Date Range Filter
- [ ] Payment Details Modal with full breakdown
- [ ] Print/Download Receipt buttons

### 5.2 Submit Feedback Page (2 hours)

#### Page: `src/app/(client)/feedback/page.tsx`

- [ ] Pending feedback list (completed requests awaiting feedback)
- [ ] Feedback Form Modal:
  - Request summary display
  - Star rating component (1-5 stars)
  - Comments textarea (1000 char max)
  - Anonymous option checkbox
- [ ] Feedback History Table
- [ ] Edit option within 24 hours

### 5.3 Service Announcements Page (1.5 hours)

#### Page: `src/app/(client)/announcements/page.tsx`

- [ ] Announcement cards with priority indicators
- [ ] Filters: Type, Status, Date Range
- [ ] Card details: Title, type badge, publish date, priority
- [ ] Mark as Read functionality
- [ ] Announcement Detail Modal

### 5.4 Notifications Center (2 hours)

- [ ] Notification dropdown in header
- [ ] Real-time badge counter
- [ ] Handle all 8 notification types (per Section 3.7):
  1. Request Status Updates
  2. Payment Verification
  3. Collector Assignment
  4. Collection Reminder (24 hours before)
  5. Collection Complete
  6. Feedback Request
  7. Schedule Changes
  8. System Announcements
- [ ] Mark as read/unread
- [ ] Clear all read notifications
- [ ] Filter by type and date
- [ ] Supabase Realtime subscription
- [ ] Click navigation to relevant pages
- [ ] Notification preferences settings

### 5.5 Profile & Settings Page (2.5 hours)

#### Page: `src/app/(client)/profile/page.tsx`

- [ ] Profile Management Tab:
  - View/Edit personal information
  - Update contact details
  - Change barangay/address
  - View account statistics (member since, total requests)
- [ ] Avatar upload with cropper
- [ ] Change Password Tab:
  - Current password verification
  - New password with strength meter
  - Confirm new password
- [ ] Account Security Tab (per Section 3.8):
  - Enable/disable two-factor authentication
  - Security questions setup
  - Active sessions management
  - Login history (last 10 logins)
- [ ] Notification Preferences Tab:
  - Email notification toggles
  - Push notification settings
  - Notification frequency
- [ ] Delete Account Section:
  - Account deactivation option (temporary)
  - Permanent deletion (30-day grace period)
  - Requires password confirmation
  - Final warning about data deletion

---

## 📁 Files to Create

| File | Description |
|------|-------------|
| `src/app/(client)/payments/page.tsx` | Payment monitoring |
| `src/app/(client)/feedback/page.tsx` | Feedback submission |
| `src/app/(client)/announcements/page.tsx` | Announcements |
| `src/app/(client)/profile/page.tsx` | Profile settings |
| `src/components/shared/NotificationsCenter.tsx` | Notifications |

---

## ⏱️ Estimated Time: 10 hours

| Task | Duration |
|------|----------|
| Payment Monitoring | 2 hours |
| Submit Feedback | 2 hours |
| Announcements | 1.5 hours |
| Notifications | 2 hours |
| Profile & Settings | 2.5 hours |