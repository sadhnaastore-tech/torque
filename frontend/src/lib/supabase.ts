// NOTE: Do NOT import 'react-native-url-polyfill/auto' — React Native 0.81 has native URL support
// and the polyfill breaks it, causing network request crashes.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Hardcoded for production builds — env vars are NOT available inside APKs
const supabaseUrl = 'https://utlizvsixlkudukkikfh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0bGl6dnNpeGxrdWR1a2tpa2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTU5MjgsImV4cCI6MjA5MjE3MTkyOH0.WAgd1YXY-fkjUDBh-lESHAj7Lye_aCm0sJb8GTua2x0';

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
