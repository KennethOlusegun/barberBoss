import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Linking,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
// ADICIONADO: SafeAreaView para garantir o topo correto
import { SafeAreaView } from "react-native-safe-area-context";
// ADICIONADO: TopBar e FabButton para consistência visual com AppointmentsList
import { SideMenu, TopBar, FabButton } from "../../components/common/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usersService, Client } from "../../api/usersService";
import {
  appointmentsService,
  Appointment,
} from "../../api/appointmentsService";
// ADICIONADO: Cores globais
import { COLORS, SIZES } from "../../constants/colors";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

// Importamos os tipos do seu AppNavigator para corrigir o erro
import { MainStackParamList } from "../../navigation/AppNavigator";

// Mock de Histórico
const MOCK_HISTORY = [
  {
    id: "101",
    service: "Corte + Barba",
    date: "20/12/2025",
    price: "R$ 55,00",
  },
  { id: "102", service: "Corte Social", date: "10/11/2025", price: "R$ 35,00" },
];

// Tipagem da navegação
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const ClientsManagementScreen: React.FC = () => {
  // Agora o useNavigation sabe quais telas existem
  const navigation = useNavigation<NavigationProp>();

  // SideMenu state
  const [menuVisible, setMenuVisible] = useState(false);

  // Estados da Lista
  const [searchText, setSearchText] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Modais
  const [formVisible, setFormVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientHistory, setClientHistory] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Estados do Formulário
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Buscar clientes
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getClients(searchText);
      setClients(data);
      setFilteredClients(data);
    } catch (e: any) {
      setError("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtro local
  useEffect(() => {
    if (searchText === "") {
      setFilteredClients(clients);
    } else {
      setFilteredClients(
        clients.filter(
          (c) =>
            c.name.toLowerCase().includes(searchText.toLowerCase()) ||
            c.phone.includes(searchText),
        ),
      );
    }
  }, [searchText, clients]);

  const handleCall = (phoneNumber: string) =>
    Linking.openURL(`tel:${phoneNumber}`);

  const handleSaveClient = async () => {
    if (!name || !phone) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && selectedClient) {
        await usersService.updateClient(selectedClient.id, { name, phone });
      } else {
        await usersService.createClient({ name, phone });
      }
      await fetchClients();
      closeForm();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (client?: Client) => {
    if (client) {
      setIsEditing(true);
      setSelectedClient(client);
      setName(client.name);
      setPhone(client.phone);
    } else {
      setIsEditing(false);
      setSelectedClient(null);
      setName("");
      setPhone("");
    }
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setSelectedClient(null);
  };

  const openHistory = async (client: Client) => {
    setSelectedClient(client);
    setLoadingHistory(true);
    setHistoryVisible(true);
    try {
      const res = await appointmentsService.getAll({ userId: client.id });
      setClientHistory(res.data);
    } catch (e) {
      setClientHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderClientItem = ({ item }: { item: Client }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openHistory(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardPhone}>{item.phone}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleCall(item.phone)}
          style={styles.iconButton}
        >
          <Ionicons name="call-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => openForm(item)}
          style={[styles.iconButton, { marginLeft: 8 }]}
        >
          <Ionicons name="create-outline" size={20} color="#F59E0B" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            Alert.alert("Excluir", "Deseja remover este cliente?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                  setLoading(true);
                  try {
                    await usersService.deleteClient(item.id);
                    await fetchClients();
                  } catch (e: any) {
                    Alert.alert("Erro", e?.message || "Erro ao excluir");
                  } finally {
                    setLoading(false);
                  }
                },
              },
            ]);
          }}
          style={[styles.iconButton, { marginLeft: 8 }]}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    // MUDANÇA: Usando SafeAreaView e COLORS para fundo correto
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER PADRONIZADO (Igual AppointmentsList) */}
      <TopBar
        onMenuPress={() => setMenuVisible(true)}
        onBellPress={() => {}} // Ações opcionais
        onProfilePress={() => {}}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={(label) => {
          setMenuVisible(false);
          if (!navigateFromMenu(label, navigation)) {
            // fallback ou alerta opcional
          }
        }}
      />

      <View style={{ flex: 1 }}>
        {/* Lista */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Carregando...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            renderItem={renderClientItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum cliente encontrado</Text>
              </View>
            }
          />
        )}
      </View>

      {/* MUDANÇA: FAB Padronizado */}
      <FabButton onPress={() => openForm()} />

      {/* Modais (Form e Histórico) */}
      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </Text>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Carlos Silva"
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Ex: 83 99999-9999"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveClient}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={historyVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: "60%" }]}>
            <View style={styles.historyHeader}>
              <Text style={styles.modalTitle}>
                Histórico: {selectedClient?.name}
              </Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
              {loadingHistory ? (
                <Text style={styles.emptyText}>Carregando histórico...</Text>
              ) : clientHistory.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum agendamento encontrado
                </Text>
              ) : (
                clientHistory.map((hist) => (
                  <View key={hist.id} style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyService}>
                        {hist.service?.name || "Serviço"}
                      </Text>
                      <Text style={styles.historyDate}>
                        {hist.startsAt
                          ? new Date(hist.startsAt).toLocaleDateString()
                          : "-"}
                      </Text>
                    </View>
                    <Text style={styles.historyPrice}>
                      {hist.status === "COMPLETED"
                        ? "Concluído"
                        : hist.status === "CANCELED"
                          ? "Cancelado"
                          : hist.status}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Usando as cores globais (se disponíveis no seu constants/colors)
  // Se não, mantemos os hexadecimais como fallback
  safeArea: { flex: 1, backgroundColor: COLORS?.background || "#111827" },

  // Header custom removido (substituído por TopBar)

  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#F9FAFB" },
  cardPhone: { fontSize: 14, color: "#9CA3AF" },
  iconButton: { padding: 8, backgroundColor: "#253045", borderRadius: 8 },
  emptyContainer: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "#6B7280", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "#1F2937", borderRadius: 16, padding: 20 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F9FAFB",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { color: "#9CA3AF", marginBottom: 6, fontSize: 14 },
  input: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    color: "#F9FAFB",
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  cancelButtonText: { color: "#FFF", fontWeight: "600" },
  saveButton: {
    flex: 1,
    padding: 14,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  saveButtonText: { color: "#FFF", fontWeight: "600" },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  historyService: { color: "#F9FAFB", fontSize: 16, fontWeight: "500" },
  historyDate: { color: "#9CA3AF", fontSize: 12 },
  historyPrice: { color: "#34D399", fontWeight: "bold" },
});

export default ClientsManagementScreen;
