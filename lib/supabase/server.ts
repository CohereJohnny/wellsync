import { createClient } from '@supabase/supabase-js'

// Ensure these environment variables are set in your .env.local (or environment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
}

// Create a singleton Supabase client for server-side operations
// Note: This is safe on the server, unlike the client-side singleton issue.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // No need to persist session for server-side operations
    autoRefreshToken: false,
    persistSession: false
  }
})

// You can add server-specific helper functions here if needed 