import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ListingCard from '../components/ListingCard';
import { listingsApi } from '../api/client';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import { filterAndSortListings } from '../utils/listings';
import { colors } from '../theme/colors';

export default function FavoritesScreen({ navigation }) {
  const [listings, setListings] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      const [res, favs] = await Promise.all([
        listingsApi.getAll(),
        getFavorites()
      ]);
      setFavoriteIds(favs);
      const all = Array.isArray(res.data) ? res.data : [];
      setListings(filterAndSortListings(all, {}, 'enYeni', favs, true));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadFavorites();
  }, []));

  const removeFavorite = async (ilanId) => {
    const updated = await toggleFavorite(ilanId);
    setFavoriteIds(updated);
    setListings((prev) => prev.filter((i) => i._id !== ilanId));
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <FlatList
      style={styles.container}
      data={listings}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFavorites(); }} />}
      ListEmptyComponent={<Text style={styles.empty}>Henüz favori ilanınız yok. İlanlar sekmesinden ❤️ ile ekleyin.</Text>}
      renderItem={({ item }) => (
        <ListingCard
          listing={item}
          isFavorite
          onPress={() => navigation.navigate('ListingDetail', { listing: item })}
          onToggleFavorite={() => removeFavorite(item._id)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, paddingHorizontal: 24, lineHeight: 22 }
});
