import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../api/usersService';
import { COLORS } from '../../constants/colors';
import { Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/AppNavigator';

const profileSchema = z.object({
    name: z.string().min(3, 'Nome muito curto'),
    email: z.string().email('E-mail inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const ProfileScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    
    // ✅ CORREÇÃO 1: Cast para 'any' para acessar updateUser e evitar erro de tipagem
    const authContext = useAuth() as any; 
    const { user } = authContext;
    const updateUser = authContext.updateUser; // Se existir, pegamos aqui

    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: '', email: '', phone: '' }
    });

    useEffect(() => {
        if (user) {
            setValue('name', user.name);
            setValue('email', user.email);
            // ✅ CORREÇÃO 2: Acesso seguro ao phone
            setValue('phone', (user as any).phone || '');
        }
    }, [user]);

    const onSubmit = async (data: ProfileFormData) => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const updatedUser = await usersService.updateProfile(user.id, data);
            
            // Atualiza contexto se a função existir
            if (updateUser) {
                updateUser(updatedUser); 
            }
            
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Falha ao atualizar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                    </View>
                    <Text style={styles.roleText}>{user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'BARBER' ? 'Barbeiro' : 'Cliente'}</Text>
                </View>

                <View style={styles.formCard}>
                    {/* ✅ CORREÇÃO 3: Renderizando Labels manualmente fora do Input */}
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome</Text>
                        <Controller 
                            control={control} 
                            name="name" 
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    icon="account-outline" 
                                    placeholder="Nome" 
                                    value={value} 
                                    onChangeText={onChange} 
                                    error={errors.name?.message} 
                                />
                            )} 
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-mail</Text>
                        <Controller 
                            control={control} 
                            name="email" 
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    icon="email-outline" 
                                    placeholder="Email" 
                                    value={value} 
                                    onChangeText={onChange} 
                                    keyboardType="email-address" 
                                    error={errors.email?.message} 
                                />
                            )} 
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Telefone</Text>
                        <Controller 
                            control={control} 
                            name="phone" 
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    icon="phone-outline" 
                                    placeholder="Telefone" 
                                    value={value} 
                                    onChangeText={onChange} 
                                    keyboardType="phone-pad" 
                                    error={errors.phone?.message} 
                                />
                            )} 
                        />
                    </View>
                </View>

                <View style={styles.actions}>
                    <Button title={loading ? "Salvando..." : "SALVAR ALTERAÇÕES"} onPress={handleSubmit(onSubmit)} disabled={loading} variant="primary" />
                    <TouchableOpacity style={styles.changePassBtn} onPress={() => navigation.navigate('ChangePassword')} disabled={loading}>
                        <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                        <Text style={styles.changePassText}>ALTERAR SENHA</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#111827' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#1F2937' },
    backButton: { padding: 4 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    content: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 24 },
    avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#1F2937' },
    avatarText: { fontSize: 32, color: '#FFF', fontWeight: 'bold' },
    roleText: { color: '#9CA3AF', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
    formCard: { backgroundColor: '#1F2937', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#374151' },
    actions: { gap: 16 },
    changePassBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12 },
    changePassText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
    
    // ✅ Novos estilos para os Labels
    inputContainer: { marginBottom: 16 },
    label: { color: '#9CA3AF', marginBottom: 8, fontSize: 14, fontWeight: '500' },
});

export default ProfileScreen;