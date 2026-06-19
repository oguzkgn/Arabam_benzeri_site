const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS || 60);
const LISTINGS_CACHE_KEY = 'api:listings:all';

async function getCachedListings(redis) {
  if (!redis) return null;
  try {
    const cached = await redis.get(LISTINGS_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function setCachedListings(redis, listings) {
  if (!redis) return;
  try {
    await redis.setex(LISTINGS_CACHE_KEY, CACHE_TTL, JSON.stringify(listings));
  } catch (error) {
    console.warn('[Redis Cache] Yazma hatası:', error.message);
  }
}

async function invalidateListingsCache(redis) {
  if (!redis) return;
  try {
    await redis.del(LISTINGS_CACHE_KEY);
  } catch (error) {
    console.warn('[Redis Cache] Temizleme hatası:', error.message);
  }
}

module.exports = {
  getCachedListings,
  setCachedListings,
  invalidateListingsCache,
  LISTINGS_CACHE_KEY
};
