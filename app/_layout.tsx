import { supabase } from '@/lib/supabase';
import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from "expo-router";
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Header Menu Component
const HeaderMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { nameUser } = useAuth();
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setMenuVisible(false);
    } catch (error) {
      console.error('Error al cerrar sesión: ', error);
    }
  };

  return (
    <>
      <TouchableOpacity 
        onPress={() => setMenuVisible(!menuVisible)} 
        style={{ marginRight: 16, padding: 8 }}
      >
        <Ionicons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {menuVisible && (
        <>
          
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: -100,
              left: -300,
              right: -50,
              bottom: -500,
              backgroundColor: 'transparent',
              zIndex: 1
            }}
            onPress={() => setMenuVisible(false)}
          />
          
          {/* Menu */}
          <View style={{
            position: 'absolute',
            top: 40,
            right: -8,
            backgroundColor: '#fff',
            borderRadius: 8,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            padding: 8,
            minWidth: 150,
            zIndex: 2
          }}>
<Text style={{ 
  paddingVertical: 12, 
  paddingHorizontal: 8, 
  fontSize: 16,
  fontWeight: '500',
  color: '#2c3e50',
  borderBottomWidth: 1,
  borderBottomColor: '#ecf0f1',
  marginBottom: 4
}}>
  {nameUser}
</Text>
            <TouchableOpacity
              onPress={() => {router.push('/wheel'); setMenuVisible(false);}}
              style={{ paddingVertical: 12, paddingHorizontal: 8 }}
            >
              <Text style={{ fontSize: 16 }}>Custom Wheel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSignOut} 
              style={{ paddingVertical: 12, paddingHorizontal: 8 }}
            >
              <Text style={{ fontSize: 16 }}>Log Out</Text>
            </TouchableOpacity>


            
          </View>
        </>
      )}
    </>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontSize: 22,
            fontWeight: 'bold',
          },
          headerTintColor: '#000',
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Home',
            headerShown: true,
            headerRight: () => <HeaderMenu />
          }} 
        />
        <Stack.Screen 
          name="wheel" 
          options={{ 
            title: 'Custom Wheel',
            headerShown: true
          }} 
        />

        <Stack.Screen 
          name="(auth)" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}

