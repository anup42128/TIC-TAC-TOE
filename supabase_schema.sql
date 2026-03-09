-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Note: In a real production app, use Supabase Auth for passwords
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for sign up)
CREATE POLICY "Allow public insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Create policy to allow public select (for login verification)
CREATE POLICY "Allow public select" ON public.profiles
  FOR SELECT USING (true);
