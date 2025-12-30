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
import { SafeAreaView } from "react-native-safe-area-context";
import { SideMenu, TopBar, FabButton } from "../../components/common/SideMenu";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usersService } from "../../api/usersService";
import {
  appointmentsService,
  Appointment,
} from "../../api/appointmentsService";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { MainStackParamList } from "../../navigation/AppNavigator";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "BARBER";
  status: "active" | "inactive";
}
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const TeamManagementScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [filteredTeam, setFilteredTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [memberHistory, setMemberHistory] = useState<Appointment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"BARBER" | "ADMIN">("BARBER");
  const [isEditing, setIsEditing] = useState(false);

  if (user?.role !== "ADMIN") {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Ionicons name="lock-closed-outline" size={64} color={COLORS.danger} />
        <Text style={{ marginTop: 16, color: COLORS.danger, fontSize: 16 }}>
          Acesso Restrito
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { marginTop: 24, width: 200 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const data = await usersService.getStaff(searchText);
      // Mapeando a resposta para garantir compatibilidade
      const mappedData: TeamMember[] = data.map((d) => ({
        id: d.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        role: d.role,
        status: d.status,
      }));
      setTeam(mappedData);
      setFilteredTeam(mappedData);
    } catch (e) {
      Alert.alert("Erro", "Falha ao carregar equipe");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTeam();
  }, [searchText]);

  const handleCall = (phone: string) => Linking.openURL(`tel:${phone}`);
  const openHistory = async (member: TeamMember) => {
    setSelectedMember(member);
    setLoadingHistory(true);
    setHistoryVisible(true);
    try {
      const res = await appointmentsService.getAll({ barberId: member.id });
      setMemberHistory(res.data);
    } catch (e) {
      setMemberHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };
  const openForm = (member?: TeamMember) => {
    if (member) {
      setIsEditing(true);
      setSelectedMember(member);
      setName(member.name);
      setEmail(member.email);
      setPhone(member.phone);
      setRole(member.role);
    } else {
      setIsEditing(false);
      setSelectedMember(null);
      setName("");
      setEmail("");
      setPhone("");
      setRole("BARBER");
    }
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    try {
      if (isEditing && selectedMember) {
        await usersService.updateStaff(selectedMember.id, {
          name,
          email,
          phone,
          role,
        });
        Alert.alert("Sucesso", "Membro atualizado com sucesso!");
      } else {
        await usersService.createStaff({ name, email, phone, role });
        Alert.alert("Sucesso", "Membro criado com sucesso!");
      }
      setFormVisible(false);
      fetchTeam();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Falha ao salvar membro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    Alert.alert(
      "Excluir membro",
      `Tem certeza que deseja excluir ${member.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await usersService.deleteStaff(member.id);
              Alert.alert("Excluído", "Membro removido com sucesso!");
              fetchTeam();
            } catch (e: any) {
              Alert.alert("Erro", e.message || "Falha ao excluir membro");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };
  const renderMemberItem = ({ item }: { item: TeamMember }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openHistory(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor:
                item.role === "ADMIN" ? COLORS.primary : COLORS.secondaryTint,
            },
          ]}
        >
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSubText}>
            {item.role === "ADMIN" ? "Administrador" : "Barbeiro"}
          </Text>
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
          onPress={() => handleDelete(item)}
          style={[styles.iconButton, { marginLeft: 8 }]}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <TopBar
        onMenuPress={() => setMenuVisible(true)}
        onBellPress={() => {}}
        onProfilePress={() => {}}
        searchValue={searchText}
        onSearchChange={setSearchText}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSelect={(label) => {
          setMenuVisible(false);
          // Lógica simples de navegação baseada no label
          if (label === "Início") navigation.navigate("AppointmentsList");
          else if (label === "Serviços") navigation.navigate("ServicesList");
          else if (label === "Clientes")
            navigation.navigate("ClientsManagement");
          else if (label === "Financeiro")
            navigation.navigate("FinanceSummary");
        }}
        // onAddTeamMember foi REMOVIDO aqui, isso corrige o erro do TypeScript
      />

      <View style={{ flex: 1 }}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.pageTitle}>Gestão de Equipe</Text>
          <Text style={styles.pageSubtitle}>{filteredTeam.length} membros</Text>
        </View>
        <FlatList
          data={filteredTeam}
          keyExtractor={(item) => item.id}
          renderItem={renderMemberItem}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* BOTÃO FLUTUANTE ADICIONADO AQUI */}
      <FabButton onPress={() => openForm()} />

      <Modal visible={formVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isEditing ? "Editar Membro" : "Novo Membro"}
            </Text>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefone"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
            />
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setRole("BARBER")}
                style={[
                  styles.roleButton,
                  role === "BARBER" && styles.roleActive,
                ]}
              >
                <Text style={styles.roleText}>Barbeiro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole("ADMIN")}
                style={[
                  styles.roleButton,
                  role === "ADMIN" && styles.roleActive,
                ]}
              >
                <Text style={styles.roleText}>Admin</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>
                  {isEditing ? "Salvar" : "Criar"}
                </Text>
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
                Produção: {selectedMember?.name}
              </Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
              {loadingHistory ? (
                <Text style={styles.emptyText}>Carregando produção...</Text>
              ) : memberHistory.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhum atendimento realizado.
                </Text>
              ) : (
                memberHistory.map((hist) => (
                  <View key={hist.id} style={styles.historyItem}>
                    <View>
                      <Text style={styles.historyService}>
                        {hist.service?.name || "Serviço"}
                      </Text>
                      <Text style={styles.historyDate}>
                        {new Date(hist.startsAt).toLocaleDateString()} -{" "}
                        {new Date(hist.startsAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.historyPrice}>
                        R$ {hist.price || "0,00"}
                      </Text>
                      <Text
                        style={[
                          styles.historyStatus,
                          {
                            color:
                              hist.status === "CONFIRMED"
                                ? COLORS.success
                                : COLORS.warning,
                          },
                        ]}
                      >
                        {hist.status}
                      </Text>
                    </View>
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
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  headerTitleContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#F9FAFB" },
  pageSubtitle: { fontSize: 14, color: "#9CA3AF" },
  listContent: { padding: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "600", color: "#F9FAFB" },
  cardSubText: { fontSize: 12, color: COLORS.primary, fontWeight: "bold" },
  cardPhone: { fontSize: 14, color: "#9CA3AF" },
  iconButton: { padding: 8, backgroundColor: "#253045", borderRadius: 8 },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  saveButtonText: { color: "#FFF", fontWeight: "600" },
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
  roleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#374151",
    marginHorizontal: 4,
  },
  roleActive: { backgroundColor: COLORS.primary },
  roleText: { color: "#FFF" },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    marginRight: 5,
    borderRadius: 8,
    backgroundColor: "#374151",
    alignItems: "center",
  },
  cancelButtonText: { color: "#FFF", fontWeight: "600" },
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
  historyStatus: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  emptyText: { color: "#6B7280", fontSize: 16, textAlign: "center" },
});
export default TeamManagementScreen;
