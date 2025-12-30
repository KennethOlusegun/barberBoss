// src/navigation/menuNavigationMap.ts
import { MainStackParamList } from "./AppNavigator";

// Mapeamento de labels do menu para rotas do MainStack
export const menuNavigationMap: Record<string, keyof MainStackParamList> = {
  início: "AppointmentsList",
  dashboard: "AppointmentsList",
  agendamentos: "AppointmentsList",
  serviços: "ServicesList",
  servicos: "ServicesList",
  clientes: "ClientsManagement",
  equipe: "TeamManagement",
  financeiro: "FinanceSummary",
};

// Função utilitária para navegar a partir do label
export function navigateFromMenu(label: string, navigation: any) {
  const normalized = label.trim().toLowerCase();
  const route = menuNavigationMap[normalized];
  if (route) {
    navigation.navigate(route);
    return true;
  }
  return false;
}
