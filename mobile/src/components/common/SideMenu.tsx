import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.82;
const ANIMATION_DURATION = 300;

type MenuItemIcon =
  | "grid-view"
  | "content-cut"
  | "attach-money"
  | "groups"
  | "supervisor-account";

interface MenuItem {
  icon: MenuItemIcon;
  label: string;
}

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (label: string) => void;
}

// Interface auxiliar para corrigir o erro de avatarUrl
interface AuthUserWithAvatar {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string; // Campo opcional
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { user, signOut } = useAuth();
  // Cast seguro para usar avatarUrl sem erro
  const safeUser = user as unknown as AuthUserWithAvatar | null;

  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Estado para controlar se o componente deve estar na árvore de renderização
  const [shouldRender, setShouldRender] = useState(visible);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [{ icon: "grid-view", label: "Início" }];

    if (user) {
      if (user.role === "CLIENT") {
        items.push({ icon: "attach-money", label: "Meus Gastos" });
      }
      if (user.role !== "CLIENT") {
        items.push({ icon: "content-cut", label: "Serviços" });
      }
      if (user.role === "BARBER") {
        items.push({ icon: "groups", label: "Clientes" });
      }
      if (user.role === "ADMIN") {
        items.push({ icon: "groups", label: "Clientes" });
        items.push({ icon: "supervisor-account", label: "Equipe" });
        items.push({ icon: "attach-money", label: "Comissões" });
      }
      if (user.role !== "CLIENT") {
        items.push({ icon: "attach-money", label: "Financeiro" });
      }
    }
    return items;
  }, [user]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true); // Monta o componente antes de animar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setShouldRender(false); // Desmonta apenas ao terminar a animação
        }
      });
    }
  }, [visible]);

  const handleProfilePress = () => {
    onClose();
    navigation.navigate("Profile");
  };

  const handleLogout = () => {
    onClose();
    signOut();
  };

  // Se não deve renderizar (fechado e animação concluída), retorna null
  if (!shouldRender) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.profileHeader}
          activeOpacity={0.7}
          onPress={handleProfilePress}
        >
          <View style={styles.avatarContainer}>
            {safeUser?.avatarUrl ? (
              <Image
                source={{ uri: safeUser.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {safeUser?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {safeUser?.name || "Bem-vindo"}
            </Text>
            <Text style={styles.userRole}>
              {safeUser?.role === "ADMIN"
                ? "Administrador"
                : safeUser?.role === "BARBER"
                  ? "Barbeiro"
                  : "Cliente"}
            </Text>
            <Text style={styles.editLink}>Ver perfil</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.grey_steel}
          />
        </TouchableOpacity>

        <View style={styles.divider} />

        <ScrollView
          style={styles.menuList}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((item) => {
            // Corrigir navegação do botão 'Meus Gastos' para CLIENT
            const handlePress = () => {
              // Só tratar o caso especial do CLIENT para "Meus Gastos"
              if (user?.role === "CLIENT" && item.label === "Meus Gastos") {
                onClose();
                navigation.navigate("ClientSpending");
                return;
              }
              if (item.label === "Comissões") {
                onClose();
                navigation.navigate("CommissionPayout");
                return;
              }
              onSelect(item.label);
            };
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={handlePress}
              >
                <View style={styles.iconWrapper}>
                  <MaterialIcons name={item.icon} size={22} color="#D1D5DB" />
                </View>
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={[styles.iconWrapper, styles.logoutIconWrapper]}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// ... Restante do arquivo (TopBar, FabButton e Styles) permanece igual ...
export const TopBar: React.FC<any> = ({
  onMenuPress,
  onBellPress,
  onProfilePress,
  searchValue,
  onSearchChange,
}) => (
  <View style={styles.topBar}>
    <TouchableOpacity onPress={onMenuPress} style={styles.iconBtn}>
      <Ionicons name="menu" size={28} color="#FFF" />
    </TouchableOpacity>
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#9CA3AF" />
      <TextInput
        style={styles.input}
        placeholder="Buscar..."
        placeholderTextColor="#6B7280"
        value={searchValue}
        onChangeText={onSearchChange}
      />
    </View>
    <TouchableOpacity onPress={onBellPress} style={styles.iconBtn}>
      <Ionicons name="notifications-outline" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
);

export const FabButton: React.FC<any> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.8}>
    <Ionicons name="add" size={32} color="#FFF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
  },
  menuContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: "#111827",
    zIndex: 2,
    borderRightWidth: 1,
    borderRightColor: "#1F2937",
    paddingHorizontal: 20,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1F2937",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },
  avatarText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  userInfo: { flex: 1 },
  userName: { color: "#F9FAFB", fontSize: 16, fontWeight: "bold" },
  userRole: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  editLink: { color: "#3B82F6", fontSize: 12, marginTop: 2, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#1F2937", marginBottom: 10 },
  menuList: { flex: 1 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemText: { color: "#D1D5DB", fontSize: 16, fontWeight: "500" },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoutIconWrapper: { backgroundColor: "rgba(239, 68, 68, 0.1)" },
  logoutText: { color: "#EF4444", fontSize: 16, fontWeight: "600" },
  versionText: { color: "#4B5563", fontSize: 12, textAlign: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  iconBtn: { padding: 4 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    marginHorizontal: 12,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: "#374151",
  },
  input: { flex: 1, color: "#FFF", marginLeft: 8 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#3B82F6",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
  },
});
