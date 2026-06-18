const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3
    });

    redisClient.on('error', (err) => {
      console.warn('[Redis] Bağlantı hatası:', err.message);
    });
  }
  return redisClient;
}

async function connectRedis() {
  const client = getRedis();
  if (client.status === 'wait') {
    await new Promise((resolve, reject) => {
      client.once('ready', resolve);
      client.once('error', reject);
    });
  }
  console.log('[Redis] Bağlantı başarılı');
  return client;
}

module.exports = { getRedis, connectRedis };
