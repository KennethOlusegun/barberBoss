import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

// ✅ CONFIGURAÇÃO DAYJS FRONTEND
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
dayjs.locale("pt-br");

import {
    appointmentsService,
    CreateAppointmentDTO,
} from "../../api/appointmentsService";
import apiClient from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";
import { SelectModal } from "../../components/common/SelectModal";
import { SideMenu } from "../../components/common/SideMenu";
import { MainStackParamList } from "../../navigation/AppNavigator";
import { navigateFromMenu } from "../../navigation/menuNavigationMap";

interface Service { id: string; name: string; duration?: number; price?: number; }
interface Client { id: string; name: string; email: string; }
interface Barber { id: string; name: string; email: string; }

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type RoutePropType = RouteProp<MainStackParamList, "CreateAppointment">;

const CreateAppointmentScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const [menuVisible, setMenuVisible] = useState(false);
    const route = useRoute<RoutePropType>();
    const { user } = useAuth();

    const appointmentId = route.params?.appointmentId;
    const isEditing = !!appointmentId;
    const isClient = user?.role === "CLIENT";

    const [services, setServices] = useState<Service[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);

    const [selectedClient, setSelectedClient] = useState("");
    const [manualClientName, setManualClientName] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [selectedBarber, setSelectedBarber] = useState("");
    
    // ✅ DATA: Inicializa com a data/hora local do dispositivo
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showBarberModal, setShowBarberModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setFetchingData(true);
            const requests: Promise<any>[] = [apiClient.get("/services")];

            if (isClient) {
                requests.push(apiClient.get("/users", { params: { role: "BARBER", limit: 100 } }));
            } else {
                requests.push(apiClient.get("/users", { params: { role: "CLIENT", limit: 100 } }));
            }

            const responses = await Promise.all(requests);
            setServices(responses[0].data.data || responses[0].data || []);

            if (isClient) {
                setBarbers(responses[1].data.data || responses[1].data || []);
            } else {
                setClients(responses[1].data.data || responses[1].data || []);
            }

            if (isEditing && appointmentId) {
                const data = await appointmentsService.getById(appointmentId);
                setSelectedService(data.serviceId);
                // O Date construtor já converte UTC para Local automaticamente
                setSelectedDate(new Date(data.startsAt));

                if (isClient) {
                    setSelectedBarber(data.barberId || "");
                } else {
                    if (data.userId) setSelectedClient(data.userId);
                    else if (data.clientName) setManualClientName(data.clientName);
                }
            }
        } catch (err) {
            Alert.alert("Erro", "Não foi possível carregar os dados");
        } finally {
            setFetchingData(false);
        }
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === "android") {
            if (pickerMode === "date") setShowDatePicker(false);
            else setShowTimePicker(false);

            if (event.type === "set" && date) {
                if (pickerMode === "date") {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(date.getFullYear());
                    newDate.setMonth(date.getMonth());
                    newDate.setDate(date.getDate());
                    setSelectedDate(newDate);

                    setTimeout(() => {
                        setPickerMode("time");
                        setShowTimePicker(true);
                    }, 500);
                } else {
                    const newDate = new Date(selectedDate);
                    newDate.setHours(date.getHours());
                    newDate.setMinutes(date.getMinutes());
                    setSelectedDate(newDate);
                }
            }
        } else {
            if (date) setSelectedDate(date);
            if (event.type === "dismissed") setShowDatePicker(false);
        }
    };

    const openDateTimePicker = () => {
        if (Platform.OS === "android") {
            setPickerMode("date");
            setShowDatePicker(true);
        } else {
            setShowDatePicker(true);
        }
    };

    const isFormValid = () => {
        if (!selectedService) return false;
        if (isClient && !selectedBarber) return false;
        if (!isClient && !selectedClient && !manualClientName.trim()) return false;
        return true;
    };

    const handleSubmit = async () => {
        if (!isFormValid() || !user) {
            Alert.alert("Atenção", "Preencha todos os campos obrigatórios");
            return;
        }

        try {
            setLoading(true);

            // 🔥 CORREÇÃO DE OURO: Enviar ISO com Offset local
            // Exemplo: "2025-12-31T16:03:00-03:00"
            // O backend NestJS entenderá isso perfeitamente e converterá corretamente.
            const dateWithOffset = dayjs(selectedDate).format(); 

            let payload: Partial<CreateAppointmentDTO> = {
                serviceId: selectedService,
                startsAt: dateWithOffset,
            };

            if (isClient) {
                payload.userId = user.id;
                payload.barberId = selectedBarber;
            } else {
                payload.barberId = user.id;
                if (selectedClient) payload.userId = selectedClient;
                else if (manualClientName.trim()) payload.clientName = manualClientName.trim();
            }

            if (!payload.barberId) {
                Alert.alert("Erro", "Barbeiro não identificado");
                return;
            }

            if (isEditing && appointmentId) {
                await appointmentsService.update(appointmentId, payload);
                Alert.alert("Sucesso", "Agendamento atualizado!", [{ text: "OK", onPress: () => navigation.goBack() }]);
            } else {
                await appointmentsService.create(payload as CreateAppointmentDTO);
                Alert.alert("Sucesso", "Agendamento criado!", [{ text: "OK", onPress: () => navigation.goBack() }]);
            }
        } catch (err: any) {
            console.error("Erro payload:", err);
            Alert.alert("Erro", err?.response?.data?.message || err?.message || "Não foi possível salvar o agendamento");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedServiceName = () => services.find((s) => s.id === selectedService)?.name || "Selecione o serviço...";
    const getSelectedClientName = () => clients.find((c) => c.id === selectedClient)?.name || "Selecione...";
    const getSelectedBarberName = () => barbers.find((b) => b.id === selectedBarber)?.name || "Selecione o barbeiro...";

    if (fetchingData) {
        return (
            <SafeAreaView style={styles.container}>
                 <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onSelect={(l) => { setMenuVisible(false); if (!navigateFromMenu(l, navigation)) {} }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onSelect={(l) => { setMenuVisible(false); if (!navigateFromMenu(l, navigation)) {} }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 12 }}>
                    <Ionicons name="menu" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    {isClient && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Barbeiro <Text style={styles.required}>*</Text></Text>
                            <View style={styles.pickerContainer}>
                                <TouchableOpacity style={styles.selectButton} onPress={() => setShowBarberModal(true)}>
                                    <Text style={[styles.selectButtonText, !selectedBarber && styles.placeholder]}>{getSelectedBarberName()}</Text>
                                    <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {!isClient && (
                        <>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Cliente Cadastrado</Text>
                                <View style={styles.pickerContainer}>
                                    <TouchableOpacity style={[styles.selectButton, !!manualClientName && styles.disabled]} onPress={() => !manualClientName && setShowClientModal(true)} disabled={!!manualClientName}>
                                        <Text style={[styles.selectButtonText, !selectedClient && styles.placeholder]}>{getSelectedClientName()}</Text>
                                        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} /><Text style={styles.dividerText}>OU</Text><View style={styles.dividerLine} />
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Cliente (nome manual)</Text>
                                <TextInput
                                    style={[styles.input, !!selectedClient && styles.disabled]}
                                    value={manualClientName}
                                    onChangeText={(text) => { setManualClientName(text); if (text) setSelectedClient(""); }}
                                    placeholder="Nome do cliente"
                                    placeholderTextColor="#64748b"
                                    editable={!selectedClient}
                                />
                            </View>
                        </>
                    )}

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Serviço <Text style={styles.required}>*</Text></Text>
                        <View style={styles.pickerContainer}>
                            <TouchableOpacity style={styles.selectButton} onPress={() => setShowServiceModal(true)}>
                                <Text style={[styles.selectButtonText, !selectedService && styles.placeholder]}>{getSelectedServiceName()}</Text>
                                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Data e Hora <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity style={styles.dateButton} onPress={openDateTimePicker}>
                            <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                            {/* ✅ Visualmente mostra exatamente o que será enviado */}
                            <Text style={styles.dateButtonText}>{dayjs(selectedDate).format("DD/MM/YYYY [às] HH:mm")}</Text>
                            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showTimePicker && Platform.OS === 'android' && (
                        <DateTimePicker
                            value={selectedDate}
                            mode="time"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
                    
                    {showDatePicker && Platform.OS === 'ios' && (
                         <DateTimePicker
                            value={selectedDate}
                            mode="time"
                            display="spinner"
                            onChange={handleDateChange}
                        />
                    )}

                    <TouchableOpacity style={[styles.submitButton, (!isFormValid() || loading) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={!isFormValid() || loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                                <Text style={styles.submitButtonText}>{isEditing ? "Atualizar Agendamento" : "Criar Agendamento"}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SelectModal
                visible={showServiceModal} title="Selecione o Serviço"
                options={services.map(s => ({ id: s.id, name: s.name, description: s.price ? `R$ ${Number(s.price).toFixed(2)}` : undefined }))}
                selectedId={selectedService} onSelect={setSelectedService} onClose={() => setShowServiceModal(false)}
            />
            <SelectModal
                visible={showClientModal} title="Selecione o Cliente"
                options={clients.map(c => ({ id: c.id, name: c.name, description: c.email }))}
                selectedId={selectedClient} onSelect={setSelectedClient} onClose={() => setShowClientModal(false)}
            />
            <SelectModal
                visible={showBarberModal} title="Selecione o Barbeiro"
                options={barbers.map(b => ({ id: b.id, name: b.name, description: b.email }))}
                selectedId={selectedBarber} onSelect={setSelectedBarber} onClose={() => setShowBarberModal(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f172a" },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    content: { flex: 1 },
    form: { padding: 20 },
    formGroup: { marginBottom: 24 },
    label: { fontSize: 15, fontWeight: "600", color: "#94a3b8", marginBottom: 8 },
    required: { color: "#ef4444" },
    helperText: { fontSize: 13, color: "#64748b", marginTop: 6, fontStyle: "italic" },
    pickerContainer: { backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)" },
    selectButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    selectButtonText: { flex: 1, fontSize: 16, color: "#fff" },
    placeholder: { color: "#64748b" },
    input: { backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#fff" },
    disabled: { opacity: 0.5 },
    divider: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" },
    dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: "600", color: "#64748b" },
    dateButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    dateButtonText: { flex: 1, fontSize: 16, color: "#fff" },
    submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, marginTop: 12, gap: 8 },
    submitButtonDisabled: { backgroundColor: "#334155" },
    submitButtonText: { fontSize: 17, fontWeight: "700", color: "#fff" },
});

export default CreateAppointmentScreen;