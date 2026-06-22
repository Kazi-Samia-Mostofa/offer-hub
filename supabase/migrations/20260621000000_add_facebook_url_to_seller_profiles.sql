-- Add facebook_url column to seller_profiles table
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
