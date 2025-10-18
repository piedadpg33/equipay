import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The AuthProvider should handle the session automatically
        // This is just a fallback page while the OAuth process completes
        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/signin');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 20 }}>Completing sign in...</Text>
    </View>
  );
}