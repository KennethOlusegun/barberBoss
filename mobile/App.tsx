import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import * as SystemUI from "expo-system-ui"; // Importe a nova biblioteca

export default function App() {
  useEffect(() => {
    async function configureSystemUI() {
      if (Platform.OS === "android") {
        // 1. Removemos setPositionAsync e setBackgroundColorAsync (causavam o Warning)

        // 2. Definimos a cor de fundo da "Raiz" do app.
        // Como a barra é transparente (Edge-to-Edge nativo), essa cor aparecerá no fundo.
        await SystemUI.setBackgroundColorAsync("#111827");

        // 3. Mantemos apenas o estilo dos botões (Claro/Escuro) que ainda é útil
        await NavigationBar.setButtonStyleAsync("light");
      }
    }
    configureSystemUI();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      {/* backgroundColor="transparent" é vital para o StatusBar não conflitar também */}
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </AuthProvider>
  );
}
