const test = require('node:test');
const assert = require('node:assert');

test('Redis entegrasyonu — bağlantı ve okuma/yazma', async () => {
  const { getRedis, connectRedis } = require('../config/redis');
  await connectRedis();
  const redis = getRedis();
  await redis.set('ci:redis-test', 'basarili');
  const value = await redis.get('ci:redis-test');
  assert.strictEqual(value, 'basarili');
  await redis.del('ci:redis-test');
});

test('Redis cache servisi — ilan önbelleği', async () => {
  const { getRedis, connectRedis } = require('../config/redis');
  const { setCachedListings, getCachedListings, invalidateListingsCache } = require('../services/cacheService');
  await connectRedis();
  const redis = getRedis();
  const sample = [{ _id: '1', marka: 'Test' }];
  await setCachedListings(redis, sample);
  const cached = await getCachedListings(redis);
  assert.strictEqual(cached[0].marka, 'Test');
  await invalidateListingsCache(redis);
});
