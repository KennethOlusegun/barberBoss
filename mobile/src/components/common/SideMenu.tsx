import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, TextInput } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MENU_WIDTH = width * 0.75;

const menuItems = [
    { icon: 'grid-view' as const, label: 'Dashboard' },
    { icon: 'event' as const, label: 'Agendamentos' },
    { icon: 'groups' as const, label: 'Clientes' },
    { icon: 'content-cut' as const, label: 'Serviços' },
    { icon: 'attach-money' as const, label: 'Financeiro' },
    { icon: 'person' as const, label: 'Perfil' },
];

// Definir tipos para as props
interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (label: string) => void;
}

interface TopBarProps {
    onMenuPress: () => void;
    onBellPress: () => void;
    onProfilePress: () => void;
    searchValue: string;
    onSearchChange: (text: string) => void;
}

interface FabButtonProps {
    onPress: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose, onSelect }) => {
    const [animValue] = useState(new Animated.Value(visible ? 0 : -MENU_WIDTH));
    const { signOut } = useAuth();

    React.useEffect(() => {
        Animated.timing(animValue, {
            toValue: visible ? 0 : -MENU_WIDTH,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [visible]);

    return (
        <Animated.View style={[styles.menu, { left: animValue }]}>
            <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
            {menuItems.map((item) => (
                <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => onSelect(item.label)}>
                    <MaterialIcons name={item.icon} size={24} color="#fff" style={{ marginRight: 16 }} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 12 }} />
                <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

export const TopBar: React.FC<TopBarProps> = ({
    onMenuPress,
    onBellPress,
    onProfilePress,
    searchValue,
    onSearchChange
}) => (
    <View style={styles.topBar}>
        <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#aaa" style={{ marginLeft: 8 }} />
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar.."
                placeholderTextColor="#aaa"
                value={searchValue}
                onChangeText={onSearchChange}
            />
        </View>
        <TouchableOpacity onPress={onBellPress}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onProfilePress}>
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
    </View>
);

export const FabButton: React.FC<FabButtonProps> = ({ onPress }) => (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
        <Ionicons name="add" size={32} color="#fff" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    menu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: MENU_WIDTH,
        backgroundColor: '#151c2c',
        zIndex: 100,
        paddingTop: 48,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 2, height: 0 },
        shadowRadius: 8,
        elevation: 8,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.12)',
        justifyContent: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 4,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    menuItemText: {
        color: '#fff',
        fontSize: 18,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#223',
        paddingHorizontal: 12,
        paddingVertical: 10,
        elevation: 4,
        zIndex: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222b',
        borderRadius: 8,
        marginHorizontal: 12,
        height: 38,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingHorizontal: 8,
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        backgroundColor: '#1976d2',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
});