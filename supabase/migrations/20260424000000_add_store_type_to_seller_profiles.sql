-- Add store_type column to seller_profiles table
ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS store_type TEXT DEFAULT 'online';
