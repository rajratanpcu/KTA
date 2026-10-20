-- V7__activate_admin_account.sql
-- Ensure the administrator account exists, is active, and has the correct password.
-- Password hash corresponds to: AdminPassword123!

UPDATE users
SET password = '$2a$10$/5EqKJEoe1EM10uNDIOZTexgAYKxZH/o5m4OQPrjEhe7B/LvaqnxW',
    active = true,
    role = 'ADMIN'
WHERE username = 'admin';

INSERT INTO users (username, password, full_name, email, role, active)
SELECT 'admin', '$2a$10$/5EqKJEoe1EM10uNDIOZTexgAYKxZH/o5m4OQPrjEhe7B/LvaqnxW', 'KTA Administrator', 'admin@kta.local', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
