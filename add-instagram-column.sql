-- Add Instagram column to users table
ALTER TABLE users ADD COLUMN instagram text;

-- Add Instagram index for better performance
CREATE INDEX IF NOT EXISTS idx_users_instagram ON users(instagram);
