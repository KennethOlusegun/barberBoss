import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { appointmentsService, Appointment } from '../../api/appointmentsService';

interface TransactionDetailModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: Appointment | null; // Pode ser null se nada estiver selecionado
    onDeleted?: () => void;
    onUpdated?: (updated: Appointment) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    visible,
    onClose,
    transaction,
    onDeleted,
    onUpdated,
}) => {
    // Hooks devem ser chamados incondicionalmente, mas protegemos o uso de transaction abaixo
    // Se transaction for null, usamos valores padrão para não quebrar os hooks
    const [finalPrice, setFinalPrice] = useState(0);
    const [barberCommission, setBarberCommission] = useState(0);
    const [loading, setLoading] = useState(false);

    // Effect para atualizar estados quando a transação mudar
    React.useEffect(() => {
        if (transaction) {
            // Verifica se as propriedades existem, senão usa defaults
            // @ts-ignore: Ignorando erro se finalPrice não estiver na interface ainda
            setFinalPrice(transaction.finalPrice ?? transaction.price ?? 0);
             // @ts-ignore
            setBarberCommission(transaction.commission ?? transaction.service?.price ? (transaction.service.price * 0.5) : 0);
        }
    }, [transaction]);

    if (!transaction) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            // @ts-ignore: Supondo que o método updateFinancials foi criado no service
            const updated = await appointmentsService.updateFinancials(transaction.id, {
                finalPrice,
                barberCommission,
            });
            onUpdated?.(updated);
            onClose();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível salvar os ajustes.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert('Excluir', 'Deseja realmente excluir este registro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    setLoading(true);
                    try {
                        await appointmentsService.delete(transaction.id);
                        onDeleted?.();
                        onClose();
                    } catch (err) {
                        Alert.alert('Erro', 'Não foi possível excluir.');
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Ajuste Financeiro</Text>
                    
                    <Text style={styles.label}>Serviço</Text>
                    {/* ✅ CORREÇÃO 2: Acesso correto às propriedades aninhadas */}
                    <Text style={styles.value}>{transaction.service?.name || 'Serviço removido'}</Text>
                    
                    <Text style={styles.label}>Barbeiro</Text>
                    <Text style={styles.value}>{transaction.barber?.name || 'Não atribuído'}</Text>
                    
                    <Text style={styles.label}>Data</Text>
                    <Text style={styles.value}>
                        {transaction.startsAt ? new Date(transaction.startsAt).toLocaleString() : '-'}
                    </Text>

                    <Text style={styles.label}>Valor Total (R$)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(finalPrice)}
                        onChangeText={v => setFinalPrice(Number(v) || 0)}
                    />

                    <Text style={styles.label}>Comissão (Valor Fixo R$)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={String(barberCommission)}
                        onChangeText={v => setBarberCommission(Number(v) || 0)}
                    />

                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
                            <Text style={styles.deleteText}>Excluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            <Text style={styles.saveText}>{loading ? 'Salvando...' : 'Salvar Ajustes'}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    label: {
        color: '#9CA3AF',
        fontSize: 12,
        marginTop: 12,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    value: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 4,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#111827',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 4,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#374151',
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    deleteBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderRadius: 8,
        padding: 14,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    deleteText: {
        color: '#EF4444',
        fontWeight: 'bold',
    },
    saveBtn: {
        backgroundColor: '#10B981',
        borderRadius: 8,
        padding: 14,
        flex: 1,
        alignItems: 'center',
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeBtn: {
        marginTop: 16,
        alignSelf: 'center',
        padding: 8,
    },
    closeText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});

export default TransactionDetailModal;