import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.90.1/+esm";

const SUPABASE_URL = "https://rxsodulayohkhqglpadu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c29kdWxheW9oa2hxZ2xwYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTk2OTAsImV4cCI6MjA5MDAzNTY5MH0.Kq9QZ4eaae84-qMoHxZMs-hJtjyxJ32k5unHJ0ZFpq0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});
