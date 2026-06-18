# 32Bit Garage Mobil Uygulama

Bu klasörler, mevcut **ARABAM_BENZERI_SITE** web projesiyle aynı MongoDB veritabanını paylaşan mobil uygulama katmanını içerir.

## Proje Yapısı

```
mobile-backend/     → REST API (Express + Redis + RabbitMQ)
mobile-frontend/  → React Native (Expo) mobil uygulama
models/Favorite.js  → Web ve mobil için ortak favori modeli
docker-compose.yml  → Redis ve RabbitMQ servisleri
```

## Sistem Gereksinimleri (10 Özellik)

| # | Özellik | Mobil API | Ekran |
|---|---------|-----------|-------|
| 1 | Üye Olma | `POST /api/auth/register` | AuthScreen |
| 2 | Giriş Yapma | `POST /api/auth/login` | AuthScreen |
| 3 | Yeni İlan Verme | `POST /api/arabalar` | ListingFormScreen |
| 4 | İlan Listeleme | `GET /api/arabalar` | HomeScreen |
| 5 | İlan Güncelleme | `PUT /api/arabalar/:id` | ListingFormScreen |
| 6 | İlan Silme | `DELETE /api/arabalar/:id` | HomeScreen |
| 7 | Favoriye Ekleme | `POST /api/favorites/:ilanId` | HomeScreen |
| 8 | Favoriden Çıkarma | `DELETE /api/favorites/:ilanId` | FavoritesScreen |
| 9 | Profil/Şifre Güncelleme | `PUT /api/auth/update` | ProfileScreen |
| 10 | Hesap Silme | `DELETE /api/auth/delete` | ProfileScreen |

## Teknolojiler

- **Redis:** İlan listesi önbelleği, kullanıcı favori setleri
- **RabbitMQ:** Kayıt, ilan ve favori olaylarının asenkron yayını
- **MongoDB:** Web projesiyle ortak `User`, `Araba`, `Favorite` koleksiyonları
- **JWT:** Oturum yönetimi (`x-auth-token` header)

## Kurulum

### 1. Redis ve RabbitMQ

```bash
docker compose up -d
```

RabbitMQ yönetim paneli: http://localhost:15672 (guest/guest)

### 2. Mobil Backend

```bash
cd mobile-backend
cp .env.example .env
npm install
npm start
```

API varsayılan olarak **5001** portunda çalışır. Web backend **5000** portundadır.

### 3. Olay Worker (opsiyonel)

```bash
cd mobile-backend
npm run worker
```

### 4. Mobil Frontend

```bash
cd mobile-frontend
npm install
npm start
```

Fiziksel cihazda test için bilgisayar IP'nizi kullanın:

```bash
set EXPO_PUBLIC_API_URL=http://192.168.1.X:5001
npm start
```

## Web Projesiyle Entegrasyon

- Aynı MongoDB veritabanı (`32bitgarage`)
- Aynı `uploads/` klasörü (ilan fotoğrafları)
- Aynı kullanıcı hesapları (web'de kayıt olan mobilde de giriş yapabilir)
- Web favorileri `localStorage`'da, mobil favorileri `Favorite` koleksiyonunda (sunucu tarafı)

## Güvenlik

- İlan oluşturma/güncelleme/silme JWT ile korunur
- `saticiId` sunucu tarafında atanır, sahiplik kontrolü yapılır
- Sadece ilan sahibi Düzenle/Sil butonlarını görür
