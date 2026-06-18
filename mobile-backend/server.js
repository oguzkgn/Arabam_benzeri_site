require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Araba = require('../models/Araba');
const Favorite = require('../models/Favorite');
const { authMiddleware, signToken } = require('./middleware/auth');
const { getRedis, connectRedis } = require('./config/redis');
const { connectRabbitMQ } = require('./config/rabbitmq');
const {
  getCachedListings,
  setCachedListings,
  invalidateListingsCache,
  syncFavoritesToCache,
  addFavoriteToCache,
  removeFavoriteFromCache
} = require('./services/cacheService');
const {
  emitUserRegistered,
  emitUserUpdated,
  emitUserDeleted,
  emitListingCreated,
  emitListingUpdated,
  emitListingDeleted,
  emitFavoriteAdded,
  emitFavoriteRemoved
} = require('./services/eventService');

const app = express();
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});
const upload = multer({ storage });

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
  if (!filenames?.length) return;
  filenames.forEach((filename) => {
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
}

function applyListingFilters(listings, query) {
  let result = [...listings];

  if (query.konum) result = result.filter((a) => a.konum === query.konum);
  if (query.vites) result = result.filter((a) => a.vites === query.vites);
  if (query.maxFiyat) result = result.filter((a) => Number(a.fiyat) <= Number(query.maxFiyat));
  if (query.minFiyat) result = result.filter((a) => Number(a.fiyat) >= Number(query.minFiyat));
  if (query.maxKm) result = result.filter((a) => Number(a.kilometre) <= Number(query.maxKm));

  const sort = query.sort || 'enYeni';
  if (sort === 'fiyatArtan') result.sort((a, b) => Number(a.fiyat) - Number(b.fiyat));
  else if (sort === 'fiyatAzalan') result.sort((a, b) => Number(b.fiyat) - Number(a.fiyat));
  else result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return result;
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://oguz_api:SeninSifren123@cluster0.6bfboko.mongodb.net/32bitgarage?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('[MongoDB] Bağlantı başarılı'))
  .catch((err) => console.error('[MongoDB] Bağlantı hatası:', err));

connectRedis().catch(() => console.warn('[Redis] Başlangıçta bağlanılamadı, önbellek devre dışı kalabilir'));
connectRabbitMQ().catch(() => console.warn('[RabbitMQ] Başlangıçta bağlanılamadı, olaylar kuyruğa alınamayabilir'));

// --- 1. ÜYE OLMA ---
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

    const user = new User({
      adSoyad,
      email: email.toLowerCase(),
      sifre: await bcrypt.hash(sifre, 10)
    });
    await user.save();
    await emitUserRegistered(user);

    res.status(201).json({ mesaj: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' });
  } catch (error) {
    console.error('[Register]', error);
    res.status(400).json({ mesaj: 'Kayıt işlemi başarısız.' });
  }
});

// --- 2. GİRİŞ YAPMA ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, sifre } = req.body;
    if (!email || !sifre) {
      return res.status(400).json({ mesaj: 'E-posta ve şifre zorunludur.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(sifre, user.sifre))) {
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
    console.error('[Login]', error);
    res.status(500).json({ mesaj: 'Giriş işlemi başarısız.' });
  }
});

// --- 9. PROFİL / ŞİFRE GÜNCELLEME ---
app.put('/api/auth/update', authMiddleware, async (req, res) => {
  try {
    const { adSoyad, eskiSifre, yeniSifre } = req.body;
    if (!eskiSifre) {
      return res.status(400).json({ mesaj: 'Değişiklik için mevcut şifrenizi girmelisiniz.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı.' });
    if (!(await bcrypt.compare(eskiSifre, user.sifre))) {
      return res.status(401).json({ mesaj: 'Mevcut şifre hatalı.' });
    }

    if (adSoyad) user.adSoyad = adSoyad;
    if (yeniSifre) user.sifre = await bcrypt.hash(yeniSifre, 10);
    await user.save();
    await emitUserUpdated(user._id.toString());

    res.status(200).json({
      mesaj: 'Profil güncellendi.',
      kullanici: {
        id: user._id.toString(),
        adSoyad: user.adSoyad,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(400).json({ mesaj: 'Güncelleme işlemi başarısız.' });
  }
});

// --- 10. HESAP SİLME ---
app.delete('/api/auth/delete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const redis = getRedis();
    const ilanlar = await Araba.find({ saticiId: userId });

    ilanlar.forEach((ilan) => deleteUploadFiles(ilan.resimler));
    await Araba.deleteMany({ saticiId: userId });
    await Favorite.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    await redis.del(`favorites:${userId}`);
    await invalidateListingsCache(redis);
    await emitUserDeleted(userId);

    res.status(200).json({ mesaj: 'Hesabınız ve ilanlarınız silindi.' });
  } catch (error) {
    res.status(400).json({ mesaj: 'Hesap silme işlemi başarısız.' });
  }
});

// --- 4. İLAN LİSTELEME (Redis önbellek + filtre/sıralama) ---
app.get('/api/arabalar', async (req, res) => {
  try {
    const redis = getRedis();
    let listings = await getCachedListings(redis);

    if (!listings) {
      listings = await Araba.find().sort({ createdAt: -1 }).lean();
      await setCachedListings(redis, listings);
    }

    const filtered = applyListingFilters(listings, req.query);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ mesaj: 'İlanlar getirilirken bir hata oluştu.' });
  }
});

// --- 3. YENİ İLAN VERME ---
app.post('/api/arabalar', authMiddleware, upload.array('resimler', 5), async (req, res) => {
  try {
    const arabaVerisi = parseListingBody(req.body);
    arabaVerisi.saticiId = req.user.id;

    if (req.files?.length) {
      arabaVerisi.resimler = req.files.map((f) => f.filename);
    }

    const yeniAraba = new Araba(arabaVerisi);
    await yeniAraba.save();

    await invalidateListingsCache(getRedis());
    await emitListingCreated(yeniAraba, req.user.id);

    res.status(201).json({ mesaj: 'İlan başarıyla eklendi!', ilan: yeniAraba });
  } catch (error) {
    res.status(400).json({ mesaj: 'İlan eklenemedi.', detay: error.message });
  }
});

// --- 5. İLAN GÜNCELLEME ---
app.put('/api/arabalar/:id', authMiddleware, upload.array('resimler', 5), async (req, res) => {
  try {
    const araba = await assertListingOwner(req, res);
    if (!araba) return;

    const guncelVeri = parseListingBody(req.body);
    if (req.files?.length) {
      guncelVeri.resimler = [...(araba.resimler || []), ...req.files.map((f) => f.filename)];
    }

    Object.assign(araba, guncelVeri);
    araba.saticiId = req.user.id;
    await araba.save();

    await invalidateListingsCache(getRedis());
    await emitListingUpdated(araba, req.user.id);

    res.status(200).json({ mesaj: 'İlan başarıyla güncellendi!', ilan: araba });
  } catch (error) {
    res.status(400).json({ mesaj: 'İlan güncellenemedi.', detay: error.message });
  }
});

// --- 6. İLAN SİLME ---
app.delete('/api/arabalar/:id', authMiddleware, async (req, res) => {
  try {
    const araba = await assertListingOwner(req, res);
    if (!araba) return;

    deleteUploadFiles(araba.resimler);
    await Araba.findByIdAndDelete(req.params.id);
    await Favorite.deleteMany({ ilanId: req.params.id });

    const redis = getRedis();
    await invalidateListingsCache(redis);
    await emitListingDeleted(req.params.id, req.user.id);

    res.status(200).json({ mesaj: 'İlan silindi.' });
  } catch (error) {
    res.status(400).json({ mesaj: 'Silme işlemi başarısız.' });
  }
});

// --- 7 & 8. FAVORİ EKLEME / ÇIKARMA ---
app.get('/api/favorites', authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const ilanIds = favorites.map((f) => f.ilanId);
    const ilanlar = ilanIds.length
      ? await Araba.find({ _id: { $in: ilanIds } })
      : [];

    await syncFavoritesToCache(getRedis(), req.user.id, ilanIds);
    res.status(200).json(ilanlar);
  } catch (error) {
    res.status(500).json({ mesaj: 'Favoriler getirilemedi.' });
  }
});

