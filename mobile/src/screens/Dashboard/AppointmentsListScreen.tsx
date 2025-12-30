// src/screens/Dashboard/AppointmentsListScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import {
  appointmentsService,
  Appointment,
  AppointmentStatus,
} from "../../api/appointmentsService";
import { COLORS, SIZES, SHADOWS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { SideMenu, TopBar, FabButton } from "../../components/common/SideMenu";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: COLORS.warning,
  CONFIRMED: COLORS.success,
  CANCELED: COLORS.danger,
  COMPLETED: COLORS.info,
  NO_SHOW: COLORS.secondaryTint,
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não compareceu",
};

type RootStackParamList = {
  AppointmentsList: undefined;
  CreateAppointment: { appointmentId?: string } | undefined;
  FinanceSummary: undefined;
  ClientsManagement: undefined;
  TeamManagement: undefined;
  ServicesList: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AppointmentsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let params: Record<string, any> = {};
      if (user?.role === "CLIENT" && user?.id) params.userId = user.id;
      else if (user?.role === "BARBER" && user?.id) params.barberId = user.id;

      const res = await appointmentsService.getAll(params);
      setAppointments(res.data);
    } catch (err: any) {
      setError("Erro ao carregar agendamentos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Excluir Agendamento",
      "Tem certeza que deseja excluir este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await appointmentsService.delete(id);
              fetchAppointments();
            } catch {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ],
    );
  };

  // ✅ NOVA FUNÇÃO: Alternar entre Concluído e Confirmado
  const handleToggleComplete = (item: Appointment) => {
    const isCompleted = item.status === "COMPLETED";
    const newStatus: AppointmentStatus = isCompleted
      ? "CONFIRMED"
      : "COMPLETED";
    const actionLabel = isCompleted ? "Reabrir" : "Concluir";
    const confirmMsg = isCompleted
      ? 'Deseja reabrir este agendamento? Ele voltará para "Confirmado".'
      : "Deseja marcar como concluído? Isso irá gerar os registros financeiros.";

    Alert.alert(`${actionLabel} Agendamento`, confirmMsg, [
      { text: "Cancelar", style: "cancel" },
      {
        text: actionLabel,
        onPress: async () => {
          try {
            setLoading(true);
            await appointmentsService.update(item.id, { status: newStatus });
            fetchAppointments(); // Atualiza a lista para refletir a mudança
          } catch (err) {
            Alert.alert(
              "Erro",
              `Não foi possível ${actionLabel.toLowerCase()} o agendamento.`,
            );
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getClientName = (item: Appointment): string => {
    if (item.clientName) return item.clientName;
    if ((item as any).user?.name) return (item as any).user.name;
    return "-";
  };

  const renderItem = ({ item }: { item: Appointment }) => {
    const showClient = user?.role !== "CLIENT";
    const showBarber = user?.role === "CLIENT";
    const isCompleted = item.status === "COMPLETED";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.serviceName}>
            {item.service?.name || "Serviço"}
          </Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: STATUS_COLORS[item.status] },
            ]}
          >
            <Text style={styles.badgeText}>
              {STATUS_LABELS[item.status] || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.date}>
            {dayjs(item.startsAt).format("DD/MM/YYYY [às] HH:mm")}
          </Text>
        </View>

        {showClient && (
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.label}>
              Cliente: <Text style={styles.value}>{getClientName(item)}</Text>
            </Text>
          </View>
        )}

        {showBarber && item.barber && (
          <View style={styles.infoRow}>
            <Ionicons
              name="cut-outline"
              size={16}
              color={COLORS.textSecondary}
            />
            <Text style={styles.label}>
              Barbeiro: <Text style={styles.value}>{item.barber.name}</Text>
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {/* ✅ BOTÃO NOVO: Concluir / Reabrir */}
          {user?.role !== "CLIENT" && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isCompleted
                    ? COLORS.warning
                    : COLORS.success,
                  marginRight: 4,
                },
              ]}
              onPress={() => handleToggleComplete(item)}
            >
              <Ionicons
                name={
                  isCompleted ? "refresh-outline" : "checkmark-done-outline"
                }
                size={18}
                color={COLORS.white_pure}
              />
              <Text
                style={[
                  styles.actionText,
                  { color: COLORS.white_pure, fontSize: 12 },
                ]}
              >
                {isCompleted ? "Reabrir" : "Concluir"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate("CreateAppointment", {
                appointmentId: item.id,
              })
            }
          >
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.actionText, { fontSize: 12 }]}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
            <Text
              style={[styles.actionText, styles.deleteText, { fontSize: 12 }]}
            >
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const filteredAppointments = appointments.filter((item) => {
    const client = getClientName(item).toLowerCase();
    const service = (item.service?.name || "").toLowerCase();
    return (
      client.includes(search.toLowerCase()) ||
      service.includes(search.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        onMenuPress={() => setMenuVisible(true)}
        onBellPress={() => {}}
        onProfilePress={() => {}}
        searchValue={search}
        onSearchChange={setSearch}
      />
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={(label) => {
          setMenuVisible(false);
          if (!navigateFromMenu(label, navigation)) {
            // fallback
          }
        }}
      />
      <View style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={COLORS.danger}
            />
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={fetchAppointments}
            >
              <Text style={styles.retryText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAppointments.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.empty}>Nenhum agendamento encontrado.</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para criar um novo agendamento
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
            contentContainerStyle={{ padding: SIZES.md }}
          />
        )}
      </View>
      <FabButton onPress={() => navigation.navigate("CreateAppointment")} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.lg,
    gap: SIZES.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    marginTop: SIZES.sm,
  },
  error: {
    color: COLORS.danger,
    fontSize: SIZES.body,
    textAlign: "center",
    fontWeight: "600",
    marginTop: SIZES.sm,
  },
  retryBtn: {
    marginTop: SIZES.md,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  retryText: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  empty: {
    color: COLORS.textSecondary,
    fontSize: SIZES.h6,
    fontWeight: "600",
    textAlign: "center",
    marginTop: SIZES.md,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: SIZES.xs,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusXLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.overlayLight,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  serviceName: {
    color: COLORS.textPrimary,
    fontSize: SIZES.h6,
    fontWeight: "700",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  badge: {
    borderRadius: SIZES.borderRadiusLarge,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.overlayLight,
    marginLeft: SIZES.sm,
  },
  badgeText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.tiny,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Oswald_700Bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.sm,
    gap: SIZES.sm,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    fontFamily: "Inter_400Regular",
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.body,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  value: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    marginTop: SIZES.md,
    gap: SIZES.sm,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4, // Reduzi o gap para caber 3 botões
    paddingVertical: SIZES.sm,
    paddingHorizontal: 8, // Ajuste para telas menores
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.overlayLight,
    flex: 1,
    justifyContent: "center",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.body,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  deleteText: {
    color: COLORS.danger,
  },
});

export default AppointmentsListScreen;
