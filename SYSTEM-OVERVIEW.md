# Waste Collection Management System - Features Documentation

## 1. System Overview

### 1.1 User Roles
- **Admin**: Full system access, reports generation, system configuration
- **Staff**: Operational management, request processing, schedule creation
- **Client**: Service requests, payment monitoring, feedback submission
- **Collector**: Task execution, route management, collection completion

---

## 2. Authentication & User Management

### 2.1 Landing Page
- **Header Components**:
  - Left: Circular logo with system branding
  - Right: "Register" and "Login" action buttons
- **Hero Section**: Brief system description and benefits
- **Features Overview**: Quick highlights of system capabilities
- **Footer**: Contact information and social media links

### 2.2 Login Page
- **Input Fields**:
  - Email address (validated format)
  - Password (masked input with show/hide toggle)
- **Additional Options**:
  - "Remember Me" checkbox
  - "Forgot Password?" link
  - "Don't have an account? Sign Up" redirect
- **Security Features**:
  - Rate limiting (max 5 attempts per 15 minutes)
  - CAPTCHA after 3 failed attempts
  - Session timeout after 30 minutes of inactivity

### 2.3 Registration Page
- **Required Fields**:
  - First Name
  - Last Name
  - Email Address (with validation)
  - Phone Number (with format validation)
  - Password (with strength indicator)
  - Confirm Password (real-time matching validation)
- **Optional Fields**:
  - Complete Address
  - Barangay (dropdown for Panabo City areas)
- **Password Policy Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)
- **Terms & Conditions**: Checkbox agreement required
- **Success Action**: Redirect to email verification page

### 2.4 Email Verification
- **Features**:
  - Verification link sent to registered email
  - Resend verification email option (with 60-second cooldown)
  - Link expiration timer (1 hour)
  - Automatic redirect to dashboard upon successful verification

### 2.5 Password Recovery
- **Process Flow**:
  1. User enters registered email address
  2. System sends password reset link (expires in 1 hour)
  3. User clicks link and enters new password
  4. Password updated with confirmation message
- **Security**: Reset links are single-use only

---

## 3. Client Features

### 3.1 Client Dashboard
**Overview Cards** (with color-coded indicators):
- Total Requests (All-time count)
- Completed Collections (Success rate percentage)
- Pending Requests (Awaiting staff review)
- Active Collections (Currently in progress)

**Calendar Section**:
- Monthly view with color-coded request statuses
- Click date to view scheduled collections
- Visual indicators for regular schedules
- Upcoming collections highlighted

**Quick Actions Panel**:
- Request New Pickup (primary action button)
- View Payment History
- View Collection Schedule
- Submit Feedback

**Recent Activity Feed**:
- Last 5 transactions/updates
- Real-time status changes
- Notifications preview

### 3.2 Collection Schedule
**View Options**:
1. **Calendar View**:
   - Color-coded by status:
     - Green: Completed
     - Blue: Scheduled/Confirmed
     - Yellow: Pending Confirmation
     - Orange: In Progress
     - Red: Cancelled/Rejected
   - Click dates to view detailed modal
   - Filter by date range and status

2. **Regular Schedules Table**:
   - Columns: Schedule ID, Barangay/Area, Collection Day, Time, Assigned Collector, Status
   - Actions: View Details, Download Schedule

3. **Collection History Table**:
   - Columns: Date, Time, Location, Collector Name, Status, Feedback Given
   - Pagination (25 records per page)
   - Export to PDF/Excel options
   - Actions: View Details, View Receipt, Rate Service

**Features**:
- Refresh button to sync latest updates
- Request Pickup button (quick access)
- Search and filter functionality
- Download monthly schedule as PDF

### 3.3 Request Service

**Summary Cards**:
- Pending Requests (yellow)
- Accepted Requests (blue)
- In Progress (orange)
- Completed (green)
- Rejected (red)

**Request Pickup Button & Modal**:

*Request Form Fields*:
1. **Requester Information**:
   - Requester Name/Facility Name (auto-filled from profile, editable)
   - Contact Number (primary)
   - Alternative Contact Number (optional)

2. **Location Details**:
   - Barangay (dropdown - Panabo City areas only):
     - A.O. Floirendo, Buenavista, Cagaycay, Cagangohan, Datu Abdul Dadia, Gredu (Poblacion), J.P. Laurel (Poblacion), Kasilak, Katipunan, Katualan, Kauswagan, Kiotoy, Little Panay (Poblacion), Lower Panaga (Roxas), Mabunao, Malativas, Manay, Nanyo, New Malaga (Dalisay), New Malitbog, New Pandan (Poblacion), New Visayas, Quezon, Salvacion, San Francisco (Poblacion), San Nicolas (Poblacion), San Roque, San Vicente, Santa Cruz, Santo Niño (Poblacion), Southern Davao, Tagpore, Tibungol, Upper Licanan, Waterfall
   - Complete Address (with landmarks)

3. **Schedule Preferences**:
   - Priority Level:
     - Low (green)
     - Medium (yellow)
     - Urgent (red)
   - Preferred Date (calendar picker, minimum 1 day advance)
   - Preferred Time Slot:
     - Morning (7:00 AM - 8:00 AM, 8:00 AM - 9:00 AM, 9:00 AM - 10:00 AM, 10:00 AM, 11:00 AM, 11:00AM - 12:00PM)
     - Afternoon (1:00 PM - 2:00 PM, 2:00 PM - 3:00 PM, 3:00 PM - 4:00 PM, 4:00 PM - 5:00 PM)
     - Flexible

