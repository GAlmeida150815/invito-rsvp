// mobile/components/FilterBar.tsx

// React & Core
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";

// Third Party
import { Searchbar, Chip, Text, IconButton } from "react-native-paper";

// Types
import type { SortOption } from "@/types";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: {
  key: SortOption;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    key: "date_asc",
    label: "Próximos",
    icon: "calendar-arrow-right",
    description: "Eventos mais próximos primeiro",
  },
  {
    key: "date_desc",
    label: "Mais Distantes",
    icon: "calendar-arrow-left",
    description: "Eventos mais distantes primeiro",
  },
  {
    key: "alpha_asc",
    label: "A-Z",
    icon: "sort-alphabetical-ascending",
    description: "Ordenar alfabeticamente A-Z",
  },
  {
    key: "alpha_desc",
    label: "Z-A",
    icon: "sort-alphabetical-descending",
    description: "Ordenar alfabeticamente Z-A",
  },
  {
    key: "capacity_asc",
    label: "Menos Vagas",
    icon: "account-multiple-minus",
    description: "Menor capacidade primeiro",
  },
  {
    key: "capacity_desc",
    label: "Mais Vagas",
    icon: "account-multiple-plus",
    description: "Maior capacidade primeiro",
  },
];

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: FilterBarProps) => {
  const currentSort = sortOptions.find((opt) => opt.key === sortBy);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder='Buscar evento...'
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
        elevation={0}
        iconColor='#666'
      />

      {/* Sort Section */}
      <View style={styles.sortHeader}>
        <View style={styles.sortHeaderLeft}>
          <IconButton
            icon='sort'
            size={18}
            iconColor='#666'
            style={{ margin: 0 }}
          />
          <Text style={styles.sortLabel}>Ordenar por: </Text>
          {currentSort && (
            <Text style={styles.currentSort}>{currentSort.label}</Text>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortContainer}
      >
        {sortOptions.map((option) => (
          <Chip
            key={option.key}
            selected={sortBy === option.key}
            onPress={() => onSortChange(option.key)}
            icon={option.icon}
            style={[styles.chip, sortBy === option.key && styles.chipSelected]}
            textStyle={[
              styles.chipText,
              sortBy === option.key && styles.chipTextSelected,
            ]}
            mode={sortBy === option.key ? "flat" : "outlined"}
            showSelectedCheck={false}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  sortHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sortHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  currentSort: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "600",
  },
  sortContainer: {
    flexDirection: "row",
    paddingBottom: 4,
    gap: 8,
  },
  chip: {
    height: 36,
    backgroundColor: "white",
    borderColor: "#e0e0e0",
  },
  chipSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#2196F3",
  },
  chipText: {
    fontSize: 13,
    color: "#666",
  },
  chipTextSelected: {
    color: "#2196F3",
    fontWeight: "600",
  },
});
