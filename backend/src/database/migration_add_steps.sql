-- Migration: Add steps column to health_records
-- Run this in Supabase SQL Editor if the table already exists

ALTER TABLE health_records ADD COLUMN IF NOT EXISTS steps INTEGER;
