const amqp = require('amqplib');

const isProduction = process.env.NODE_ENV === 'production';
const RABBITMQ_URL = process.env.RABBITMQ_URL || (!isProduction ? 'amqp://localhost:5672' : null);
const RABBITMQ_ENABLED = Boolean(RABBITMQ_URL);
const EXCHANGE_NAME = '32bitgarage.events';

let channel = null;
let connection = null;
let rabbitDisabledLogged = false;

async function connectRabbitMQ() {
  if (!RABBITMQ_ENABLED) {
    if (!rabbitDisabledLogged) {
      console.log('[RabbitMQ] Devre dışı — RABBITMQ_URL tanımlı değil (Render için normal)');
      rabbitDisabledLogged = true;
    }
    return null;
  }

  if (channel) return channel;
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  console.log('[RabbitMQ] Bağlantı başarılı');
  return channel;
}

async function publishEvent(routingKey, payload) {
  if (!RABBITMQ_ENABLED) return;

  try {
    const ch = await connectRabbitMQ();
    if (!ch) return;
    const message = Buffer.from(JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString()
    }));
    ch.publish(EXCHANGE_NAME, routingKey, message, { persistent: true });
  } catch (error) {
    console.warn('[RabbitMQ] Olay yayınlanamadı:', error.message);
  }
}

async function getRabbitMQStatus() {
  if (!RABBITMQ_ENABLED) return 'devre_disinda';
  try {
    await connectRabbitMQ();
    return 'bagli';
  } catch {
    return 'bagli_degil';
  }
}

module.exports = {
  connectRabbitMQ,
  publishEvent,
  getRabbitMQStatus,
  EXCHANGE_NAME,
  RABBITMQ_ENABLED
};
