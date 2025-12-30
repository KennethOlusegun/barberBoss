import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { TopBar, SideMenu, FabButton } from "../../components/common/SideMenu";
import { servicesService, ServiceItem } from "../../api/servicesService";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "../../navigation/AppNavigator";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const ServicesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  // Removido products: só existe a aba de serviços
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // GUARD: Bloqueia Clientes
  if (user?.role === "CLIENT") {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <Ionicons name="lock-closed-outline" size={64} color={COLORS.danger} />
        <Text style={styles.accessDeniedText}>Acesso Restrito</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await servicesService.getAll();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os serviços.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadServices();
    }, []),
  );

  useEffect(() => {
    if (!searchText) {
      setFilteredServices(services);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredServices(
        services.filter((s) => s.name.toLowerCase().includes(lower)),
      );
    }
  }, [searchText, services]);

  const renderServiceItem = ({ item }: { item: ServiceItem }) => {
    // Garante que price é número
    let price = item.price;
    if (typeof price !== "number") {
      price = Number(price);
    }
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("ServiceForm", { serviceId: item.id })
        }
      >
        <View style={styles.cardLeft}>
          <MaterialCommunityIcons
            name="drag-horizontal"
            size={24}
            color={COLORS.grey_steel}
            style={{ marginRight: 12, opacity: 0.5 }}
          />
          <View>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.serviceDuration}>
              {item.durationMin} min • {item.category || "Geral"}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.servicePrice}>
            {item.priceType === "range" ? "A partir " : ""}R${" "}
            {Number.isFinite(price) ? price.toFixed(2) : "-"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.grey_steel}
          />
        </View>
      </TouchableOpacity>
    );
  };

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
          if (!navigateFromMenu(label, navigation)) {
            // fallback ou alerta opcional
          }
        }}
      />

      {/* Apenas a aba de serviços visível */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity style={[styles.segmentBtn, styles.segmentBtnActive]}>
          <Text style={[styles.segmentText, styles.segmentTextActive]}>
            Serviços
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => item.id}
            renderItem={renderServiceItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          />
        )}
      </View>
      <FabButton onPress={() => navigation.navigate("ServiceForm")} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  segmentContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    backgroundColor: "#1F2937",
  },
  segmentBtn: { flex: 1, paddingVertical: 16, alignItems: "center" },
  segmentBtnActive: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  segmentText: {
    color: COLORS.grey_steel,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  segmentTextActive: { color: COLORS.primary },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardLeft: { flexDirection: "row", alignItems: "center" },
  serviceName: { color: "#F9FAFB", fontSize: 16, fontWeight: "bold" },
  serviceDuration: { color: COLORS.grey_steel, fontSize: 14, marginTop: 4 },
  cardRight: { flexDirection: "row", alignItems: "center" },
  servicePrice: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginRight: 8,
    fontSize: 16,
  },
  emptyText: { color: COLORS.grey_steel, marginTop: 16 },
  accessDeniedText: {
    color: COLORS.danger,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: "#374151",
    padding: 12,
    borderRadius: 8,
  },
  backBtnText: { color: "#FFF" },
});
export default ServicesListScreen;
