// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";

// Auth Screens - IMPORTS CORRIGIDOS
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";
// ResetPasswordScreen removido - não existe (funcionalidade está dentro do ForgotPasswordScreen)

// Dashboard Screens - NOVAS TELAS
import AppointmentsListScreen from "../screens/Dashboard/AppointmentsListScreen";
import CreateAppointmentScreen from "../screens/Dashboard/CreateAppointmentScreen";
import FinanceSummaryScreen from "../screens/Dashboard/FinanceSummaryScreen";

// ============================================================================
// TYPES
// ============================================================================
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  AppointmentsList: undefined;
  CreateAppointment: { appointmentId?: string } | undefined;
  FinanceSummary: undefined; // ⬅️ NOVA TELA
  // Outras telas principais aqui
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
        animation: "slide_from_right",
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />
    </AuthStack.Navigator>
  );
};

// ============================================================================
// MAIN NAVIGATOR (Atualizado)
// ============================================================================
const MainNavigator: React.FC = () => {
  const { signOut, user } = useAuth();

  return (
    <MainStack.Navigator
      initialRouteName="AppointmentsList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        name="AppointmentsList"
        component={AppointmentsListScreen}
      />
      <MainStack.Screen
        name="CreateAppointment"
        component={CreateAppointmentScreen}
      />
      <MainStack.Screen
        name="FinanceSummary"
        component={FinanceSummaryScreen}
        options={{ headerShown: false }}
      />
      {/* Outras telas principais aqui */}
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
        animation: "fade",
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.midnight_navy,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.grey_steel,
  },

  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.midnight_navy,
    padding: 24,
  },

  placeholderTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white_pure,
    marginBottom: 16,
    textAlign: "center",
  },

  placeholderSubtext: {
    fontSize: 16,
    color: COLORS.grey_steel,
    textAlign: "center",
    marginBottom: 8,
  },

  placeholderUserName: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.royal_blue,
    textAlign: "center",
    marginBottom: 4,
  },

  placeholderUserEmail: {
    fontSize: 14,
    color: COLORS.grey_steel,
    textAlign: "center",
    marginBottom: 32,
  },

  placeholderInfo: {
    fontSize: 14,
    color: COLORS.grey_steel,
    textAlign: "center",
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
    fontWeight: "600",
  },
});
