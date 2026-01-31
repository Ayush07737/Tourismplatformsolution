-- Create trips table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by TEXT NOT NULL,
  start_location JSONB NOT NULL,
  destination JSONB NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  budget JSONB NOT NULL,
  trip_type TEXT NOT NULL,
  max_travelers INTEGER NOT NULL,
  preferences TEXT[] DEFAULT '{}',
  gender_preference TEXT DEFAULT 'any',
  visibility TEXT DEFAULT 'public',
  description TEXT,
  current_travelers INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to public trips
CREATE POLICY "Public trips are viewable by everyone" ON trips
  FOR SELECT USING (visibility = 'public');

-- Allow authenticated users to insert their own trips
CREATE POLICY "Users can insert their own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

-- Allow users to update their own trips
CREATE POLICY "Users can update their own trips" ON trips
  FOR UPDATE USING (auth.uid()::text = created_by);

-- Allow users to delete their own trips
CREATE POLICY "Users can delete their own trips" ON trips
  FOR DELETE USING (auth.uid()::text = created_by);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trips_created_by ON trips(created_by);
CREATE INDEX IF NOT EXISTS idx_trips_visibility ON trips(visibility);
CREATE INDEX IF NOT EXISTS idx_trips_destination_city ON trips((destination->>'city'));