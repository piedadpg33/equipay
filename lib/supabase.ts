import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a custom storage adapter that works on both web and native
const customStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're running in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        return Promise.resolve(localStorage.getItem(key));
      }
      // If no localStorage available (SSR), return null
      return Promise.resolve(null);
    } else {
      // Use AsyncStorage for native platforms
      return AsyncStorage.getItem(key);
    }
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      // Check if we're running in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
      return Promise.resolve();
    } else {
      // Use AsyncStorage for native platforms
      return AsyncStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      // Check if we're running in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
      return Promise.resolve();
    } else {
      // Use AsyncStorage for native platforms
      return AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true, // Automatically refreshes the token
    persistSession: true, // Persists the session to storage
    detectSessionInUrl: true // Enable for OAuth flows
  }
});