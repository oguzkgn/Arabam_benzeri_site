import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favoriler';

export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id) {
  const favorites = await getFavorites();
  const exists = favorites.includes(id);
  const updated = exists
    ? favorites.filter((favId) => favId !== id)
    : [...favorites, id];
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export async function isFavorite(id) {
  const favorites = await getFavorites();
  return favorites.includes(id);
}
