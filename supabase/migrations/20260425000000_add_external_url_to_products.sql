-- Add external_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS external_url TEXT;