app.post('/api/favorites/:ilanId', authMiddleware, async (req, res) => {
  try {
    const ilan = await Araba.findById(req.params.ilanId);
    if (!ilan) return res.status(404).json({ mesaj: 'İlan bulunamadı.' });

    const existing = await Favorite.findOne({ userId: req.user.id, ilanId: req.params.ilanId });
    if (existing) {
      return res.status(200).json({ mesaj: 'İlan zaten favorilerde.' });
    }

    await Favorite.create({ userId: req.user.id, ilanId: req.params.ilanId });
    await addFavoriteToCache(getRedis(), req.user.id, req.params.ilanId);
    await emitFavoriteAdded(req.user.id, req.params.ilanId);

    res.status(201).json({ mesaj: 'İlan favorilere eklendi.' });
  } catch (error) {
    res.status(400).json({ mesaj: 'Favori eklenemedi.' });
  }
});

app.delete('/api/favorites/:ilanId', authMiddleware, async (req, res) => {
  try {
    const result = await Favorite.findOneAndDelete({
      userId: req.user.id,
      ilanId: req.params.ilanId
    });

    if (!result) {
      return res.status(404).json({ mesaj: 'Favori bulunamadı.' });
    }

    await removeFavoriteFromCache(getRedis(), req.user.id, req.params.ilanId);
    await emitFavoriteRemoved(req.user.id, req.params.ilanId);

    res.status(200).json({ mesaj: 'İlan favorilerden çıkarıldı.' });
  } catch (error) {
    res.status(400).json({ mesaj: 'Favori çıkarılamadı.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ durum: 'ok', servis: '32bitgarage-mobile-api' });
});

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`📱 Mobil API ${port} portunda çalışıyor`);
});
