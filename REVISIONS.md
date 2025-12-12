## System-Wide Features

- When clicking the notification bell or specific notifications, redirect to the notifications page.
- Implement the notifications page as a modal view.
- For new user account creation and first login, display "Welcome" instead of "Welcome Back!".
- Create an alert for system maintenance mode and prevent selected user types from logging in.
- Implement an announcement page for admins. Ensure both admins and staff can create announcements, attach photos, and include an effective timestamp.
- Notifications can be sent to users across roles:
  - Collectors receive ratings upon request completion.
  - Clients receive notifications for request completion, staff-created schedules, etc.
  - Staff and admins can view all notifications.
- Total revenue cards for admins and staff should only display data for completed requests.
- Make all modal designs for all users consistent

## Client

- In feedback history, the collector name is not displaying.

## Collector

- Add a table for completed requests.
- Ensure the collector calendar uses the same design as the client's calendar.
- Allow collectors to view their attendance history.

## Staff

- Redesign the create schedule modal to be simple and consistent: a large modal divided into two sections (left for inputs, right for map display). Retain all POI functionality.
- Fix "Revenue by Barangay" in the Payment page (data not displaying).
- Client column name displays as "unknown".
- In the Feedback page:
  - Rating column does not display stars even when feedback exists.
  - Comments column shows "no comment" even when comments exist.
- Error: "invalid input syntax for type uuid: none" when creating a schedule.

## Admin

- Create an announcement page with the same features as staff (including image posting).
- Implement a functional admin reports feature, viewable and exportable as PDF. (Just let me know if any new packages need to be installed for PDF report generation.)
- Make admin settings fully operational.

**Note:** Reference the `system-overview.md` file, `DAY1.md` through `DAY9.md` files, and all migration SQL files in supabase/migrations directory for accurate data fetching, as schema changes have been made.