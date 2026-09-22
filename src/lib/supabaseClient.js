import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jkplxvmfcjxobwmigibm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGx4dm1mY2p4b2J3bWlnaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODI0NTksImV4cCI6MjEwMzU1ODQ1OX0.1TrjIRzY2hGgBFgrVnJdaUziU3OwpOP_FIWcCrS-kgI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
