const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Araba = require('./models/Araba'); 
const User = require('./models/User'); 

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const dbURI = "mongodb+srv://oguz:KagAn32@cluster0.6bfboko.mongodb.net/?appName=Cluster0";
mongoose.connect(dbURI).then(() => console.log("✅ Veritabanı Bağlandı")).catch(err => console.error("❌ DB Hatası:", err));

// --- GÜVENLİK KONTROLÜ ---
const authKontrol = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ mesaj: "Lütfen giriş yapın." });
  try {
    const decoded = jwt.verify(token, '32bit_gizli_anahtar');
    req.user = decoded; // İçinde id ve rol var
    next();
  } catch (e) { res.status(400).json({ mesaj: "Oturum geçersiz." }); }
};

// --- AUTH İŞLEMLERİ ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { adSoyad, email, sifre } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedSifre = await bcrypt.hash(sifre, salt);
    const yeniUser = new User({ adSoyad, email, sifre: hashedSifre, rol: 'user' });
    await yeniUser.save();
    res.status(201).json({ mesaj: "Kayıt başarılı!" });
  } catch (err) { res.status(400).json({ mesaj: "Kayıt hatası!" }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, sifre } = req.body;
    const kullanici = await User.findOne({ email });
    if (!kullanici) return res.status(404).json({ mesaj: "E-posta bulunamadı." });
    const dogruMu = await bcrypt.compare(sifre, kullanici.sifre);
    if (!dogruMu) return res.status(400).json({ mesaj: "Şifre hatalı." });
    
    // Payload'a hem id hem _id koyalım ki karışıklık çıkmasın
    const token = jwt.sign({ id: kullanici._id, rol: kullanici.rol || 'user' }, '32bit_gizli_anahtar', { expiresIn: '1d' });
    res.json({ token, kullanici: { id: kullanici._id, adSoyad: kullanici.adSoyad, rol: kullanici.rol || 'user' } });
  } catch (err) { res.status(500).json({ mesaj: "Giriş hatası" }); }
});

// PROFİL GÜNCELLEME (ID çakışması engellendi)
app.put('/api/auth/update', authKontrol, async (req, res) => {
  try {
    const { adSoyad, sifre } = req.body;
    const guncelleme = {};
    if (adSoyad && adSoyad.trim() !== "") guncelleme.adSoyad = adSoyad;
    if (sifre && sifre.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      guncelleme.sifre = await bcrypt.hash(sifre, salt);
    }
    const guncel = await User.findByIdAndUpdate(req.user.id, { $set: guncelleme }, { new: true }).select('-sifre');
    res.json({ mesaj: "Bilgiler güncellendi", kullanici: guncel });
  } catch (err) { 
    console.error("Update Hatası:", err);
    res.status(500).json({ mesaj: "Güncelleme sırasında teknik hata oluştu." }); 
  }
});

// HESAP SİLME (İlan temizleme eklendi)
app.delete('/api/auth/delete', authKontrol, async (req, res) => {
  try {
    await Araba.deleteMany({ saticiId: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.json({ mesaj: "Hesabınız başarıyla silindi." });
  } catch (err) { 
    console.error("Delete Hatası:", err);
    res.status(500).json({ mesaj: "Hesap silinirken hata oluştu." }); 
  }
});

// --- İLAN İŞLEMLERİ (Çoklu Fotoğraf Destekli) ---
app.get('/api/arabalar', async (req, res) => {
  const arabalar = await Araba.find().sort({ createdAt: -1 });
  res.json(arabalar);
});

const upload = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
})});

app.post('/api/arabalar', authKontrol, upload.array('resimler', 5), async (req, res) => {
  try {
    const veri = req.body;
    if (req.files && req.files.length > 0) veri.resimler = req.files.map(file => file.filename);
    veri.saticiId = req.user.id; 
    const yeni = new Araba(veri);
    await yeni.save();
    res.status(201).json(yeni);
  } catch (err) { res.status(400).json({ mesaj: "İlan eklenemedi." }); }
});

app.put('/api/arabalar/:id', authKontrol, upload.array('resimler', 5), async (req, res) => {
  try {
    const ilan = await Araba.findById(req.params.id);
    if (!ilan) return res.status(404).json({ mesaj: "İlan bulunamadı" });
    if (ilan.saticiId.toString() !== req.user.id && req.user.rol !== 'admin') return res.status(403).json({ mesaj: "Yetkiniz yok." });
    const veri = req.body;
    if (req.files && req.files.length > 0) veri.resimler = req.files.map(file => file.filename);
    const guncel = await Araba.findByIdAndUpdate(req.params.id, veri, { new: true });
    res.json(guncel);
  } catch (err) { res.status(400).json({ mesaj: "Güncelleme hatası." }); }
});

app.delete('/api/arabalar/:id', authKontrol, async (req, res) => {
  try {
    const ilan = await Araba.findById(req.params.id);
    if (ilan.saticiId.toString() !== req.user.id && req.user.rol !== 'admin') return res.status(403).json({ mesaj: "Yetkiniz yok." });
    await Araba.findByIdAndDelete(req.params.id);
    res.json({ mesaj: "Silindi" });
  } catch (err) { res.status(400).json({ mesaj: "Silme hatası." }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`📡 Sunucu ${PORT} portunda hazır!`));