const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
    redisClient.on('error', (err) => {
      console.warn('[Redis] Bağlantı hatası:', err.message);
    });
  }
  return redisClient;
}

async function connectRedis() {
  const client = getRedis();
  if (client.status === 'wait' || client.status === 'end') {
    await client.connect();
  }
  await client.ping();
  console.log('[Redis] Bağlantı başarılı');
  return client;
}

async function getRedisStatus() {
  try {
    const client = getRedis();
    if (client.status === 'wait') await client.connect();
    await client.ping();
    return 'bagli';
  } catch {
    return 'bagli_degil';
  }
}

module.exports = { getRedis, connectRedis, getRedisStatus };
