-- SQL function to allow users to delete their own auth account
-- Run this in your Supabase SQL Editor

-- Create a function that allows users to delete their own account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete the user from auth.users (requires SECURITY DEFINER to have admin privileges)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION delete_user() IS 'Allows authenticated users to delete their own account from auth.users';
