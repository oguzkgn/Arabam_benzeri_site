const { publishEvent } = require('../config/rabbitmq');

async function emitUserRegistered(user) {
  await publishEvent('user.registered', {
    userId: user._id.toString(),
    email: user.email,
    adSoyad: user.adSoyad
  });
}

async function emitListingCreated(ilan, userId) {
  await publishEvent('listing.created', {
    ilanId: ilan._id.toString(),
    saticiId: userId,
    marka: ilan.marka,
    fiyat: ilan.fiyat
  });
}

async function emitListingUpdated(ilan, userId) {
  await publishEvent('listing.updated', {
    ilanId: ilan._id.toString(),
    saticiId: userId,
    fiyat: ilan.fiyat
  });
}

async function emitListingDeleted(ilanId, userId) {
  await publishEvent('listing.deleted', { ilanId, saticiId: userId });
}

module.exports = {
  emitUserRegistered,
  emitListingCreated,
  emitListingUpdated,
  emitListingDeleted
};
