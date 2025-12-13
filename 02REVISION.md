# System-Wide Feature Revision

**Important Note**  
Please thoroughly review the following files before implementing any changes:  
- `system-overview.md`  
- `day1.md` through `day10.md`  
- All `.sql` migration files in the `/supabase/migrations/` directory  

This ensures correct table/column names, existing workflows, theme colors, and business logic.

- **Attendance Report Issue**  
  Currently displays `0` and `[object Object]` with no valid data shown.  
  → Fix data rendering and object serialization in the Attendance Report.

- **Auto Clock-Out for Collectors**  
  If a collector forgets to clock out and the time reaches 12:00 AM (midnight), automatically log them out and record a note:  
  _"Automatic logout – forgot to clock out"_ (or similar professional message).

- **Admin Reports Section**  
  - Remove the "Quick Analytics Overview" card/section.  
  - Replace it with a Reports History table.  
  - Remove the separate "Report History" tab (now consolidated into the new table).

- **Collection Reports Error**  
  Error shown: `"column collection_requests.waste_type does not exist"` when generating reports.  
  → Read queries to use correct column names based on migrations files.

- **System Log Page**  
  Completely remove the System Log page from the admin panel, sidebar, and mobile navigation.

- **Sidebar & Mobile Navigation Icons**  
  Replace all icons with correct, consistent, and properly sized ones. Improve overall design alignment with the existing design system.

- **Admin Settings – Maintenance Tab**  
  Remove the entire "Maintenance" tab (maintenance mode will now be managed via announcements).

- **Announcement Creation – Event Type & Modal Redesign**  
  - When "Event" is selected as announcement type, enable image upload functionality.  
  - Fully redesign the Create Announcement modal to match the theme colors defined in `DAY1.md`. Use existing modals (e.g., Create Schedule, Edit User) as layout and styling references.

- **Maintenance Announcement Enhancements**  
  For maintenance-type announcements, add the following required fields:  
  - Start date & time  
  - End date & time  
  Remove the "Enable system maintenance mode alert" checkbox.  
  → System must **automatically block all non-admin logins** during the defined maintenance window (including immediate/same-day urgent maintenance).

- **Accept/Decline Feature for Collectors**  
  Add Accept/Decline buttons on both:  
  - Collection Schedule page  
  - Collection Request page  
  Behavior:  
  - On **Decline**: Automatically reassign the job to the next available clocked-in collector.  
  - If no collector is currently clocked in: Show modal — _"There is no available collector at this time."_

- **Staff Create Schedule – Collector Selection Rule**  
  When staff creates or edits a schedule, **only clocked-in collectors** must be selectable. Hide or disable collectors who are not currently clocked in.

-**Maintenance Mode Login Restriction**
 - Strictly prevent all **non-admin users** from logging in during an active maintenance window (including urgent/same-day maintenance).
 - If a non-admin user is already logged in when the maintenance window starts:
  - Immediately log them out (invalidate session).
  - Redirect to the login page and display a **full-screen maintenance modal** with the following message:

    > **System Maintenance in Progress**  
    > The system is currently undergoing scheduled maintenance.  
    > Access will resume on: **[End Date & Time]**  
    > Thank you for your patience.

- Admins must remain fully functional and able to log in during maintenance.
- Modal design must follow the theme colors and styling defined in `DAY1.md` (use existing full-screen modal components as reference).
- Implementation note: Add a middleware or update existing auth middleware to check for active maintenance announcements on every authenticated request.

- **Verification / Additional Requirement**  
  Ensure the decline → auto-reassign logic works correctly for **both**:  
  - Ad-hoc collection requests  
  - Pre-scheduled collections  
  → Declined jobs must immediately pass to another available, clocked-in collector.