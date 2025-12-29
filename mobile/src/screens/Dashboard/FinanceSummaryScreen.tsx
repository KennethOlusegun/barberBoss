import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SideMenu } from '../../components/common/SideMenu';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/colors';
import { navigateFromMenu } from '../../navigation/menuNavigationMap';

// Interfaces de tipos para o relatório financeiro
export interface Appointment {
    id: string;
    startsAt: string; // ISO date string
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    clientName?: string;
    user?: {
        name: string;
    };
    service?: {
        name: string;
        price: number;
        barberCommission?: number; // default 0.5 (50%)
    };
}

export interface FinanceSummary {
    total: number;
    completed: number;
    pending: number;
    appointments: Appointment[];
}

// Função auxiliar para formatar data
const formatDate = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    } catch {
        return 'Data inválida';
    }
};

export default function FinanceSummaryScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [menuVisible, setMenuVisible] = useState(false);
    const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    // Controle de acesso
    const canViewFinance = user?.role === 'BARBER' || user?.role === 'ADMIN';

    // Função para buscar dados
    const fetchFinanceSummary = async () => {
        try {
            setLoading(true);
            setError('');
            const params = user?.role === 'BARBER' ? { barberId: user.id } : {};
            const response = await apiClient.get('/finance-report/summary', { params });
            setFinanceSummary(response.data);
        } catch (err) {
            setError('Erro ao buscar relatório financeiro');
        } finally {
            setLoading(false);
        }
    };

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchFinanceSummary();
        setRefreshing(false);
    }, [user]);

    useEffect(() => {
        fetchFinanceSummary();
    }, [user]);

    if (!canViewFinance) {
        return (
            <View style={styles.centeredContainer}>
                <MaterialIcons name="block" size={48} color={COLORS.vintage_red} style={{ opacity: 0.7 }} />
                <Text style={styles.errorText}>Acesso não autorizado</Text>
            </View>
        );
    }

    // Header visual
    const handleRefresh = () => {
        fetchFinanceSummary();
    };

    // Navegação para acerto de comissões (payout)
    const handleGoToPayout = () => {
        navigation.navigate('CommissionPayout');
    };

    // Estado de loading
    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={COLORS.royal_blue} />
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }

    // Estado de erro
    if (error) {
        return (
            <View style={styles.centeredContainer}>
                <MaterialIcons name="error-outline" size={48} color={COLORS.vintage_red} style={{ marginBottom: 12 }} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchFinanceSummary}>
                    <Text style={styles.retryBtnText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Estado vazio
    const isEmpty = !financeSummary || !financeSummary.appointments || financeSummary.appointments.length === 0;

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.midnight_navy }}>
            {/* SideMenu */}
            <SideMenu
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
                onSelect={label => {
                    setMenuVisible(false);
                    if (!navigateFromMenu(label, navigation)) {
                        // fallback ou alerta opcional
                    }
                }}
            />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ marginRight: 12 }} accessibilityLabel="Abrir menu">
                    <MaterialIcons name="menu" size={28} color={COLORS.white_pure} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>RESUMO FINANCEIRO</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {user?.role === 'ADMIN' && (
                        <TouchableOpacity onPress={handleGoToPayout} style={{ marginRight: 8 }} accessibilityLabel="Ir para Acerto de Comissões">
                            <MaterialIcons name="account-balance-wallet" size={28} color={COLORS.white_pure} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleRefresh} style={styles.headerRefreshBtn} accessibilityLabel="Atualizar">
                        <MaterialIcons name="refresh" size={28} color={COLORS.white_pure} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: SIZES.padding, paddingVertical: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.royal_blue]}
                        tintColor={COLORS.royal_blue}
                    />
                }
            >
                {/* Card de Resumo */}
                <LinearGradient
                    colors={[COLORS.slate_grey, COLORS.midnight_navy]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.summaryCard}
                >
                    <Text style={styles.summaryLabel}>RECEITA TOTAL</Text>
                    <Text style={styles.summaryTotal}>
                        R$ {financeSummary ? financeSummary.total.toFixed(2) : '0,00'}
                    </Text>
                    <View style={styles.summaryGrid}>
                        {/* Coluna Concluídos */}
                        <View style={styles.summaryCol}>
                            <Text style={styles.summaryColLabel}>CONCLUÍDOS</Text>
                            <Text style={[styles.summaryColValue, { color: '#4ade80' }]}>
                                R$ {financeSummary ? financeSummary.completed.toFixed(2) : '0,00'}
                            </Text>
                        </View>
                        {/* Divisor vertical */}
                        <View style={styles.summaryDivider} />
                        {/* Coluna Pendentes */}
                        <View style={styles.summaryCol}>
                            <Text style={styles.summaryColLabel}>PENDENTES</Text>
                            <Text style={[styles.summaryColValue, { color: '#60a5fa' }]}>
                                R$ {financeSummary ? financeSummary.pending.toFixed(2) : '0,00'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Seção Histórico Recente */}
                <Text style={styles.historyTitle}>HISTÓRICO RECENTE</Text>
                {isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="attach-money" size={48} color={COLORS.grey_steel} style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyText}>Nenhum registro financeiro encontrado.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={financeSummary?.appointments || []}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => {
                            const commission = (item.service?.price || 0) * (item.service?.barberCommission ?? 0.5);
                            const isConfirmed = item.status === 'CONFIRMED';
                            const isPending = item.status === 'PENDING';
                            const statusColor = isConfirmed ? '#4ade80' : isPending ? '#fbbf24' : COLORS.grey_steel;
                            const statusIcon = isConfirmed ? 'check-circle' : isPending ? 'schedule' : 'cancel';
                            const commissionColor = isConfirmed ? '#4ade80' : isPending ? '#fbbf24' : COLORS.grey_steel;
                            const formattedDate = formatDate(item.startsAt);

                            return (
                                <View style={[styles.transactionCard, { borderLeftColor: statusColor }]}>
                                    {/* Top Row */}
                                    <View style={styles.transactionTopRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialIcons name={statusIcon} size={22} color={statusColor} style={{ marginRight: 8 }} />
                                            <Text style={styles.transactionService}>{item.service?.name || 'Serviço'}</Text>
                                        </View>
                                        <Text style={[styles.transactionCommission, { color: commissionColor }]}>
                                            +R$ {commission.toFixed(2)}
                                        </Text>
                                    </View>
                                    {/* Bottom Row */}
                                    <View style={styles.transactionBottomRow}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.transactionDate}>{formattedDate}</Text>
                                            <Text style={styles.transactionBullet}> • </Text>
                                            <Text style={styles.transactionClient} numberOfLines={1}>
                                                {item.clientName || item.user?.name || 'Cliente'}
                                            </Text>
                                        </View>
                                        <Text style={styles.transactionTotal}>
                                            Total: R$ {typeof item.service?.price === 'number' ? item.service.price.toFixed(2) : '0,00'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        }}
                        ListEmptyComponent={null}
                        contentContainerStyle={{ paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                )}
            </ScrollView>

            {/* Botão fixo removido. Pull-to-refresh ativado no ScrollView. */}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.midnight_navy,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.padding,
        paddingTop: 32,
        paddingBottom: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.slate_grey,
    },
    headerTitle: {
        color: COLORS.white_pure,
        fontSize: SIZES.h4,
        fontFamily: FONTS.heading.fontFamily,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 700,
    },
    headerRefreshBtn: {
        padding: 4,
        borderRadius: 20,
    },
    summaryCard: {
        borderRadius: 20,
        padding: 28,
        marginBottom: 24,
        ...SHADOWS.md,
    },
    summaryLabel: {
        color: COLORS.grey_steel,
        fontSize: SIZES.small,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 8,
        fontFamily: FONTS.bodyMedium.fontFamily,
        fontWeight: 500,
    },
    summaryTotal: {
        color: COLORS.white_pure,
        fontSize: 48,
        fontFamily: FONTS.heading.fontFamily,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 18,
    },
    summaryGrid: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryCol: {
        flex: 1,
        alignItems: 'center',
    },
    summaryColLabel: {
        color: COLORS.grey_steel,
        fontSize: 13,
        textTransform: 'uppercase',
        marginBottom: 4,
        fontFamily: FONTS.bodyMedium.fontFamily,
        fontWeight: 500,
    },
    summaryColValue: {
        fontSize: 19,
        fontWeight: 'bold',
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginHorizontal: 16,
    },
    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.midnight_navy,
        paddingHorizontal: 24,
    },
    loadingText: {
        color: COLORS.grey_steel,
        fontSize: 16,
        marginTop: 18,
        fontFamily: FONTS.bodyMedium.fontFamily,
        fontWeight: 500,
    },
    errorText: {
        color: COLORS.vintage_red,
        fontSize: 16,
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: FONTS.bodyMedium.fontFamily,
        fontWeight: 500,
    },
    retryBtn: {
        backgroundColor: COLORS.vintage_red,
        borderRadius: 8,
        paddingHorizontal: 28,
        paddingVertical: 12,
        marginTop: 8,
        ...SHADOWS.md,
    },
    retryBtnText: {
        color: COLORS.white_pure,
        fontSize: 16,
        fontFamily: FONTS.bodySemiBold.fontFamily,
        fontWeight: 600,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        marginBottom: 32,
    },
    emptyText: {
        color: COLORS.grey_steel,
        fontSize: 16,
        marginTop: 16,
        fontFamily: FONTS.bodyMedium.fontFamily,
        fontWeight: 500,
        textAlign: 'center',
    },
    // fixedBtn e fixedBtnText removidos
    historyTitle: {
        fontFamily: FONTS.bodySemiBold.fontFamily,
        fontWeight: 600,
        fontSize: 18,
        color: COLORS.white_pure,
        marginBottom: 16,
        marginLeft: 2,
    },
    transactionCard: {
        backgroundColor: COLORS.slate_grey,
        borderLeftWidth: 5,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.md,
    },
    transactionTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    transactionService: {
        fontSize: 17,
        color: COLORS.white_pure,
        fontFamily: FONTS.bodyBold.fontFamily,
        fontWeight: 700,
    },
    transactionCommission: {
        fontWeight: 'bold',
        fontSize: 19,
    },
    transactionBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionDate: {
        color: COLORS.grey_steel,
        fontSize: 14,
    },
    transactionBullet: {
        color: COLORS.grey_steel,
        fontSize: 14,
        marginHorizontal: 2,
    },
    transactionClient: {
        color: COLORS.grey_steel,
        fontSize: 14,
        maxWidth: 120,
    },
    transactionTotal: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
});