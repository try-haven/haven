-- Add contact info and apply URL to listings_nyc table
ALTER TABLE listings_nyc
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS apply_url TEXT;
