-- Add is_offline column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_offline BOOLEAN DEFAULT false;
