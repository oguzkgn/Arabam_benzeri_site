const { publishEvent } = require('../config/rabbitmq');

async function emitUserRegistered(user) {
  await publishEvent('user.registered', {
    userId: user._id.toString(),
    email: user.email,
    adSoyad: user.adSoyad
  });
}

async function emitUserUpdated(userId) {
  await publishEvent('user.updated', { userId });
}

async function emitUserDeleted(userId) {
  await publishEvent('user.deleted', { userId });
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

async function emitFavoriteAdded(userId, ilanId) {
  await publishEvent('favorite.added', { userId, ilanId });
}

async function emitFavoriteRemoved(userId, ilanId) {
  await publishEvent('favorite.removed', { userId, ilanId });
}

module.exports = {
  emitUserRegistered,
  emitUserUpdated,
  emitUserDeleted,
  emitListingCreated,
  emitListingUpdated,
  emitListingDeleted,
  emitFavoriteAdded,
  emitFavoriteRemoved
};
