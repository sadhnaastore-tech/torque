// NOTE: Do NOT import 'react-native-url-polyfill/auto' — React Native 0.81 has native URL support
// and the polyfill breaks it, causing network request crashes.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Hardcoded for production builds — env vars are NOT available inside APKs
const supabaseUrl = 'https://xqvvkqdlsuejlxdnmjnk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxdnZrcWRsc3Vlamx4ZG5tam5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDc1NjQsImV4cCI6MjA5MzYyMzU2NH0.z93h4eA57nO960ud6ZJoK0IJnTaPFgM7gDuKfvjvKOA';

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
