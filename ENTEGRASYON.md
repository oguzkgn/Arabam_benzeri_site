# 32Bit Garage — Entegrasyon Dokümantasyonu

Video sunumu için teknik özet.

## 1. Redis Entegrasyonu

**Dosyalar:**
- `web/backend/config/redis.js`
- `web/backend/services/cacheService.js`

**Ne yapar?**
- `GET /api/arabalar` isteğinde ilan listesini Redis'te önbelleğe alır
- İlan ekleme/güncelleme/silme sonrası önbelleği temizler

**Test:**
```bash
cd web/backend
REDIS_URL=redis://localhost:6379 npm run test:redis
```

**Sağlık kontrolü:**
```
GET https://arabam-benzeri-site.onrender.com/api/health
→ entegrasyonlar.redis: "bagli"
```

---

## 2. RabbitMQ Entegrasyonu

**Dosyalar:**
- `web/backend/config/rabbitmq.js`
- `web/backend/services/eventService.js`
- `web/backend/workers/eventWorker.js`

**Ne yapar?**
- Üye olma → `user.registered` olayı
- İlan ekleme → `listing.created` olayı
- İlan güncelleme → `listing.updated` olayı
- İlan silme → `listing.deleted` olayı

**Worker başlatma:**
```bash
cd web/backend
npm run worker
```

**RabbitMQ Yönetim Paneli:** http://localhost:15672 (guest/guest)

---

## 3. Docker Entegrasyonu

**Dosyalar:**
- `docker-compose.yml`
- `web/backend/Dockerfile`

**Servisler:**
| Container | Açıklama |
|-----------|----------|
| 32bitgarage-redis | Redis |
| 32bitgarage-rabbitmq | RabbitMQ |
| 32bitgarage-api | REST API |
| 32bitgarage-worker | Olay dinleyici |

**Çalıştırma:**
```bash
# .env dosyasına MONGO_URI ekle
docker compose up -d --build
docker compose ps
curl http://localhost:5000/api/health
```

---

## 4. CI/CD Entegrasyonu (GitHub Actions)

**Dosya:** `.github/workflows/ci-cd.yml`

**GitHub'da görünen işler:**
1. Backend Syntax Kontrolü
2. Redis Entegrasyon Testi
3. RabbitMQ Entegrasyon Testi
4. Docker Image Build
5. Web Frontend Build
6. Mobil Frontend Kontrolü
7. CI/CD Özet — Tüm Testler

**GitHub Actions adresi:**
https://github.com/oguzkgn/Arabam_benzeri_site/actions

---

## 10 Gereksinim — Entegrasyon Eşlemesi

| # | Gereksinim | Entegrasyon |
|---|-----------|-------------|
| 1 | Üye Olma | RabbitMQ `user.registered` |
| 4 | İlan Listeleme | Redis önbellek |
| 3 | İlan Verme | RabbitMQ `listing.created` + Redis invalidation |
| 5 | İlan Güncelleme | RabbitMQ `listing.updated` |
| 6 | İlan Silme | RabbitMQ `listing.deleted` |
