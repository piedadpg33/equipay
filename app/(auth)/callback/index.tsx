
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';

export default function CallbackScreen() {
  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();


  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 24, fontSize: 20, fontWeight: 'bold', color: '#007AFF' }}>
          ¡Processing your login!
        </Text>
        <Text style={{ marginTop: 8, fontSize: 16, color: '#555', textAlign: 'center', maxWidth: 260 }}>
          Please wait while we authenticate you and take you to the app...
        </Text>
      </Animated.View>
    </View>
  );
}