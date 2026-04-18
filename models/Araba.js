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
  
  // --- MÜHENDİSLİK DÜZELTMELERİ BURADA ---
  
  // 1. EKSİK OLAN KONUM EKLENDİ (Frontend'den gelen Isparta mahallelerini tutacak)
  konum: { type: String, required: true }, 

  // 2. TEK RESİM YERİNE "RESİMLER" DİZİSİ EKLENDİ ([ ] köşeli parantezlere dikkat)
  resimler: [{ type: String }] 
  
}, { timestamps: true });

module.exports = mongoose.model('Araba', arabaSema);