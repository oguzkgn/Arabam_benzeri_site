const Redis = require('ioredis');

const isProduction = process.env.NODE_ENV === 'production';
const REDIS_URL = process.env.REDIS_URL || (!isProduction ? 'redis://localhost:6379' : null);
const REDIS_ENABLED = Boolean(REDIS_URL);

let redisClient = null;
let redisDisabledLogged = false;

function getRedis() {
  if (!REDIS_ENABLED) return null;

  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
      enableOfflineQueue: false
    });
    redisClient.on('error', (err) => {
      console.warn('[Redis] Bağlantı hatası:', err.message);
    });
  }
  return redisClient;
}

async function connectRedis() {
  if (!REDIS_ENABLED) {
    if (!redisDisabledLogged) {
      console.log('[Redis] Devre dışı — REDIS_URL tanımlı değil (Render için normal)');
      redisDisabledLogged = true;
    }
    return null;
  }

  const client = getRedis();
  if (client.status === 'wait' || client.status === 'end') {
    await client.connect();
  }
  await client.ping();
  console.log('[Redis] Bağlantı başarılı');
  return client;
}

async function getRedisStatus() {
  if (!REDIS_ENABLED) return 'devre_disinda';
  try {
    const client = getRedis();
    if (client.status === 'wait') await client.connect();
    await client.ping();
    return 'bagli';
  } catch {
    return 'bagli_degil';
  }
}

module.exports = { getRedis, connectRedis, getRedisStatus, REDIS_ENABLED };
