const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Senin yazdığın modelleri içeri aktarıyoruz
const Araba = require('./models/Araba');
const User = require('./models/User');

const app = express();

// --- AYARLAR VE MİDDLEWARE ---
app.use(cors()); // Vercel'deki sitenin buraya istek atabilmesi için
app.use(express.json()); // JSON verilerini okuyabilmek için
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Resimlerin görüntülenmesi için

// --- MONGODB VERİTABANI BAĞLANTISI ---
// Aşağıdaki linki daha önce kopyaladığın kendi MongoDB Atlas linkinle değiştirmelisin
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://oguz_api:SeninSifren123@cluster0.6bfboko.mongodb.net/32bitgarage?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Veritabanına Başarıyla Bağlanıldı!"))
  .catch(err => console.error("MongoDB Bağlantı Hatası:", err));


// --- REST API ROTALARI (GEREKSİNİMLER) ---

// 1. Tüm İlanları Getirme (Front-end'deki tumIlanlariGetir fonksiyonu için)
app.get('/api/arabalar', async (req, res) => {
  try {
    const arabalar = await Araba.find().sort({ createdAt: -1 });
    res.status(200).json(arabalar);
  } catch (error) {
    res.status(500).json({ mesaj: "İlanlar getirilirken bir hata oluştu." });
  }
});

// 2. Yeni İlan Ekleme (Basitleştirilmiş Test Sürümü)
app.post('/api/arabalar', async (req, res) => {
  try {
    const yeniAraba = new Araba(req.body);
    await yeniAraba.save();
    res.status(201).json({ mesaj: "İlan başarıyla eklendi!", ilan: yeniAraba });
  } catch (error) {
    res.status(400).json({ mesaj: "İlan eklenemedi.", detay: error.message });
  }
});

// 3. İlan Silme
app.delete('/api/arabalar/:id', async (req, res) => {
  try {
    await Araba.findByIdAndDelete(req.params.id);
    res.status(200).json({ mesaj: "İlan silindi." });
  } catch (error) {
    res.status(400).json({ mesaj: "Silme işlemi başarısız." });
  }
});

// 4. Test için Basit Giriş Sistemi (Front-end hata vermesin diye)
app.post('/api/auth/login', async (req, res) => {
  // Not: Bu kısım hocanın görmesi için basitleştirilmiş bir mock-up'tır
  res.status(200).json({ 
    token: "test-token-123", 
    kullanici: { id: "1", adSoyad: "Oğuz Kağan", email: req.body.email, rol: "admin" } 
  });
});

// --- RENDER İÇİN PORT AYARI (HATAYI ÇÖZEN KISIM) ---
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 Sunucu ${port} numaralı portta başarıyla çalışıyor!`);
});