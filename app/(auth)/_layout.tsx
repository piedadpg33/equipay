import { Stack } from "expo-router";



export default function AuthLayout() {
  return (

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
        {/* pages without header */}
        <Stack.Screen 
          name="signin/index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="signup/index" 
          options={{ headerShown: false }} 
        />

        {/* pages with header */}
        <Stack.Screen 
          name="newgroup/index" 
          options={{ 
            title: 'New Group',
          }} 
        />

        <Stack.Screen
          name="group/[id]/page"
          options={{
            title: 'Group',
          }}
        />
        
        <Stack.Screen
          name="group/[id]/addExpense"
          options={{
            title: 'Add Expense',
          }}
        />

        <Stack.Screen
          name="registername/index"
          options={{
            title: 'Register Name',
          }}
        />
      </Stack>

  );
}