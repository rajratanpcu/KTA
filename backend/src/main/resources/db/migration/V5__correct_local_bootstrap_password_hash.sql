-- Correct the local-only bootstrap hash documented for development.
-- Rotate or disable this account before any shared deployment.
UPDATE users
SET password = '$2a$10$XldbJwm4zgEnIgA4Z0iXE.Ya5ifgiSq3sjOvZkoD0qGSLjL9vYOlW'
WHERE username = 'admin'
  AND email = 'admin@kta.local';