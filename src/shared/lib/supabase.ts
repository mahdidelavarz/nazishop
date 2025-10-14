
     import { createClient } from '@supabase/supabase-js';

     // Define environment variables for TypeScript
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
     const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

     // Initialize Supabase client
     export const supabase = createClient(supabaseUrl, supabaseAnonKey);