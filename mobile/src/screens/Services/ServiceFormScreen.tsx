import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { servicesService } from "../../api/servicesService";
import { MainStackParamList } from "../../navigation/AppNavigator";

// ✅ CORREÇÃO 1: Formatador estilo "ATM" (Recebe "100" -> Retorna "R$ 1,00")
function formatBRL(value: string): string {
  if (!value) return "R$ 0,00";
  // Considera o valor como centavos
  const numberValue = parseInt(value, 10) / 100;
  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const COLOR_OPTIONS = [
  { name: "Azul", hex: "#3b82f6" },
  { name: "Vermelho", hex: "#ef4444" },
  { name: "Verde", hex: "#22c55e" },
];
const CATEGORY_OPTIONS = ["Cabelo", "Barba", "Combo", "Outros"];
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

type ScreenRouteProp = RouteProp<MainStackParamList, "ServiceForm">;

const ServiceFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ScreenRouteProp>();
  const serviceId = route.params?.serviceId;
  const isEdit = !!serviceId;

  const [name, setName] = useState("");
  // ✅ O estado 'price' agora armazena apenas DÍGITOS (centavos). Ex: "3500" para R$ 35,00
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "range">("fixed");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Cabelo");
  const [color, setColor] = useState("#3b82f6");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState<
    "none" | "color" | "category" | "duration"
  >("none");

  useEffect(() => {
    if (isEdit && serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    setLoading(true);
    try {
      const data = await servicesService.getById(serviceId!);
      setName(data.name);
      // ✅ CORREÇÃO 2: Converter float (35.00) para string de centavos ("3500") ao carregar
      setPrice((data.price * 100).toFixed(0));
      setPriceType(data.priceType);
      setDuration(data.durationMin);
      setCategory(data.category || "Outros");
      setColor(data.color || "#3b82f6");
      setDescription(data.description || "");
    } catch (error) {
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert("Atenção", "Nome e Preço são obrigatórios");
      return;
    }
    setSaving(true);

    // ✅ CORREÇÃO 3: Converter string de centavos ("3500") para float (35.00) antes de salvar
    const priceFloat = parseInt(price, 10) / 100;

    const payload = {
      name,
      price: priceFloat,
      priceType,
      durationMin: duration,
      category,
      color,
      description,
      active: true,
    };

    try {
      if (isEdit && serviceId) {
        await servicesService.update(serviceId, payload);
      } else {
        await servicesService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Excluir", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await servicesService.delete(serviceId!);
          navigation.goBack();
        },
      },
    ]);
  };

  const renderSelector = (
    label: string,
    value: string | number,
    onPress: () => void,
    icon?: any,
  ) => (
    <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text style={{ color: "#FFF", fontSize: 16 }}>{value}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#6B7280"
          style={{ marginLeft: "auto" }}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "EDITAR" : "NOVO"} SERVIÇO
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>SALVAR</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>NOME</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Corte"
            placeholderTextColor="#6B7280"
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}
            onPress={() =>
              setPriceType((p) => (p === "fixed" ? "range" : "fixed"))
            }
          >
            <Text style={styles.label}>TIPO</Text>
            <Text style={{ color: "#FFF" }}>
              {priceType === "fixed" ? "Fixo" : "A partir"}
            </Text>
          </TouchableOpacity>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>PREÇO (R$)</Text>
            <TextInput
              style={styles.input}
              // ✅ Exibe formatado (R$ 35,00) mas o estado é puro (3500)
              value={formatBRL(price)}
              onChangeText={(text) => {
                // ✅ Aceita apenas NÚMEROS. O usuário digita "3", "5", "0", "0" -> R$ 35,00
                const valid = text.replace(/\D/g, "");
                setPrice(valid);
              }}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              placeholderTextColor="#6B7280"
              maxLength={17}
            />
          </View>
        </View>

        {renderSelector("DURAÇÃO", `${duration} min`, () =>
          setModalVisible("duration"),
        )}
        {renderSelector("CATEGORIA", category, () =>
          setModalVisible("category"),
        )}
        {renderSelector(
          "COR",
          "",
          () => setModalVisible("color"),
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: color,
              marginRight: 8,
            }}
          />,
        )}

        {isEdit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteText}>DELETAR</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={modalVisible !== "none"} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible("none")}
        >
          <View style={styles.modalContent}>
            {modalVisible === "duration" &&
              DURATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalItem}
                  onPress={() => {
                    setDuration(opt);
                    setModalVisible("none");
                  }}
                >
                  <Text style={styles.modalItemText}>{opt} min</Text>
                </TouchableOpacity>
              ))}
            {modalVisible === "category" &&
              CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(opt);
                    setModalVisible("none");
                  }}
                >
                  <Text style={styles.modalItemText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            {modalVisible === "color" &&
              COLOR_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.hex}
                  style={styles.modalItem}
                  onPress={() => {
                    setColor(opt.hex);
                    setModalVisible("none");
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: opt.hex,
                      marginRight: 12,
                    }}
                  />
                  <Text style={styles.modalItemText}>{opt.name}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111827" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1F2937",
  },
  headerTitle: { color: "#FFF", fontWeight: "bold" },
  saveText: { color: COLORS.primary, fontWeight: "bold" },
  inputContainer: {
    marginBottom: 16,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  input: { color: "#FFF", fontSize: 16 },
  deleteBtn: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: "center",
  },
  deleteText: { color: COLORS.danger, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: { backgroundColor: "#1F2937", borderRadius: 12, padding: 16 },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  modalItemText: { color: "#FFF", fontSize: 16 },
});
export default ServiceFormScreen;
