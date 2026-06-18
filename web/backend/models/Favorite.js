const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  ilanId: { type: String, required: true }
}, { timestamps: true });

favoriteSchema.index({ userId: 1, ilanId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
