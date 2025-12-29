import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // ✅ Importação de tipos
import appointmentsService, { Appointment } from '../../api/appointmentsService';
import { useAuth } from '../../context/AuthContext';
// ✅ Importações do Menu Lateral Customizado
import { SideMenu } from '../../components/common/SideMenu';
import { navigateFromMenu } from '../../navigation/menuNavigationMap';
// ✅ Importação do tipo de rotas (ajuste conforme seu projeto)
import { MainStackParamList } from '../../navigation/AppNavigator';

interface Summary {
    totalSpent: number;
    avgTicket: number;
    lastVisit: string;
    totalVisits: number;
}

const ClientSpendingScreen: React.FC = () => {
    const route = useRoute<RouteProp<any, any>>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>(); // ✅ Tipagem correta
    const clientId = route.params?.clientId;

    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [history, setHistory] = useState<Appointment[]>([]);

    // ✅ Estado para controlar o Menu Lateral
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Se for CLIENT, pode não ter clientId na rota, usa o ID do próprio user
                const targetId = clientId || user?.id;

                if (!targetId) return;

                const data = await appointmentsService.getClientSpending(targetId);
                setSummary({
                    totalSpent: data.totalSpent,
                    avgTicket: data.avgTicket,
                    lastVisit: data.lastVisit,
                    totalVisits: data.totalVisits ?? (data.history?.length ?? 0),
                });
                setHistory(data.history);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [clientId, user]);

    // ✅ Lógica de navegação do Menu
    const handleMenuSelect = (label: string) => {
        setMenuVisible(false);
        navigateFromMenu(label, navigation);
    };

    if (loading) {
        return (
            <View style={styles.centered}><ActivityIndicator color="#10B981" /></View>
        );
    }

    return (
        <View style={styles.container}>
            {/* ✅ Menu Lateral Customizado */}
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={handleMenuSelect}
            />

            {/* Header: Botão Menu (para Cliente) ou Voltar (para Admin) */}
            <View style={styles.header}>
                {user?.role === 'CLIENT' ? (
                    <TouchableOpacity
                        onPress={() => setMenuVisible(true)} // ✅ Abre o menu customizado
                        style={styles.headerButton}
                    >
                        <Text style={styles.iconText}>☰</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerButton}
                    >
                        <Text style={styles.iconText}>←</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Financeiro</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Total Gasto (LTV)</Text>
                    <Text style={styles.cardValue}>R$ {summary?.totalSpent?.toFixed(2)}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Ticket Médio</Text>
                    <Text style={styles.cardValue}>R$ {summary?.avgTicket?.toFixed(2)}</Text>
                </View>
            </View>

            <View style={[styles.summaryRow, { marginTop: 0 }]}>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Total de Visitas</Text>
                    <Text style={styles.cardValue}>{summary?.totalVisits}</Text>
                </View>
                <View style={styles.card}>
                    <Text style={styles.cardLabel}>Última Visita</Text>
                    <Text style={styles.cardValue}>{summary?.lastVisit || '-'}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Histórico de Serviços</Text>

            <FlatList
                data={history}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <View style={styles.historyCard}>
                        <Text style={styles.serviceName}>{item.serviceName}</Text>
                        <Text style={styles.date}>{item.startsAt ? new Date(item.startsAt).toLocaleDateString() : '-'}</Text>
                        <Text style={styles.price}>R$ {item.finalPrice?.toFixed(2) || item.price?.toFixed(2)}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 8,
    },
    headerButton: {
        padding: 8,
        zIndex: 10,
    },
    iconText: {
        color: '#fff',
        fontSize: 24,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 4,
    },
    cardLabel: {
        color: '#9CA3AF',
        fontSize: 12,
        marginBottom: 6,
        textAlign: 'center',
    },
    cardValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 12,
    },
    historyCard: {
        backgroundColor: '#1F2937',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    serviceName: {
        color: '#fff',
        fontSize: 15,
        flex: 2,
    },
    date: {
        color: '#9CA3AF',
        fontSize: 13,
        flex: 1,
        textAlign: 'center',
    },
    price: {
        color: '#10B981',
        fontWeight: 'bold',
        fontSize: 15,
        flex: 1,
        textAlign: 'right',
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 24,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#111827',
    },
});

export default ClientSpendingScreen;