4. **Request Details**:
   - Special Instructions (textarea, 500 characters max):
     - Access codes/gate information
     - Waste and Volume description
     - Specific location details
     - Safety precautions
     - Best approach routes

5. **Photo Upload** (Optional):
   - Maximum 5 photos
   - Max 5MB per photo
   - Accepted formats: JPG, PNG
   - Preview before upload

6. **Submit Process**:
   - "Submit Request" button opens confirmation modal
   - **Confirmation Modal Contents**:
     - Request Summary (all entered details)
     - Terms & Conditions
     - Confirmation Checkbox: "I confirm that the details provided above are accurate and I request vehicle assistance for waste collection at the specified location and time."
     - Final "Confirm & Submit" button

**Requests Management Table**:
- **Columns**: Request ID, Date Requested, Barangay, Priority, Status, Date Scheduled, Assigned Collector, Actions
- **Status Indicators**:
  - Pending (awaiting staff review)
  - Accepted (approved by staff, awaiting payment)
  - Payment Confirmed (ready for collector assignment)
  - Assigned (collector assigned)
  - In Progress (collector en route/collecting)
  - Completed (service finished)
  - Rejected (with reason)
  - Cancelled (by client or staff)

- **Action Buttons**:
  - View (always available): Opens detailed modal
  - Edit (only for Pending status): Modify request details
  - Cancel (for Pending/Accepted status): Cancel request with reason
  - Track (for In Progress): Real-time collector location
  - Download Receipt (for Completed): PDF receipt

- **Filters**: Status, Date Range, Barangay, Priority Level
- **Search**: By Request ID or location
- **Sort**: By date, priority, status

### 3.4 Payment Monitoring

**Summary Cards**:
- Total Payments (lifetime amount)
- Completed Payments (count and amount)
- Pending Payments (awaiting verification)
- Total Amount Spent (with monthly breakdown)

**Payment Table**:
- **Columns**: Payment ID, Request ID, Date, Amount, Status, Receipt, Actions
- **Status Filter**: All, Pending, Verified, Completed
- **Date Range Filter**: Custom date selection

**Payment Details Modal**:
- Request Reference Number
- Service Details (date, location, collector)
- Breakdown:
  - Priority Level
  - Total Amount
- Payment Information:
  - Reference Number
  - Date Submitted
  - Verification Status
- Staff Notes (if any)
- Print Receipt Button
- Download PDF Button

**Payment Process Note**:
- Payment details are recorded by staff after client sends proof outside the system
- Clients can view but cannot directly input payment information
- Status updates trigger automatic notifications

### 3.5 Submit Feedback

**Features**:
- Only available after request completion
- One feedback submission per completed request

**Feedback Form**:
1. **Request Summary Display**:
   - Request ID and Date
   - Service Location
   - Collector Name
   - Completion Date

2. **Rating System**:
   - Overall Service (1-5 stars)

3. **Written Feedback**:
   - Comments/Suggestions (textarea, 1000 characters max)
   - Anonymous option checkbox

4. **Submit Button**: Feedback submitted notification

**Feedback History Table**:
- Columns: Date, Request ID, Collector, Rating, Status, Actions
- View past feedback submissions
- Edit option (within 24 hours of submission)

### 3.6 Service Announcements

**Display Features**:
- Announcement cards with priority indicators
- Filter by:
  - Type (Warning, Info, Success, Maintenance, Event)
  - Status (Active, Scheduled, Expired)
  - Date Range

**Announcement Card Details**:
- Title and description
- Announcement type icon/badge
- Date published
- Active period (start and end date)
- Priority level indicator
- Attached images (if any)
- "Mark as Read" option

**Notification Settings**:
- Email notifications toggle
- In-app notifications only

### 3.7 Notifications

**Notification Types**:
1. Request Status Updates
2. Payment Verification
3. Collector Assignment
4. Collection Reminder (24 hours before)
5. Collection Complete
6. Feedback Request
7. Schedule Changes
8. System Announcements

**Features**:
- Real-time notification badge counter
- Mark as read/unread
- Clear all read notifications
- Filter by type and date
- Notification preferences settings

### 3.8 Profile & Settings

**Profile Management**:
- View/Edit personal information
- Update contact details
- Change barangay/address
- Upload profile picture
- View account statistics (member since, total requests, etc.)

**Change Password**:
- Current password verification
- New password (with strength meter)
- Confirm new password
- Two-factor authentication option

**Account Security**:
- Active sessions management
- Login history (last 10 logins)
- Enable/disable two-factor authentication
- Security questions setup

**Notification Preferences**:
- Email notification toggles
- Push notification settings
- Notification frequency

**Delete Account**:
- Requires password confirmation
- Final warning about data deletion
- Account deactivation option (temporary)
- Permanent deletion (30-day grace period)

---

## 4. Staff Features

### 4.1 Staff Dashboard

**Statistics Cards**:
- Total Users (with growth percentage)
- Total Collections Today/This Week/This Month
- Revenue (Today/Week/Month with trend graph)
- Pending Vehicle Requests (actionable count)
- Active Collectors (currently logged in)
- System Uptime Status

