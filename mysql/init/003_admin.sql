USE fashion_store;

INSERT INTO accounts (email, password_hash, full_name, account_type, status)
VALUES (
  'admin@yody.demo',
  '$2b$12$5dKU7Wh//IdcbwHVtRJHbuBn34BD1c4QRmLSsnjVPbu55B9OoVBwa',
  'YODY Admin',
  'ADMIN',
  'ACTIVE'
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  full_name = VALUES(full_name),
  account_type = 'ADMIN',
  status = 'ACTIVE';
