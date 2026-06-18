import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ISPARTA_KONUMLAR, SORT_OPTIONS, VITES_OPTIONS, YAKIT_OPTIONS, KASA_OPTIONS } from '../constants/config';
import { colors } from '../theme/colors';

export default function FilterPanel({ filters, sort, onlyFavorites, onChangeFilters, onChangeSort, onToggleOnlyFavorites, onClear }) {
  const update = (key, value) => onChangeFilters({ ...filters, [key]: value });

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, sort === opt.value && styles.chipActive]}
            onPress={() => onChangeSort(opt.value)}
          >
            <Text style={[styles.chipText, sort === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, onlyFavorites && styles.favChip]}
          onPress={onToggleOnlyFavorites}
        >
          <Text style={[styles.chipText, onlyFavorites && styles.chipTextActive]}>Favoriler ❤️</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <ChipSelect label="Konum" value={filters.konum} options={['', ...ISPARTA_KONUMLAR]} labels={['Tümü', ...ISPARTA_KONUMLAR]} onChange={(v) => update('konum', v)} />
        <ChipSelect label="Vites" value={filters.vites} options={['', ...VITES_OPTIONS]} labels={['Tümü', ...VITES_OPTIONS]} onChange={(v) => update('vites', v)} />
        <ChipSelect label="Kasa" value={filters.kasaTipi} options={['', ...KASA_OPTIONS]} labels={['Tümü', ...KASA_OPTIONS]} onChange={(v) => update('kasaTipi', v)} />
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Maks. Fiyat"
          keyboardType="numeric"
          value={filters.maxFiyat}
          onChangeText={(v) => update('maxFiyat', v)}
        />
        <TextInput
          style={styles.input}
          placeholder="Maks. KM"
          keyboardType="numeric"
          value={filters.maxKm}
          onChangeText={(v) => update('maxKm', v)}
        />
        <TouchableOpacity style={styles.clearBtn} onPress={onClear}>
          <Text style={styles.clearText}>Temizle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ChipSelect({ value, options, labels, onChange }) {
  return options.map((opt, i) => (
    <TouchableOpacity
      key={`${opt}-${i}`}
      style={[styles.chip, value === opt && styles.chipActive]}
      onPress={() => onChange(opt)}
    >
      <Text style={[styles.chipText, value === opt && styles.chipTextActive]} numberOfLines={1}>
        {labels[i].length > 18 ? labels[i].slice(0, 16) + '…' : labels[i]}
      </Text>
    </TouchableOpacity>
  ));
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  sortRow: { paddingHorizontal: 12, marginBottom: 6, maxHeight: 40 },
  filterRow: { paddingHorizontal: 12, marginBottom: 6, maxHeight: 40 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  favChip: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12 },
  chipTextActive: { color: '#fff' },
  inputRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: colors.border },
  clearBtn: { backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center' },
  clearText: { color: '#fff', fontWeight: '600', fontSize: 12 }
});
