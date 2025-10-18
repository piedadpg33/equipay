// sign up, sign in, sign out, name validation
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export interface SignUpData {
  name: string;
  email: string;
  password?: string;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
}

export const authService = {
  /**
   * Check if a username already exists in the database
   */
  async checkNameExists(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('user_name')
      .eq('user_name', name)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking name:', error);
      throw error;
    }

    return !!data;
  },

  /**
   * Sign up a new user with email and password
   */
  async signUp(userData: SignUpData): Promise<SignUpResult> {
    try {
      // Check if name is already taken
      const nameExists = await this.checkNameExists(userData.name);
      if (nameExists) {

        return {
          success: false,
          error: 'Name is already taken'
        };
      }

      // Create user account
      const { error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password||'',
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Sign in the user
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password||'',
      });

      if (loginError) {
        throw loginError;
      }

      // Get user ID from session
      const userId = sessionData.user?.identities?.[0]?.user_id;
      
      if (!userId) {
        throw new Error('No user ID found after authentication');
      }

      // Insert user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({ 
          user_name: userData.name, 
          email: userData.email, 
          user_id: userId 
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ha ocurrido un error'
      };
    }
  },

  async signUpWithGoogle(userData: SignUpData, session: any): Promise<SignUpResult> {
    try {
      // Check if name is already taken
      const nameExists = await this.checkNameExists(userData.name);
      if (nameExists) {

        return {
          success: false,
          error: 'Name is already taken'
        };
      }
      // Get user ID from session
      
      
      const userId = session?.user.id;
      if (!userId) {
        throw new Error('No user ID found after authentication');
      }

      // Insert user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({ 
          user_name: userData.name, 
          email: userData.email, 
          user_id: userId 
        })
        .select();

      if (insertError) {
        throw insertError;
      }

      router.replace('/');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ha ocurrido un error'
      };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<SignUpResult> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión'
      };
    }
  },

  /**
   * Sign in with Google
   */
  async signWithGoogle(): Promise<SignUpResult> {
    try {
      if (Platform.OS === 'web') {
        // Web version
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) throw error;
        return { success: true };
      } else {
        // Mobile version (Android/iOS)
        const redirectUrl = Linking.createURL('auth/callback'); //PROBLEM PROBLEM
        //const redirectUrl = 'equipay://auth/callback';
        console.log('Redirect URL:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          console.error('OAuth error:', error);
          throw error;
        }

        // For mobile, we need to open the OAuth URL in a browser
        if (data?.url) {
          console.log('Opening OAuth URL:', data.url);
          
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl,
            {
              showInRecents: true,
            }
          );

          console.log('WebBrowser result:', result);

          if (result.type === 'success') {
            const url = result.url;
            console.log('OAuth success, handling URL:', url);
            // The AuthProvider will handle the deep link
            return { success: true };
          } else if (result.type === 'cancel') {
            return {
              success: false,
              error: 'Authentication was cancelled'
            };
          } else {
            return {
              success: false,
              error: 'Authentication failed'
            };
          }
        }
        return { success: true };
      }

    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión con Google'
      };
    }
  },


  /**
   * Sign out the current user
   */
  async signOut(): Promise<SignUpResult> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión'
      };
    }
  }
};

