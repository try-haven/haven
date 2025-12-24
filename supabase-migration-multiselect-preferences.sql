-- Migration: Convert bedroom/bathroom ranges and rating to multi-select arrays
-- Run this SQL in your Supabase SQL Editor

-- Add new array columns for bedrooms and bathrooms if they don't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bedrooms NUMERIC[];

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC[];

-- Add rating range columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rating_min NUMERIC;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rating_max NUMERIC;

-- Migrate existing min/max data to arrays (if old columns exist)
-- If user had bedrooms_min=1 and bedrooms_max=3, create array [1,2,3]
DO $$
BEGIN
  -- Check if old columns exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bedrooms_min') THEN
    -- Migrate bedrooms
    UPDATE profiles
    SET bedrooms = (
      SELECT ARRAY(
        SELECT generate_series(bedrooms_min::integer, bedrooms_max::integer)
      )
    )
    WHERE bedrooms_min IS NOT NULL AND bedrooms_max IS NOT NULL AND bedrooms IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bathrooms_min') THEN
    -- Migrate bathrooms (handle decimals)
    UPDATE profiles
    SET bathrooms = ARRAY[bathrooms_min::numeric]
    WHERE bathrooms_min IS NOT NULL AND bathrooms IS NULL;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='min_rating') THEN
    -- Migrate rating
    UPDATE profiles
    SET rating_min = min_rating,
        rating_max = 5
    WHERE min_rating IS NOT NULL AND rating_min IS NULL;
  END IF;
END $$;

-- Drop old columns after migration
ALTER TABLE profiles
DROP COLUMN IF EXISTS bedrooms_min,
DROP COLUMN IF EXISTS bedrooms_max,
DROP COLUMN IF EXISTS bathrooms_min,
DROP COLUMN IF EXISTS bathrooms_max,
DROP COLUMN IF EXISTS min_rating;

-- Add comments
COMMENT ON COLUMN profiles.bedrooms IS 'Selected bedroom options (multi-select array)';
COMMENT ON COLUMN profiles.bathrooms IS 'Selected bathroom options (multi-select array)';
COMMENT ON COLUMN profiles.rating_min IS 'Minimum rating in range (0-5 scale)';
COMMENT ON COLUMN profiles.rating_max IS 'Maximum rating in range (0-5 scale)';
