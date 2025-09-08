-- Add selected_male_user_id column to users table for admin panel functionality

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS selected_male_user_id UUID;

-- Add comment to explain the column
COMMENT ON COLUMN users.selected_male_user_id IS 'Stores the ID of the male user selected by this female user in the admin panel';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_selected_male_user_id ON users(selected_male_user_id);
