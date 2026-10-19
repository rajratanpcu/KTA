-- Disable the known development account. A replacement administrator must be
-- provisioned with ADMIN_USERNAME and ADMIN_PASSWORD at application startup.
UPDATE users
SET active = false
WHERE username = 'admin'
  AND email = 'admin@kta.local';
