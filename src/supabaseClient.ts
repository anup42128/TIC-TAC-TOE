import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sqflrsfubtycwgizptej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZmxyc2Z1YnR5Y3dnaXpwdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzc2NjcsImV4cCI6MjA4ODYxMzY2N30.Dcaxdtanof7sRPC21urFxqtwuiJUfl--8tybatfdBEE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