**Announcement Management Section**:
- Create Quick Announcement button
- Recent announcements list (last 5)
- Urgent announcements highlighted
- Draft announcements saved

**Quick Actions Panel**:
- Manage Users (direct link)
- View All Collections (filtered to pending)
- Create Schedule (shortcut to schedule creator)
- Process Requests (pending count badge)
- Record Payment (pending payments count)
- View Feedback (unread count)

**Charts & Analytics**:
- Collection trends (weekly/monthly graph)
- Revenue charts (bar/line graphs)
- Request status distribution (pie chart)
- Collector performance metrics
- Busiest barangays (bar chart)

**Recent Activity Feed**:
- Latest user registrations
- Recent requests submitted
- Payments verified
- Collections completed
- Real-time updates (last 20 activities)

### 4.2 User Management

**Summary Cards**:
- Total Users
- Active Users (logged in last 7 days)
- Inactive Users (30+ days no login)
- Suspended Users
- By Role: Staff, Clients, Collectors

**Add User Button & Modal**:
*User Creation Form*:
- First Name (required)
- Last Name (required)
- Email Address (required, unique validation)
- Phone Number (required, format validation)
- Complete Address (required)
- Barangay (dropdown, required)
- Role Selection (required):
  - Staff
  - Client
  - Collector
- Account Status (required):
  - Active
  - Inactive
  - Suspended
- Password (required, with generator option)
- Confirm Password (required)
- Auto-verify checkbox (for Staff and Collector roles)
- Send welcome email checkbox

**Users Table**:
- **Columns**: 
  - User ID
  - Full Name (with profile photo thumbnail)
  - Email & Phone
  - Role (badge indicator)
  - Status (color-coded badge)
  - Date Created
  - Last Login
  - Actions

- **Action Buttons**:
  - **View**: Opens detailed modal
  - **Edit**: Modify user information
  - **Delete**: Remove user (requires confirmation)
  - **Suspend/Activate**: Toggle account status
  - **Reset Password**: Send password reset email

**View User Modal Details**:
- Complete profile information
- Account history (registration, last login, modifications)
- Request history (for clients)
- Collection statistics (for collectors)
- **Collector-Specific Info**:
  - Today's Attendance Status (Logged In/Out)
  - Login Time (today)
  - Logout Time (today)
  - Total Duration (today)
  - Attendance History (filterable by date range)
  - Performance Metrics (completion rate, average rating)
- Payment history (for clients)
- Feedback received (for collectors)
- Action logs and notes

**Advanced Filters**:
- Search by name, email, phone
- Filter by role, status, barangay
- Date range (registration date, last login)
- Sort options (name, date created, last active)

**Bulk Actions**:
- Export selected users (CSV/Excel)
- Bulk status change
- Send bulk notifications

**Collector Attendance Tracking**:
- Daily attendance report
- Real-time online status indicator
- Login/logout timestamps
- Total hours worked (daily/weekly/monthly)
- Attendance calendar view
- Export attendance reports

### 4.3 Waste Collection Management

**Summary Cards**:
- Total Requests (today/week/month)
- Pending Review (actionable count)
- Accepted Requests (awaiting payment)
- In Progress Collections
- Completed Today
- Rejected Requests

**Filter Section**:
- Status Dropdown:
  - All Requests
  - Pending Review
  - Accepted (Awaiting Payment)
  - Payment Confirmed
  - Ready for Assignment
  - Assigned to Collector
  - In Progress
  - Completed
  - Rejected
  - Cancelled
- Barangay Filter (multi-select)
- Priority Level (Low, Medium, Urgent)
- Date Range Selector
- Assigned Collector Filter
- Search by Request ID or Client Name

**Requests Table**:
- **Columns**:
  - Request ID (clickable)
  - Client Name & Contact
  - Barangay/Location
  - Priority Level (color-coded badge)
  - Requested Date & Time
  - Status (with progress indicator)
  - Assigned Collector (if any)
  - Actions

- **Action Buttons** (role-based visibility):
  - **View**: Full request details modal
  - **Accept**: Approve request (for Pending status)
  - **Reject**: Decline with reason (for Pending status)
  - **Record Payment**: Log payment receipt (for Accepted status)
  - **Assign Collector**: Select available collector (after payment confirmed)
  - **Track**: Real-time status (for In Progress)
  - **Complete**: Mark as done (staff override)
  - **Generate Invoice**: Create payment invoice
  - **Print**: Print request details

**Request Processing Workflow**:

1. **Request Submission** (Client):
   - Client submits pickup request
   - Status: "Pending Review"
   - Notification sent to staff

2. **Staff Review**:
   - Staff reviews request details
   - **Accept Action**:
     - Status changes to "Accepted - Awaiting Payment"
     - Client notified with payment instructions
     - Invoice generated automatically
   - **Reject Action**:
     - Rejection reason modal required
     - Status changes to "Rejected"
     - Client notified with reason
     - Request archived

3. **Payment Recording** (After Acceptance):
   - Client sends payment proof externally (bank transfer, cash, etc.)
   - Staff clicks "Record Payment" on accepted request
   - **Payment Recording Modal**:
     - Request ID and Client details (read-only)
     - Amount Received
     - Reference Number
     - Date Received (date picker)
     - Receipt Upload (scan/photo of proof)
     - Staff Notes (optional)
     - "Confirm Payment" button
   - Upon confirmation:
     - Status changes to "Payment Confirmed - Ready for Assignment"
     - Digital receipt generated
     - Client notified
     - Payment logged in system

