const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS || 60);
const LISTINGS_CACHE_KEY = 'mobile:listings:all';

async function getCachedListings(redis) {
  try {
    const cached = await redis.get(LISTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function setCachedListings(redis, listings) {
  try {
    await redis.setex(LISTINGS_CACHE_KEY, CACHE_TTL, JSON.stringify(listings));
  } catch (error) {
    console.warn('[Cache] İlanlar önbelleğe yazılamadı:', error.message);
  }
}

async function invalidateListingsCache(redis) {
  try {
    await redis.del(LISTINGS_CACHE_KEY);
  } catch (error) {
    console.warn('[Cache] Önbellek temizlenemedi:', error.message);
  }
}

async function getUserFavoritesFromCache(redis, userId) {
  try {
    const cached = await redis.smembers(`favorites:${userId}`);
    return cached;
  } catch {
    return null;
  }
}

async function syncFavoritesToCache(redis, userId, ilanIds) {
  try {
    const key = `favorites:${userId}`;
    await redis.del(key);
    if (ilanIds.length > 0) {
      await redis.sadd(key, ...ilanIds);
    }
  } catch (error) {
    console.warn('[Cache] Favoriler önbelleğe yazılamadı:', error.message);
  }
}

async function addFavoriteToCache(redis, userId, ilanId) {
  try {
    await redis.sadd(`favorites:${userId}`, ilanId);
  } catch (error) {
    console.warn('[Cache] Favori eklenemedi:', error.message);
  }
}

async function removeFavoriteFromCache(redis, userId, ilanId) {
  try {
    await redis.srem(`favorites:${userId}`, ilanId);
  } catch (error) {
    console.warn('[Cache] Favori çıkarılamadı:', error.message);
  }
}

module.exports = {
  getCachedListings,
  setCachedListings,
  invalidateListingsCache,
  getUserFavoritesFromCache,
  syncFavoritesToCache,
  addFavoriteToCache,
  removeFavoriteFromCache
};
