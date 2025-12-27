// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

// Auth Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { RegisterScreen } from '../screens/Auth/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/Auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/Auth/ResetPasswordScreen';

// ============================================================================
// TYPES
// ============================================================================
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type MainStackParamList = {
  Home: undefined;
  // Adicione suas outras telas principais aqui
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// ============================================================================
// AUTH NAVIGATOR
// ============================================================================
const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// ============================================================================
// MAIN NAVIGATOR (Placeholder)
// ============================================================================
// TODO: Substituir pelo seu MainNavigator real com TabNavigator, etc.
const MainNavigator: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="Home">
        {() => (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>
              ðŸŽ‰ Bem-vindo ao BarberBoss!
            </Text>
            <Text style={styles.placeholderSubtext}>
              VocÃª estÃ¡ autenticado como:
            </Text>
            <Text style={styles.placeholderUserName}>
              {user?.name || 'UsuÃ¡rio'}
            </Text>
            <Text style={styles.placeholderUserEmail}>
              {user?.email}
            </Text>
            <Text style={styles.placeholderInfo}>
              Substitua este componente pelo seu MainNavigator real
            </Text>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={signOut}
              activeOpacity={0.7}
            >
              <Text style={styles.signOutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
};

// ============================================================================
// ROOT NAVIGATOR
// ============================================================================
const RootNavigator: React.FC = () => {
  const { isSignedIn, isLoading } = useAuth();

  // Loading state enquanto restaura o token
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.royal_blue} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isSignedIn ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

// ============================================================================
// APP NAVIGATOR (Main Export)
// ============================================================================
export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.midnight_navy,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.grey_steel,
  },
  
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.midnight_navy,
    padding: 24,
  },
  
  placeholderTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white_pure,
    marginBottom: 16,
    textAlign: 'center',
  },

  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.grey_steel,
    textAlign: 'center',
    marginBottom: 8,
  },

  placeholderUserName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.royal_blue,
    textAlign: 'center',
    marginBottom: 4,
  },

  placeholderUserEmail: {
    fontSize: 14,
    color: COLORS.grey_steel,
    textAlign: 'center',
    marginBottom: 32,
  },
  
  placeholderInfo: {
    fontSize: 14,
    color: COLORS.grey_steel,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
  },
  
  signOutButton: {
    backgroundColor: COLORS.royal_blue,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  
  signOutButtonText: {
    color: COLORS.white_pure,
    fontSize: 16,
    fontWeight: '600',
  },
});