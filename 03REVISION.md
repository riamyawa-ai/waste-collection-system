# AI-Ready Task Prompt: Bug Fixes and Feature Requests

## Objective
- Implement the following **bug fixes** and **feature enhancements**.
- Ensure all changes are consistent with existing **code standards**, **database rules**, and **design guidelines**.
- Follow a **step-by-step approach**, prioritizing **bug fixes first**.

---

## Bug Fixes

- **Collector Schedule Decline Error**
  - Fix the issue where declining an assigned schedule triggers the error:  
    *"new row violates row-level security policy for table `collection_schedules`"*.
  - Ensure proper handling of **Supabase Row-Level Security (RLS)** when a collector declines a schedule.

- **Login Form Label During Maintenance Mode**
  - When the **target audience** is in **maintenance mode**, no label or message is currently displayed in the login form container.
  - Add an appropriate **label or message** to clearly inform users.

- **Announcements Not Displaying**
  - Announcements are not appearing on the **target audience announcement page**.
  - Fix the rendering logic to ensure announcements display correctly for the intended audience.

---

## Feature Enhancements

- **Display Collection Duration on Maps and Calendars**
  - Display the **collection duration** on:
    - Collector map
    - Client map
    - Collector schedule calendar
    - Client schedule calendar
  - *Example:*
    - Start Date: **December 22**
    - End Date: **December 26**
    - The calendar must highlight and cover **all dates from December 22 through December 26**, inclusive, with a clear label indicating the collection period.

- **Announcement Management Permissions**
  - Allow both **Staff** and **Admin** roles to create announcements.
  - Ensure both roles can **view announcement details**.

- **Reports Page for Staff**
  - Add a **Reports page for Staff** users.
  - The Staff Reports page must mirror the **Admin Reports page**:
    - Same layout
    - Same data
    - Same functionality

- **Schedule Status Labels and Collector Selection Rules**
  - When a **Staff** member creates a schedule:
    - Set the initial status label to **`Pending`** (awaiting collector acceptance).
    - Automatically update the status to:
      - **Accepted** when the collector accepts
      - **Declined** when the collector declines
  - In the **Staff schedule creation form**:
    - When selecting a **primary or backup collector**:
      - Only collectors who are **currently clocked in** must be selectable.
      - Collectors who are **not clocked in** must be disabled or hidden from selection.

---

## Important Guidelines for Implementation

- **Database & SQL**
  - Review and verify all SQL files in the `/supabase/migrations/` directory.
  - Use these files as references for:
    - Schema updates
    - RLS policies
    - Proper data handling

- **Design & UI Consistency**
  - Read all Markdown files in the `/markdown/` directory for reference.
  - **No hardcoded components**:
    - All colors, icons, typography, spacing, and styles must strictly follow the **DAY1 markdown** specifications.

- **General Rules**

  - Ensure all UI updates are **responsive** and **accessible**.
  - Thoroughly test edge cases, especially:
    - Role-based permissions
    - Schedule status transitions
  - Maintain **clean**, **readable**, and **maintainable** code following existing patterns.

---

## Execution Notes

- Prioritize **bug fixes first**, then proceed with feature enhancements.
- Clearly document:
  - Any required database migrations
  - Potential impacts on existing functionality
  - Assumptions or constraints encountered during implementation
