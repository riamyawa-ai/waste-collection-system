-- Drop the maintenance_allowed_roles column as we now use target_audience (inverted blocklist) logic
ALTER TABLE announcements DROP COLUMN IF EXISTS maintenance_allowed_roles;
