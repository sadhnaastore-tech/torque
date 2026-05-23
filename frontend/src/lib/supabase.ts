// NOTE: Do NOT import 'react-native-url-polyfill/auto' — React Native 0.81 has native URL support
// and the polyfill breaks it, causing network request crashes.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Hardcoded for production builds — env vars are NOT available inside APKs
const supabaseUrl = 'https://zdbudsvjmjbtgfurlmvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkYnVkc3ZqbWpidGdmdXJsbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MzgwOTMsImV4cCI6MjA5MzAxNDA5M30.MmpP9_jrZCrEzskLV85z4hKsznSlYbVeb6lRt3nSREM';

const isWeb = Platform.OS === 'web';
const storage = isWeb ? (typeof window !== 'undefined' ? window.localStorage : undefined) : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});
