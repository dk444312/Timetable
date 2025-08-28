import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Hardcoded Supabase credentials as requested.
const supabaseUrl = "https://rnrzihbdcuhljoabkwde.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucnppaGJkY3VobGpvYWJrd2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNjUyNzYsImV4cCI6MjA3MTk0MTI3Nn0.Il9sgL5umi9b-YHHn0W5G7d_m09kKeDCuwDeWI2tnt0";

// Create and export the Supabase client instance.
// The app will handle the null case if credentials are not provided.
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;
