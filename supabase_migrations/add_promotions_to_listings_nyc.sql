-- Add promotions JSONB column to listings_nyc
-- Stores array of Promotion objects: { leaseTermMonths, type, value, label? }
ALTER TABLE listings_nyc ADD COLUMN IF NOT EXISTS promotions JSONB DEFAULT '[]'::jsonb;
