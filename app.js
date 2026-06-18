require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const Araba = require('./models/Araba');
const User = require('./models/User');
const { authMiddleware, signToken } = require('./middleware/auth');

const app = express();

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

const LISTING_FIELDS = ['marka', 'seri', 'model', 'yil', 'kilometre', 'vites', 'yakit', 'kasaTipi', 'fiyat', 'aciklama', 'konum'];

function parseListingBody(body) {
  const data = {};
  for (const key of LISTING_FIELDS) {
    if (body[key] !== undefined && body[key] !== '') {
      data[key] = ['yil', 'kilometre', 'fiyat'].includes(key) ? Number(body[key]) : body[key];
    }
  }
  return data;
}

async function assertListingOwner(req, res) {
  const araba = await Araba.findById(req.params.id);
  if (!araba) {
    res.status(404).json({ mesaj: 'İlan bulunamadı.' });
    return null;
  }
  if (String(araba.saticiId) !== String(req.user.id)) {
    res.status(403).json({ mesaj: 'Bu işlem için yetkiniz yok.' });
    return null;
  }
  return araba;
}

function deleteUploadFiles(filenames) {
  if (!filenames || filenames.length === 0) return;
  filenames.forEach((filename) => {
    const filePath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://oguz_api:SeninSifren123@cluster0.6bfboko.mongodb.net/32bitgarage?appName=Cluster0";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000
})
  .then(() => console.log("MongoDB Veritabanına Başarıyla Bağlanıldı!"))
  .catch(err => console.error("MongoDB Bağlantı Hatası:", err));

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

// --- KÖK VE SAĞLIK KONTROLÜ (Render / tarayıcı testi için) ---
app.get('/', (_req, res) => {
  res.status(200).json({
    mesaj: '32Bit Garage API çalışıyor',
    durum: 'ok',
    veritabani: isDbReady() ? 'bagli' : 'baglanti_bekleniyor',
    endpointler: {
      ilanlar: 'GET /api/arabalar',
      giris: 'POST /api/auth/login',
      kayit: 'POST /api/auth/register',
      saglik: 'GET /api/health'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    durum: 'ok',
    servis: '32bitgarage-api',
    veritabani: isDbReady() ? 'bagli' : 'baglanti_bekleniyor',
    zaman: new Date().toISOString()
  });
});

// --- AUTH ROTALARI ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { adSoyad, email, sifre } = req.body;
    if (!adSoyad || !email || !sifre) {
      return res.status(400).json({ mesaj: 'Tüm alanlar zorunludur.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ mesaj: 'Bu e-posta zaten kayıtlı.' });
    }

    const hashedSifre = await bcrypt.hash(sifre, 10);
    const user = new User({
      adSoyad,
      email: email.toLowerCase(),
      sifre: hashedSifre
    });
    await user.save();

    res.status(201).json({ mesaj: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('Kayıt Hatası:', error);
    res.status(400).json({ mesaj: 'Kayıt işlemi başarısız.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, sifre } = req.body;
    if (!email || !sifre) {
      return res.status(400).json({ mesaj: 'E-posta ve şifre zorunludur.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.' });
    }

    const isMatch = await bcrypt.compare(sifre, user.sifre);
    if (!isMatch) {
      return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.' });
    }

    const token = signToken(user);
    res.status(200).json({
      token,
      kullanici: {
        id: user._id.toString(),
        adSoyad: user.adSoyad,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Giriş Hatası:', error);
    res.status(500).json({ mesaj: 'Giriş işlemi başarısız.' });
  }
});

app.put('/api/auth/update', authMiddleware, async (req, res) => {
  try {
    const { adSoyad, eskiSifre, yeniSifre } = req.body;
    if (!eskiSifre) {
      return res.status(400).json({ mesaj: 'Değişiklik için mevcut şifrenizi girmelisiniz.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı.' });
    }

    const isMatch = await bcrypt.compare(eskiSifre, user.sifre);
    if (!isMatch) {
      return res.status(401).json({ mesaj: 'Mevcut şifre hatalı.' });
    }

    if (adSoyad) user.adSoyad = adSoyad;
    if (yeniSifre) user.sifre = await bcrypt.hash(yeniSifre, 10);

    await user.save();
    res.status(200).json({ mesaj: 'Profil güncellendi. Güvenlik için tekrar giriş yapın.' });
  } catch (error) {
    console.error('Profil Güncelleme Hatası:', error);
    res.status(400).json({ mesaj: 'Güncelleme işlemi başarısız.' });
  }
});

app.delete('/api/auth/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const kullaniciIlanlari = await Araba.find({ saticiId: userId });

    kullaniciIlanlari.forEach((ilan) => {
      deleteUploadFiles(ilan.resimler);
    });

    await Araba.deleteMany({ saticiId: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({ mesaj: 'Hesabınız ve ilanlarınız silindi.' });
  } catch (error) {
    console.error('Hesap Silme Hatası:', error);
    res.status(400).json({ mesaj: 'Hesap silme işlemi başarısız.' });
  }
});

// --- İLAN ROTALARI ---

app.get('/api/arabalar', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ mesaj: 'Veritabanı bağlantısı kuruluyor. Lütfen tekrar deneyin.' });
    }
    const arabalar = await Araba.find().sort({ createdAt: -1 });
    res.status(200).json(arabalar);
  } catch (error) {
    console.error('İlan listeleme hatası:', error);
    res.status(500).json({ mesaj: "İlanlar getirilirken bir hata oluştu." });
  }
});

app.post('/api/arabalar', authMiddleware, upload.array('resimler', 5), async (req, res) => {
  try {
    const arabaVerisi = parseListingBody(req.body);
    arabaVerisi.saticiId = req.user.id;

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

app.put('/api/arabalar/:id', authMiddleware, upload.array('resimler', 5), async (req, res) => {
  try {
    const araba = await assertListingOwner(req, res);
    if (!araba) return;

    const guncelVeri = parseListingBody(req.body);

    if (req.files && req.files.length > 0) {
      const yeniResimler = req.files.map(file => file.filename);
      guncelVeri.resimler = [...(araba.resimler || []), ...yeniResimler];
    }

    Object.assign(araba, guncelVeri);
    araba.saticiId = req.user.id;
    await araba.save();

    res.status(200).json({ mesaj: "İlan başarıyla güncellendi!", ilan: araba });
  } catch (error) {
    console.error("Güncelleme Hatası:", error);
    res.status(400).json({ mesaj: "İlan güncellenemedi.", detay: error.message });
  }
});

app.delete('/api/arabalar/:id', authMiddleware, async (req, res) => {
  try {
    const araba = await assertListingOwner(req, res);
    if (!araba) return;

    deleteUploadFiles(araba.resimler);
    await Araba.findByIdAndDelete(req.params.id);
    res.status(200).json({ mesaj: "İlan silindi." });
  } catch (error) {
    res.status(400).json({ mesaj: "Silme işlemi başarısız." });
  }
});

const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`🚀 Sunucu http://${host}:${port} adresinde çalışıyor!`);
});