4. **Collector Assignment**:
   - Staff clicks "Assign Collector"
   - **Assignment Modal**:
     - Display available collectors (currently on duty/attendance)
     - Show collector details:
       - Name and contact
       - Active assignments count
       - Today's completed collections
       - Average rating
       - Availability status
     - Special instructions for collector
     - Auto-assign option (system picks best available)
   - Upon assignment:
     - Status changes to "Assigned to Collector"
     - Collector receives notification
     - Client notified with collector details
     - Assignment timestamp logged

5. **Collector Response**:
   **If Collector Accepts**:
Status changes to "Accepted by Collector"
Client receives confirmation
Collection proceeds
   **If Collector Rejects**:
Record and store the rejection reason.
Activate the reassignment workflow.
    **Reassignment Workflow**
        -1. If multiple collectors are online
          - System automatically offers the request to the next available collector.
          - Staff are notified that the request has been re-offered to another collector.
        - 2. If only one collector is online (the rejecting one)
          - System sends a notification to that collector indicating no alternate collectors are            available.
          - Staff are notified that reassignment could not occur due to lack of available collectors.
        - 3. If no collectors are online
          - The system flags the request with a “No collectors available” alert.
          - Staff are notified to manually handle the request.
     - Staff notified to new collector

6. **Collection In Progress**:
   - Collector updates status to "En Route" or "At Location"
   - Collector can add notes during collection
   - Photo uploads for verification

7. **Collection Completion**:
   - Collector marks as "Complete"
   - Status changes to "Completed"
   - Client and staff notified
   - Feedback request sent to client

**Request Details Modal**:
- Complete request information
- Client contact details
- Request timeline/history log
- Assigned collector info (if applicable)
- Payment status and receipt
- Status change history with timestamps

**Bulk Operations**:
- Select multiple requests
- Bulk status update
- Bulk assignment (same collector for multiple requests)
- Export selected requests

**Notifications & Alerts**:
- High priority requests highlighted
- Overdue requests flagged
- Payment pending reminders
- Unassigned requests after 24 hours

### 4.4 Collection Schedule Management (Set Schedule)

**Overview Cards**:
- Total Active Schedules
- Schedules This Week
- Areas Covered
- Collectors Assigned

**Create Collection Schedule Button & Modal**:

**Schedule Creation Interface**:

1. **Quick Routes Selection**:
   - Predefined location type buttons:
     - Schools
     - Hospitals
     - Parks & Plaza
     - Government Offices
     - Establishments/Commercial
     - Residential Areas
     - Markets
     - All Types
   - Multiple selection enabled

2. **Interactive Mapbox Integration**:
   - Mapbox Map displays Panabo City boundary
   - Filter markers based on location type selection
   - Click markers to view location details

3. **Location Filter & Selection Panel**:
   - **Dynamic List** (populated based on type selection):
     - Example: If "Schools" selected, lists all schools in Panabo City
     - Checkbox for each location
     - Location name, address, barangay
   - **Select/Deselect All** option
   - Search within list
   - **Route Ordering**:
     - Drag-and-drop to arrange collection sequence
     - Stop numbers assigned automatically
     - Optimize route button (shortest path algorithm)

4. **Schedule Parameters**:
   - **Schedule Name**: Descriptive title for route
   - **Schedule Type**:
     - One-time
     - Weekly (recurring)
     - Bi-weekly
     - Monthly
   - **Working Days Selection**:
     - Month selector
     - Week selector (1st, 2nd, 3rd, 4th week)
     - Day checkboxes (Mon-Sun)
   - **Time Settings**:
     - Start Time (time picker)
     - End Time (time picker)
   - **Start Date**: First collection date (calendar picker)
   - **End Date**: Last collection date (for recurring, leave blank for ongoing)

5. **Collector Assignment**:
   - **Available Collectors Display**:
     - List of collectors on duty
     - Attendance status indicators
     - Current assignment load
   - Select primary collector
   - Select backup collector (optional)
   - Notify collectors

6. **Special Instructions**:
   - Specific notes for collectors
   - Access information
   - Safety precautions
   - Equipment requirements
   - Contact person at each location

7. **Broadcast Settings**:
   - Notify assigned collectors
   - Notify clients
   - Notification message preview
   - Schedule publish date

8. **Review & Confirmation**:
   - Schedule summary display
   - Map with full route visualization
   - Stop list with sequence numbers
   - Assigned resources
   - Edit button for corrections
   - "Create Schedule" final confirmation

**Schedule Table Display**:
- **Columns**:
  - Schedule ID
  - Schedule Name
  - Route Type/Areas
  - Date & Time
  - Frequency (One-time/Recurring)
  - Assigned Collector(s)
  - Status (Draft, Active, Completed, Cancelled)
  - Actions

- **Action Buttons**:
  - **View**: Detailed schedule modal with map
  - **Edit**: Modify schedule (if not yet started)
  - **Duplicate**: Create similar schedule
  - **Cancel**: Cancel upcoming schedule
  - **Complete**: Mark as done manually
  - **View History**: Past occurrences (for recurring)
  - **Print**: Schedule printout for field use

**Filter Options**:
- Status (Active, Completed, Scheduled, Cancelled)
- Area/Barangay
- Route Type
- Assigned Collector
- Date Range
- Frequency

