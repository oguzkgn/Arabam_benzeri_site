const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = '32bitgarage.events';

let channel = null;
let connection = null;

async function connectRabbitMQ() {
  if (channel) return channel;
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  console.log('[RabbitMQ] Bağlantı başarılı');
  return channel;
}

async function publishEvent(routingKey, payload) {
  const ch = await connectRabbitMQ();
  const message = Buffer.from(JSON.stringify({
    ...payload,
    timestamp: new Date().toISOString()
  }));
  ch.publish(EXCHANGE_NAME, routingKey, message, { persistent: true });
}

async function getRabbitMQStatus() {
  try {
    await connectRabbitMQ();
    return 'bagli';
  } catch {
    return 'bagli_degil';
  }
}

module.exports = { connectRabbitMQ, publishEvent, getRabbitMQStatus, EXCHANGE_NAME };
