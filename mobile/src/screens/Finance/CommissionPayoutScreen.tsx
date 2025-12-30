// Marcar agendamento individual como pago
const handleMarkAsPaid = async (appointmentId: string, barberId: string) => {
  setLoading(true);
  try {
    await appointmentsService.update(appointmentId, { commissionPaid: true });
    setPending((prev) => ({
      ...prev,
      [barberId]: prev[barberId].filter((ap) => ap.id !== appointmentId),
    }));
    Alert.alert("Sucesso", "Comissão marcada como paga!");
  } catch (err) {
    Alert.alert("Erro", "Não foi possível marcar como paga.");
  } finally {
    setLoading(false);
  }
};
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Importante para layout consistente
import { useNavigation } from "@react-navigation/native";

// ✅ Componentes de UI Padronizados
import { SideMenu, TopBar } from "../../components/common/SideMenu";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

import {
  appointmentsService,
  Barber,
  Appointment,
} from "../../api/appointmentsService";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors"; // ✅ Usando constantes de cores

const CommissionPayoutScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // Estados de UI
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState(""); // ✅ Estado para busca no TopBar

  // Estados de Dados
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [pending, setPending] = useState<Record<string, Appointment[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const barbersList = await appointmentsService.getBarbers();
        setBarbers(barbersList);

        const pendings: Record<string, Appointment[]> = {};

        await Promise.all(
          barbersList.map(async (barber) => {
            try {
              const res = await appointmentsService.getAll({
                barberId: barber.id,
                status: "COMPLETED",
                commissionPaid: false as boolean,
              });
              pendings[barber.id] = res.data;
            } catch (e) {
              pendings[barber.id] = [];
            }
          }),
        );

        setPending(pendings);
      } catch (err) {
        Alert.alert("Erro", "Não foi possível carregar dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayout = async (barberId: string) => {
    setLoading(true);
    try {
      await appointmentsService.markCommissionsAsPaid(barberId);
      setPending((prev) => ({ ...prev, [barberId]: [] }));
      Alert.alert("Sucesso", "Pagamento registrado!");
    } catch (err) {
      Alert.alert("Erro", "Não foi possível registrar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtro de barbeiros pela busca do TopBar
  const filteredBarbers = barbers.filter((b) =>
    b.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  if (user?.role !== "ADMIN") {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text
          style={{ color: COLORS.danger, fontSize: 18, fontWeight: "bold" }}
        >
          Acesso Restrito ao Admin
        </Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* ✅ TopBar Padronizado */}
      <TopBar
        onMenuPress={() => setMenuVisible(true)}
        onBellPress={() => { }}
        onProfilePress={() => { }}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      {/* ✅ SideMenu Padronizado */}
      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={(label) => {
          setMenuVisible(false);
          navigateFromMenu(label, navigation);
        }}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.pageTitle}>Acerto de Comissões</Text>

        <FlatList
          data={filteredBarbers}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>
              Nenhum barbeiro encontrado.
            </Text>
          }
          renderItem={({ item }) => {
            const saldo = (pending[item.id] || []).reduce(
              (acc, ap) => acc + (Number(ap.commission) || 0),
              0,
            );
            return (
              <View style={styles.barberCard}>
                <TouchableOpacity
                  onPress={() =>
                    setExpanded(expanded === item.id ? null : item.id)
                  }
                >
                  <View style={styles.barberRow}>
                    <Text style={styles.barberName}>{item.name}</Text>
                    <Text
                      style={[
                        styles.saldo,
                        { color: saldo > 0 ? COLORS.success : "#9CA3AF" },
                      ]}
                    >
                      R${" "}
                      {(typeof saldo === "number" && !isNaN(saldo)
                        ? saldo
                        : 0
                      ).toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {expanded === item.id && (
                  <View style={styles.details}>
                    <FlatList
                      data={pending[item.id]}
                      keyExtractor={(ap) => ap.id}
                      renderItem={({ item: ap }) => (
                        <View style={styles.appointmentRow}>
                          <Text style={styles.service} numberOfLines={1}>
                            {ap.serviceName}
                          </Text>
                          <Text style={styles.date}>
                            {ap.startsAt
                              ? new Date(ap.startsAt).toLocaleDateString()
                              : "-"}
                          </Text>
                          <Text style={styles.commission}>
                            R${" "}
                            {(Number(ap.commission) && !isNaN(Number(ap.commission))
                              ? Number(ap.commission)
                              : 0
                            ).toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            style={[styles.payoutBtn, { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6 }]}
                            onPress={() => handleMarkAsPaid(ap.id, item.id)}
                          >
                            <Text style={styles.payoutText}>Marcar como Pago</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.empty}>Nenhum corte pendente.</Text>
                      }
                    />
                    {saldo > 0 && (
                      <TouchableOpacity
                        style={styles.payoutBtn}
                        onPress={() => handlePayout(item.id)}
                      >
                        <Text style={styles.payoutText}>
                          Registrar Pagamento
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background || "#111827", // Fallback se COLORS.background não existir
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 20,
    marginTop: 10,
  },
  barberCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  barberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barberName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saldo: {
    fontWeight: "bold",
    fontSize: 16,
  },
  details: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#374151",
    paddingTop: 12,
  },
  appointmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  service: {
    color: "#D1D5DB",
    flex: 2,
    fontSize: 14,
  },
  date: {
    color: "#9CA3AF",
    flex: 1,
    textAlign: "center",
    fontSize: 12,
  },
  commission: {
    color: COLORS.success || "#10B981",
    flex: 1,
    textAlign: "right",
    fontWeight: "600",
    fontSize: 14,
  },
  payoutBtn: {
    backgroundColor: COLORS.primary || "#3B82F6",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  payoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  empty: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
    fontSize: 14,
  },
  emptyListText: {
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CommissionPayoutScreen;
