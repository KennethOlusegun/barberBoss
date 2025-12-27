import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { COLORS } from '../constants/colors';

// Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isSignedIn, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.midnight_navy }}>
        <ActivityIndicator size="large" color={COLORS.royal_blue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        {!isSignedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen 
            name="Home" 
            component={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.midnight_navy }}>
                <Text style={{ color: COLORS.white_pure, fontSize: 24 }}>
                  Home Screen (TODO)
                </Text>
              </View>
            )} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};