### 4.5 Activities and Service Announcements

**Overview Cards**:
- Total Announcements
- Active Announcements
- Urgent Priority Count
- Scheduled (Future) Announcements

**Create Announcement Button & Modal**:

**Announcement Form**:
1. **Visual Content**:
   - Upload Image/Photo (optional)
   - Image preview
   - Recommended size: 1200x630px
   - Max file size: 10MB
   - Formats: JPG, PNG, GIF

2. **Announcement Details**:
   - **Title**: Clear, concise headline (100 characters max)
   - **Message Body**: Full announcement content (rich text editor)
     - Text formatting options
     - Bullet points and lists
     - Link insertion
     - Up to 2000 characters
   
3. **Announcement Classification**:
   - **Type** (with color coding):
     - Info (blue) - General information
     - Success (green) - Positive updates
     - Warning (yellow) - Cautions and alerts
     - Error (red) - System issues or problems
     - Maintenance (orange) - System maintenance notices
     - Event (purple) - Activities like tree planting, clean-up drives, etc.
   
4. **Target Audience** (multi-select):
   - All Users
   - Clients Only
   - Staff Only
   - Collectors Only

5. **Scheduling**:
   - **Publish Date**: When announcement goes live
   - **Expiry Date**: When announcement auto-archives
   - **Publish Immediately**: Checkbox option

6. **Notification Settings**:
   - Send Email Notification (checkbox)
   - Send Push Notification (checkbox)

7. **Special Features**:
   - **Maintenance Mode** (for Maintenance type):
     - Enable maintenance mode checkbox
     - Prevent selected users from logging in
     - Display maintenance message on login page
     - Scheduled maintenance window
   - **Priority Level**:
     - Normal
     - Important
     - Urgent (pinned to top)
   
8. **Preview & Publish**:
   - Preview how announcement appears to users
   - Draft save option
   - Schedule for later
   - Publish now button

**Announcements Management Table**:
- **Columns**:
  - Thumbnail/Icon
  - Title
  - Type (badge)
  - Target Audience
  - Publish Date
  - Expiry Date
  - Status (Draft, Active, Scheduled, Expired)
  - Views Count
  - Actions

- **Action Buttons**:
  - Edit (for drafts and scheduled)
  - Delete (confirmation required)
  - Duplicate (create similar announcement)
  - Extend Expiry (for active)
  - View Analytics (engagement stats)
  - Archive

**Filter & Search**:
- Type filter
- Status filter
- Target audience filter
- Date range filter
- Search by title/content

**Special Use Cases**:
- **Event Announcements**: Include event details, registration info, what to bring
- **Emergency Alerts**: Typhoon preparations, suspended services, urgent updates
- **Service Updates**: Schedule changes, new features, policy updates
- **Community Activities**: Tree planting, coastal cleanup, recycling drives

### 4.6 User Feedback Management

**Overview Cards**:
- Total Feedback Received
- Average Rating (overall)
- Pending Review
- Feedback This Month

**Feedback Table**:
- **Columns**:
  - Feedback ID
  - Date Submitted
  - Client Name
  - Request ID (linked)
  - Collector Name (linked)
  - Overall Rating (star display)
  - Category Ratings
  - Status (New, Reviewed, Responded, Flagged)
  - Actions

**Detailed Ratings Display**:
- Overall Service (stars)

**Feedback Details Modal**:
- Complete service information
- All rating categories
- Written comments
- Timestamp and client details
- Related request details
- Collector information
- Staff notes section
- Response to client option
- Flag for follow-up checkbox

**Filter Options**:
- Rating range (1-5 stars)
- Date range
- Collector name
- Status
- Barangay/area

**Analytics Dashboard**:
- Average ratings by collector
- Top-rated collectors

**Actions Available**:
- View detailed feedback
- Export feedback reports

**Collector Performance Reports**:
- Individual collector ratings
- Feedback summary
- Recognition for high ratings

### 4.7 Payment Management

**Overview Cards**:
- Total Revenue (Today/Week/Month)
- Pending Verification
- Verified Payments
- Average Transaction Value

**Advanced Search & Filters**:
- **Search Bar**: By client name, request ID, reference number
- **Date Filters**:
  - Today, This Week, This Month, Custom Range
  - Payment date vs. Service date toggle
- **User Filter**: Select specific client
- **Status Filter**:
  - All
  - Pending Verification
  - Verified
  - Completed
- **Barangay**: Location-based filter

**Payment Records Table**:
- **Columns**:
  - Payment ID (unique)
  - Date Recorded
  - Client Name & Contact
  - Request ID (linked)
  - Service Date
  - Amount (₱)
  - Reference Number
  - Recorded By (staff name)
  - Status
  - Actions

**Action Buttons**:
- **View Receipt**: Display full receipt details
- **Edit**: Modify payment record (with audit log)
- **Verify**: Confirm payment authenticity
- **Download**: PDF receipt
- **Print**: Print receipt
- **Email Receipt**: Send to client

**Payment Details Modal**:
- Client information
- Request details and service summary
- Payment breakdown:
  - Total amount
- Payment information:
  - Reference number
  - Date received
  - Recorded by (staff)
  - Verification status
- Receipt attachment view
- Staff notes and actions
- Payment history/modifications log

