// src/components/SelectModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";

interface SelectOption {
  id: string;
  name: string;
  description?: string;
}

interface SelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  loading?: boolean;
  searchable?: boolean;
  emptyMessage?: string;
}

export const SelectModal: React.FC<SelectModalProps> = ({
  visible,
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  loading = false,
  searchable = true,
  emptyMessage = "Nenhum item encontrado",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          {searchable && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#64748b" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                placeholderTextColor="#64748b"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : filteredOptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#475569" />
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.id === selectedId && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={styles.optionName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.optionDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {item.id === selectedId && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  optionSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  optionDescription: {
    fontSize: 14,
    color: "#94a3b8",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 16,
  },
});

export default SelectModal;
