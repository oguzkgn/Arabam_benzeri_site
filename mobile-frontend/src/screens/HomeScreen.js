import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ListingCard from '../components/ListingCard';
import FilterPanel from '../components/FilterPanel';
import { listingsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { filterAndSortListings } from '../utils/listings';
import { colors } from '../theme/colors';

const EMPTY_FILTERS = {
  vites: '', yakit: '', kasaTipi: '', minFiyat: '', maxFiyat: '', maxKm: '', konum: ''
};

export default function HomeScreen({ navigation }) {
  const { user, isLoggedIn } = useAuth();
  const [allListings, setAllListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('enYeni');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const res = await listingsApi.getAll();
      setAllListings(Array.isArray(res.data) ? res.data : []);
      const favs = await getFavorites();
      setFavoriteIds(favs);
    } catch (err) {
      const msg = err.response?.data?.mesaj || err.message || 'Bağlantı hatası';
      setError(msg);
      Alert.alert('Hata', `İlanlar yüklenemedi.\n\n${msg}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadData();
  }, []));

  const displayedListings = filterAndSortListings(allListings, filters, sort, favoriteIds, onlyFavorites);

  const handleToggleFavorite = async (ilanId) => {
    const updated = await toggleFavorite(ilanId);
    setFavoriteIds(updated);
  };

  const deleteListing = (id) => {
    Alert.alert('Sil', 'Bu ilanı silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await listingsApi.remove(id);
            loadData();
          } catch (err) {
            Alert.alert('Hata', err.response?.data?.mesaj || 'Silme yetkiniz yok.');
          }
        }
      }
    ]);
  };

  const isOwner = (listing) => String(user?.id) === String(listing.saticiId);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {!isLoggedIn && (
        <TouchableOpacity style={styles.loginBanner} onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.loginBannerText}>Giriş yap veya üye ol → İlan ver, profilini yönet</Text>
        </TouchableOpacity>
      )}

      <FilterPanel
        filters={filters}
        sort={sort}
        onlyFavorites={onlyFavorites}
        onChangeFilters={setFilters}
        onChangeSort={setSort}
        onToggleOnlyFavorites={() => setOnlyFavorites(!onlyFavorites)}
        onClear={() => { setFilters(EMPTY_FILTERS); setOnlyFavorites(false); setSort('enYeni'); }}
      />

      <Text style={styles.count}>
        {onlyFavorites ? `Favori İlanlarım ❤️ (${displayedListings.length})` : `Güncel İlanlar (${displayedListings.length} Araç)`}
      </Text>

      {error && (
        <TouchableOpacity style={styles.retryBox} onPress={loadData}>
          <Text style={styles.retryText}>Yeniden Dene</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={displayedListings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>Gösterilecek araç bulunamadı.</Text>}
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            isFavorite={favoriteIds.includes(item._id)}
            onPress={() => navigation.navigate('ListingDetail', { listing: item })}
            onToggleFavorite={() => handleToggleFavorite(item._id)}
            showOwnerActions={isLoggedIn && isOwner(item)}
            onEdit={() => navigation.navigate('ListingForm', { listing: item })}
            onDelete={() => deleteListing(item._id)}
          />
        )}
      />

      {isLoggedIn && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ListingForm')}>
          <Text style={styles.fabText}>+ Yeni İlan Ver</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loginBanner: { backgroundColor: colors.secondary, margin: 12, marginBottom: 4, padding: 14, borderRadius: 10 },
  loginBannerText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 13 },
  count: { fontSize: 16, fontWeight: '700', color: colors.text, paddingHorizontal: 12, paddingVertical: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12, paddingBottom: 90 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  retryBox: { margin: 12, padding: 12, backgroundColor: colors.danger, borderRadius: 8, alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 20, backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30, elevation: 5
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 }
});