**Bulk Payment Operations**:
- Export payment records (Excel/CSV/PDF)
- Generate monthly revenue reports
- Batch verification for multiple payments
- Bulk receipt generation
- Mass email receipts to clients

**Payment Notifications**:
- Auto-notify client when payment verified
- Alert staff of pending verifications over 24 hours
- Receipt generation confirmation
---

## 5. Admin Features

### 5.1 Admin Dashboard

**Enhanced Statistics Cards** (Same as Staff plus):
- Total Revenue (All-time)
- User Growth Rate (monthly percentage)

**System Overview Section**:
- Active users online (real-time count)

**Quick Actions Panel** (Additional to Staff features):
- System Configuration
- View System Logs
- Generate Reports
- Manage Roles & Permissions
- Security Settings

### 5.2 User Management
*Same as Staff features (Section 4.2)* with additional capabilities:

**Admin-Exclusive Features**:
- Manage Staff accounts (create, edit, delete)
- Assign roles and permissions
- View all user activity logs
- Force password reset for any user
- Merge duplicate accounts
- Permanently delete accounts (no grace period)
- Access deleted account archives

**Advanced Security**:
- Two-factor authentication enforcement
- Password policy configuration
- Session timeout settings
- Login attempt monitoring


### 5.3 Service Management
*Same as Staff features (Section 4.3)*:

### 5.4 User Feedback Management
*Same as Staff features (Section 4.6)*:

### 5.5 Reports Module

**Report Categories**:

#### 5.5.1 Collection Reports
**Generated Reports**:
- Daily Collection Summary
  - Total collections completed
  - Collections by barangay
  - Collections by collector
  - Revenue generated
  
- Weekly/Monthly Collection Analysis
  - Collection trends
  - Peak collection days/times
  - Service area coverage
  - Completion rate percentage
  - Cancellation rate and reasons

- Annual Collection Overview
  - Year-over-year growth
  - Seasonal patterns
  - Area expansion tracking
  - Service improvements implemented

**Report Filters**:
- Date range selector
- Barangay/area selection
- Collector filter
- Collection type
- Status filter

**Export Options**:
- PDF (formatted report with charts)
- Excel (raw data for analysis)
- CSV (data export)
- Print-friendly version

#### 5.5.2 Truck/Vehicle Assistance Reports
**Report Contents**:
- Total Request Summary
  - Requests received vs. completed
  - Request by priority level
  - Request by barangay/area

- Request Patterns
  - Peak request times
  - Most requested areas
  - Request rejection rate and reasons

**Visualization**:
- Timeline graphs for request trends
- Pie charts for request distribution

#### 5.5.3 Receipt/Payment Records Reports
**Financial Reports**:
- Revenue Summary
  - Daily/Weekly/Monthly/Annual totals
  - Revenue by service type
  - Revenue by barangay/area

- Receivables Report
  - Pending payments list
  - Overdue payments
  - Payment aging report
  - Collection efficiency rate

#### 5.5.4 Garbage Collector Attendance Reports
**Attendance Metrics**:
- Daily Attendance Log
  - Login/logout times
  - Total hours worked
  
- Attendance Summary
  - Days present/absent
  - Attendance percentage

- Performance Metrics
  - Customer ratings received

**Individual Collector Reports**:
- Personal attendance record
- Feedback summary

### 5.6 System Configuration (Admin Only)

**General Settings**:
- System name and branding
- Logo upload
- Contact information
- Business hours
- Timezone settings

**Service Configuration**:
- Service areas (enable/disable barangays)
- Working hours and days

**Email Configuration**:
- SMTP settings
- Email templates management
- Notification email addresses

**Security Settings**:
- Password policy enforcement
- Session timeout duration
- Two-factor authentication requirement
- Failed login attempt limits
- Account lockout duration

---

## 6. Collector Features

### 6.1 Collector Dashboard

**Overview Cards**:
- Today's Routes (number of scheduled stops)
- Assigned Requests (pending acceptance)
- In Progress (currently collecting)
- Completed Today (with earnings if applicable)
- Pending Feedback (from clients)

**Today's Schedule Summary**:
- Current time and date
- Next scheduled stop details
- Route progress bar
- Total stops for the day

**Quick Action Buttons**:
- View Full Schedule
- Start Navigation (to next location)
- View Collection History
- Report Issue
- Clock In/Out (attendance)

**Today's Route & Actionable Picks Section**:
- **Route Card Display**:
  - Route name
  - Number of stops
  - Start and end locations
  - Status (Not Started, In Progress, Completed)
  - "Start Route" button
  
- **Actionable Picks List**:
  - Individual requests assigned
  - Priority indicators
  - Location and time
  - Client contact
  - Special instructions preview
  - Quick actions: Accept, Reject, Navigate

**Map Overview**:
- Today's route visualization
- Current location marker
- Completed stops (green)
- Pending stops (blue)
- Current destination (red)

**Attendance Logs**:
- Auto records attendance display after logs in
- Auto records attendance display after logs out
- Today's duration tracker

**Performance Summary**:
- Collections completed this week
- Average completion time
- Client rating average

### 6.2 Collection Schedule

**Calendar View**:
- Monthly calendar display
- Color-coded schedule indicators:
  - Blue: Assigned regular schedule
  - Green: Confirmed by collector
  - Yellow: Pending confirmation
  - Orange: In progress
  - Gray: Completed
  - Red: Declined
- Click date to view details
- Filter by status

