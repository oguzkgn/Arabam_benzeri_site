const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // EKLENDİ: Fotoğraf yükleme modülü
const fs = require('fs'); // EKLENDİ: Dosya sistemi modülü

// Senin yazdığın modelleri içeri aktarıyoruz
const Araba = require('./models/Araba');
const User = require('./models/User');

const app = express();

// --- UPLOADS KLASÖRÜ KONTROLÜ ---
// Eğer uploads klasörü yoksa otomatik oluşturur, sistemin çökmesini engeller.
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// --- MULTER FOTOĞRAF AYARLARI ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Fotoğrafların kaydedileceği yer
  },
  filename: function (req, file, cb) {
    // Fotoğraf isimlerinin çakışmaması için başına tarih ekliyoruz
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

// --- AYARLAR VE MİDDLEWARE ---
app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MONGODB VERİTABANI BAĞLANTISI ---
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://oguz_api:SeninSifren123@cluster0.6bfboko.mongodb.net/32bitgarage?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Veritabanına Başarıyla Bağlanıldı!"))
  .catch(err => console.error("MongoDB Bağlantı Hatası:", err));


// --- REST API ROTALARI ---

// 1. Tüm İlanları Getirme
app.get('/api/arabalar', async (req, res) => {
  try {
    const arabalar = await Araba.find().sort({ createdAt: -1 });
    res.status(200).json(arabalar);
  } catch (error) {
    res.status(500).json({ mesaj: "İlanlar getirilirken bir hata oluştu." });
  }
});

// 2. Yeni İlan Ekleme (MÜHENDİSLİK DOKUNUŞU: Çoklu Fotoğraf Karşılama)
// upload.array('resimler', 5) -> 'resimler' adıyla gelen max 5 fotoğrafı kabul et
app.post('/api/arabalar', upload.array('resimler', 5), async (req, res) => {
  try {
    // Frontend'den gelen metin verilerini alıyoruz (Marka, model, konum vs.)
    const arabaVerisi = { ...req.body };

    // Eğer fotoğraf(lar) yüklendiyse, bu fotoğrafların isimlerini bir diziye (array) çevirip veriye ekliyoruz
    if (req.files && req.files.length > 0) {
      arabaVerisi.resimler = req.files.map(file => file.filename);
    }

    const yeniAraba = new Araba(arabaVerisi);
    await yeniAraba.save();
    res.status(201).json({ mesaj: "İlan başarıyla eklendi!", ilan: yeniAraba });
  } catch (error) {
    console.error("Kayıt Hatası Detayı:", error);
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

// 4. Basit Giriş Sistemi
app.post('/api/auth/login', async (req, res) => {
  res.status(200).json({ 
    token: "test-token-123", 
    kullanici: { id: "1", adSoyad: "Oğuz Kağan", email: req.body.email, rol: "admin" } 
  });
});

// --- SUNUCU BAŞLATMA ---
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Sunucu ${port} numaralı portta başarıyla çalışıyor!`);
});