const mongoose = require('mongoose');

const arabaSchema = new mongoose.Schema({
  marka: String,
  seri: String,
  model: String,
  yil: Number,
  kilometre: Number,
  vites: String,
  yakit: String,
  kasaTipi: String,
  fiyat: Number,
  aciklama: String,
  resim: String, // Eski tekli fotoğrafların bozulmaması için korundu
  resimler: { type: [String] }, // YENİ: Birden fazla fotoğraf ekleyebilmek için dizi (Array) yapısı eklendi
  saticiId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // KİMİN İLANI?
}, { timestamps: true });

module.exports = mongoose.model('Araba', arabaSchema);