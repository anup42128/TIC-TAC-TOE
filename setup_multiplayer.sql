-- 1. DROP the old table if it exists
DROP TABLE IF EXISTS rooms;

-- 2. CREATE the new rooms table with custom ID support
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, playing, finished
  board JSONB NOT NULL DEFAULT '["null", "null", "null", "null", "null", "null", "null", "null", "null"]'::jsonb,
  is_x_next BOOLEAN NOT NULL DEFAULT true,
  player1_id TEXT, -- Custom username ID
  player1_name TEXT,
  player2_id TEXT, -- Custom username ID
  player2_name TEXT,
  winner TEXT,
  last_activity TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE index for fast code lookups
CREATE INDEX idx_rooms_code ON rooms(code) WHERE status != 'finished';

-- 4. ENABLE Realtime for the table
-- Note: You might need to check if the publication already exists in your specific Supabase setup
-- but this is the standard command:
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- 5. DISABLE Row Level Security (RLS) 
-- This fixes the "violates row-level security policy" error for custom auth systems
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
