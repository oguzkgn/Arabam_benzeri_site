require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const amqp = require('amqplib');
const { EXCHANGE_NAME } = require('../config/rabbitmq');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const QUEUE_NAME = '32bitgarage.event.logs';

async function startWorker() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  const routingKeys = [
    'user.*',
    'listing.*',
    'favorite.*'
  ];

  for (const key of routingKeys) {
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
  }

  console.log('[Worker] RabbitMQ olay dinleyicisi başlatıldı');

  channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;
    const event = JSON.parse(msg.content.toString());
    console.log(`[Event] ${msg.fields.routingKey}`, event);
    channel.ack(msg);
  });
}

startWorker().catch((err) => {
  console.error('[Worker] Başlatılamadı:', err.message);
  process.exit(1);
});
