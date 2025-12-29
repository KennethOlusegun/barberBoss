import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../api/usersService';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Senha atual obrigatória'),
    newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
});
type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePasswordScreen: React.FC = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

    const onSubmit = async (data: PasswordFormData) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            await usersService.changePassword(user.id, data);
            Alert.alert('Sucesso', 'Senha alterada!');
            reset();
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Erro ao alterar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Alterar Senha</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={{ padding: 20 }}>
                <View style={styles.formCard}>
                    
                    {/* CAMPO 1: Senha Atual */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Senha Atual</Text>
                        <Controller 
                            control={control} 
                            name="currentPassword" 
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    icon="lock-closed-outline" 
                                    placeholder="Digite sua senha atual" 
                                    value={value} 
                                    onChangeText={onChange} 
                                    secureTextEntry 
                                    error={errors.currentPassword?.message} 
                                    // label removido daqui
                                />
                            )} 
                        />
                    </View>

                    {/* CAMPO 2: Nova Senha */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nova Senha</Text>
                        <Controller 
                            control={control} 
                            name="newPassword" 
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    icon="key-outline" 
                                    placeholder="Mínimo 6 caracteres" 
                                    value={value} 
                                    onChangeText={onChange} 
                                    secureTextEntry 
                                    error={errors.newPassword?.message} 
                                    // label removido daqui
                                />
                            )} 
                        />
                    </View>

                </View>
                <Button title={loading ? "Alterando..." : "CONFIRMAR"} onPress={handleSubmit(onSubmit)} disabled={loading} variant="primary" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    formCard: { backgroundColor: '#1F2937', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#374151' },
    
    // Novos estilos adicionados
    inputContainer: { marginBottom: 16 },
    label: { color: '#9CA3AF', marginBottom: 8, fontSize: 14, fontWeight: '500' },
});

export default ChangePasswordScreen;