const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  adSoyad: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Aynı e-posta ile iki kişi üye olamaz
  sifre: { type: String, required: true },
  rol: { type: String, default: 'user' } // 'user' veya 'admin' olabilir
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);