**Schedule Details Modal** (when date clicked):
- Route name and description
- Collection type (Regular/One-time)
- Start time and end time
- Number of stops
- **Mapbox Route Display**:
  - Full route visualization
  - Stop markers with numbers (Stop 1, Stop 2, etc.)
  - Location names and addresses
  - Turn-by-turn directions button
- Special instructions
- Contact person details
- Required equipment list

**Schedule Actions**:
- **Confirm Schedule**: Accept assignment
  - Confirmation message sent to staff
  - Added to personal calendar
  - Notification activated
  
- **Decline Schedule**: Reject assignment
  - Reason selection required:
    - Not available that day
    - Schedule conflict
    - Area unfamiliar
    - Health reasons
    - Other (text field)
  - System auto-assigned to the next available collector on duty
  - Staff and next assigned collector notified immediately
  
- **Complete Collection**: Mark stop as done
  - Completion timestamp recorded
  - Notes about collection
  - Next stop automatically highlighted

**Regular Schedules Tab**:
- Recurring schedule list
- Weekly/monthly patterns
- Assigned routes display
- Upcoming occurrences
- Schedule modifications alerts

**Collection History Tab**:
- Past completed collections table
- Date, location, duration
- Client feedback received
- Issues reported


**Schedule Notifications**:
- Reminder 24 hours before
- Reminder 1 hour before
- New schedule assignment alert
- Schedule modification alert
- Cancellation notice

**Filters & Search**:
- Status filter (All, Upcoming, Completed, Declined)
- Date range selector

### 6.3 Pickup Request Management

**Request Overview Cards**:
- Pending Acceptance (awaiting collector response)
- Accepted by Me (confirmed requests)
- In Progress (currently servicing)
- Completed Today
- Declined

**Request Assignment Notification**:
- Push notification when assigned
- Request summary in notification
- Quick accept/decline buttons
- Detailed view link

**Assigned Requests Table**:
- **Columns**:
  - Request ID
  - Client Name & Contact (clickable to call)
  - Location/Barangay
  - Priority Level (badge)
  - Scheduled Date & Time
  - Status
  - Actions

**Request Details Modal**:
- Complete client information
- Priority level and urgency
- Special instructions
- Alternative contact numbers
- Staff notes (if any)

**Collector Actions**:

1. **Accept Request**:
   - Confirms availability
   - Status updates to "Accepted by Collector"
   - Client receives notification with collector details:
     - Collector name
     - Contact number
   - Staff notified of acceptance
   - Request added to personal queue

2. **Decline Request**:
   - Reason selection modal:
     - Already at capacity
     - Outside service area
     - Schedule conflict
     - Vehicle/equipment issue
     - Health reasons
     - Other (specify)
   - Request auto-assigned to the available collectors on duty
   - Reassignment logic activates:
     - System finds next available collector
     - Auto-notifies next collector
     - If no collectors available, staff alerted
   - Decline logged for performance review

3. **Start Service** (for accepted requests):
   - "On the Way" status update

4. **At Location** status:
   - "Arrived at Location" button
   - Arrival timestamp recorded
   - Client notified
   - Begin collection process
   
5. **Complete Request**:
   - "Mark as Complete" button
   - Completion triggers:
     - Status updates to "Completed"
     - Client receives completion notification
     - Feedback request sent to client
     - Staff receives completion report
     - Performance metrics updated

**Request Filters**:
- Status (Pending, Accepted, In Progress, Completed, Declined)
- Priority level
- Date range
- Barangay/area
- Search by client name or request ID

**Request History**:
- All past requests handled
- Client feedback received

### 6.4 Feedback Review

**Feedback Overview**:
- Total feedback received
- Average rating (overall)
- Rating breakdown by category
- Recent feedback (last 10)

**Feedback Display**:
- Client name (or anonymous)
- Service date and request ID
- Rating categories with stars:
  - Overall Service
- Written comments
- Date submitted

**Feedback Analytics**:
- Rating trends over time (line graph)

### 6.5 Activities and Announcements

**Announcement Display**:
- Filtered to show announcements targeting collectors
- Priority announcements pinned at top
- Unread count badge

**Announcement Categories**:
- System updates
- Service changes
- Training opportunities
- Safety alerts
- Recognition and achievements
- Community activities/events
- Policy updates

**Event Participation**:
- Tree planting activities
- Clean-up drives
- Training sessions
- Team building events
- Registration/RSVP options
- Event details and schedules
- Location and requirements

**Announcement Details**:
- Full content view
- Attached images/documents
- Related links
- Acknowledgment checkbox (for important notices)
- Save for later option

**Notification Preferences**:
- Enable/disable email notifications
- Enable/disable SMS alerts
- Choose announcement types to receive
- Notification frequency settings

### 6.6 Profile & Settings

**Personal Information**:
- View/edit basic details
- Update contact numbers
- Emergency contact information
- Address update
- Profile photo upload
- Collector ID/badge number

**Attendance Records**:
- Today's login/logout status
- Current shift duration
- Weekly attendance summary
- Monthly attendance history
- Total hours worked
- Attendance calendar view

**Performance Dashboard**:
- Collections completed (daily/weekly/monthly)
- Average rating from clients
- Customer feedback summary

**Account Security**:
- Change password
- Enable two-factor authentication
- View login history
- Active sessions management
- Security questions

**Notification Settings**:
- Push notifications toggle
- Email notifications toggle


