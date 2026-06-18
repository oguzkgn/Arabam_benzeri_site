const test = require('node:test');
const assert = require('node:assert');

test('RabbitMQ entegrasyonu — exchange ve olay yayını', async () => {
  const { connectRabbitMQ, publishEvent, EXCHANGE_NAME } = require('../config/rabbitmq');
  await connectRabbitMQ();
  await publishEvent('listing.created', {
    test: true,
    kaynak: 'github-actions-ci'
  });
  assert.strictEqual(EXCHANGE_NAME, '32bitgarage.events');
});

test('RabbitMQ event servisi — listing.created olayı', async () => {
  const { emitListingCreated } = require('../services/eventService');
  await emitListingCreated(
    { _id: 'test-id', marka: 'Toyota', fiyat: 100000 },
    'user-test-id'
  );
});
