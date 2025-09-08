-- Add the missing selected_male_user_id column to users table
-- This column is needed for tracking which male user a female user has selected

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS selected_male_user_id UUID REFERENCES users(id);

-- Add comment for documentation
COMMENT ON COLUMN users.selected_male_user_id IS 'References the male user that this female user has selected';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'selected_male_user_id';