**Logout**:
- Automatic clock-out reminder (if not clocked out)
- Session end confirmation

---

## 7. System-Wide Features

### 7.1 Notifications System

**Notification Types**:
- Request status updates
- Schedule assignments
- Payment confirmations
- Feedback received
- System announcements
- Emergency alerts
- Reminders

**Notification Center**:
- Unified inbox for all notifications
- Unread count badge
- Filter by type and date
- Mark as read/unread
- Archive old notifications
- Clear all option
- Search functionality


### 7.2 Real-Time Updates

**Live Features**:
- Request status changes
- Collector location tracking
- Schedule modifications
- Payment verification
- New announcements

**Auto-Refresh**:
- Dashboard auto-updates
- Table data refresh intervals
- Map location updates
- Notification polling

### 7.3 Search & Filter System

**Global Search** (available in navigation bar):
- Search across all modules
- Recent searches saved
- Search suggestions
- Quick filters
- Advanced search options

**Module-Specific Filters**:
- Status filters
- Date range selectors
- Category filters
- Priority filters
- User/role filters
- Custom filter combinations
- Save filter presets

### 7.4 Data Export & Reporting

**Export Options** (across all tables):
- PDF (formatted documents)
- Excel (with formulas)
- CSV (raw data)
- Print view
- Custom column selection


### 7.5 Mobile Responsiveness

**Responsive Design**:
- Mobile-first approach
- Tablet optimization
- Desktop full features
- Touch-friendly interfaces


### 7.6 Security Features

**Data Protection**:
- Encrypted data transmission (HTTPS)
- Encrypted passwords (hashing)
- Secure file uploads
- SQL injection prevention
- XSS protection
- CSRF tokens

**Access Control**:
- Role-based permissions
- Feature-level restrictions
- Data-level restrictions
- Session management
- Automatic logout

---

## 8. Technical Specifications

### 8.1 Technology Stack

**Framework**:
- Next.js (React-based full-stack framework)

**Styling & UI Components**:
- Tailwind CSS (utility-first CSS framework)
- shadcn/ui (accessible, customizable component library)

**Backend & Database**:
- Supabase (PostgreSQL database, authentication, real-time subscriptions, storage)

**Additional Services**:
- Mapbox GL JS / Mapbox API (mapping, geocoding, and route visualization)

### 8.2 Data Validation Rules

**Input Validation**:
- Email format verification
- Phone number format (Philippine format)
- Password complexity enforcement
- File type and size restrictions
- Date and time validation
- Required field checks
- Character limits enforcement

---

## 9. 10-Day Development Plan

This section outlines a structured 10-day development plan for implementing the Waste Collection Management System. Each day focuses on specific modules and features, with detailed tasks available in separate files.

### Development Timeline Overview

| Day | Focus Area | Key Deliverables |
|-----|------------|------------------|
| [Day 1](./day1.md) | Project Setup & Foundation | Next.js project, Supabase config, base UI components |
| [Day 2](./day2.md) | Authentication System | Login, Registration, Email Verification, Password Recovery |
| [Day 3](./day3.md) | Database Schema & Core Models | PostgreSQL tables, RLS policies, seed data |
| [Day 4](./day4.md) | Client Features (Part 1) | Dashboard, Collection Schedule, Request Service |
| [Day 5](./day5.md) | Client Features (Part 2) | Payment Monitoring, Feedback, Announcements, Profile |
| [Day 6](./day6.md) | Staff Features (Part 1) | Dashboard, User Management, Waste Collection Management |
| [Day 7](./day7.md) | Staff Features (Part 2) | Schedule Management, Announcements, Feedback, Payments |
| [Day 8](./day8.md) | Admin & Collector Features | Admin Dashboard, Reports, Collector Dashboard & Schedule |
| [Day 9](./day9.md) | Collector Features & Integrations | Pickup Requests, Mapbox Integration, Real-time Updates |
| [Day 10](./day10.md) | Testing, Optimization & Deployment | Unit/Integration Tests, Performance, Security, Deployment |

### Technology Stack Summary

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Maps**: Mapbox GL JS / Mapbox API
- **Deployment**: Vercel (recommended)

### Development Principles

1. **Mobile-First Design**: All interfaces designed for mobile responsiveness first
2. **Role-Based Access Control**: Strict permission enforcement across all features
3. **Real-Time Updates**: Leveraging Supabase Realtime for live notifications
4. **Security First**: Input validation, CSRF protection, secure authentication
5. **Modular Architecture**: Reusable components and clean code structure

### Quick Links to Daily Plans

- 📁 [Day 1 - Project Setup & Foundation](./day1.md)
- 🔐 [Day 2 - Authentication System](./day2.md)
- 🗄️ [Day 3 - Database Schema & Core Models](./day3.md)
- 👤 [Day 4 - Client Features Part 1](./day4.md)
- 💳 [Day 5 - Client Features Part 2](./day5.md)
- 👨‍💼 [Day 6 - Staff Features Part 1](./day6.md)
- 📅 [Day 7 - Staff Features Part 2](./day7.md)
- 🔑 [Day 8 - Admin & Collector Features](./day8.md)
- 🗺️ [Day 9 - Collector Features & Integrations](./day9.md)
- 🚀 [Day 10 - Testing & Deployment](./day10.md)

---

*End of Enhanced System Features Documentation*