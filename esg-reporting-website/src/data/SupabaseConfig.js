import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL="https://hjwxdwhmnprhqikthyai.supabase.co"
const SUPABASE_ANON_KEY="sb_publishable_bGP9VLgpOyc9UbI-nFrT4Q_gRhgI4rv"
const supabaseUrl = SUPABASE_URL
const supabaseAnonKey = SUPABASE_ANON_KEY
console.log("URL", supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
