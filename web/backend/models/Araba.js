const mongoose = require('mongoose');

const arabaSema = new mongoose.Schema({
  marka: { type: String, required: true },
  seri: { type: String, required: true },
  model: { type: String, required: true },
  yil: { type: Number, required: true },
  kilometre: { type: Number, required: true },
  vites: { type: String, required: true },
  yakit: { type: String, required: true },
  kasaTipi: { type: String, required: true },
  fiyat: { type: Number, required: true },
  aciklama: { type: String, required: true },
  
  // Mahalle filtreleri ve çoklu fotoğraf için
  konum: { type: String, required: true }, 
  resimler: [{ type: String }],
  
  // --- KRİTİK GÜVENLİK KİLİDİ ---
  // Bu ilanın hangi kullanıcıya ait olduğunu tutar.
  // Başkasının ilanı silmesini veya düzenlemesini engeller.
  saticiId: { type: String, required: true } 
  
}, { timestamps: true });

module.exports = mongoose.model('Araba', arabaSema);