# 32Bit Garage

Isparta odaklı araç ilan platformu — Web + Mobil

**GitHub:** https://github.com/oguzkgn/Arabam_benzeri_site

## Canlı adresler

| Servis | Adres |
|--------|-------|
| Web sitesi | https://32bit-garage.vercel.app/ |
| REST API | https://arabam-benzeri-site.onrender.com |

## Proje yapısı

```
Arabam_benzeri_site/
├── web/
│   ├── frontend/          → React web arayüzü (Vercel)
│   └── backend/           → Ortak REST API (Render) — web + mobil
├── mobile/
│   ├── frontend/          → Expo mobil uygulama
│   └── backend/           → Redis + RabbitMQ mobil API (opsiyonel)
├── docker-compose.yml     → Redis + RabbitMQ
└── render.yaml            → Render deploy ayarı
```

## GitHub klasör adresleri

### Web
- Frontend: https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/web/frontend
- Backend: https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/web/backend
- Backend API (`app.js`): https://github.com/oguzkgn/Arabam_benzeri_site/blob/main/web/backend/app.js

### Mobil
- Frontend: https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/mobile/frontend
- Backend: https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/mobile/backend

## Hızlı başlangıç

```bash
# Web backend
npm run start:web-backend

# Web frontend
npm run start:web-frontend

# Mobil frontend
npm run start:mobile-frontend

# Mobil backend (opsiyonel)
npm run start:mobile-backend
```

## REST API endpoint'leri

| Method | Endpoint |
|--------|----------|
| GET | `/api/arabalar` |
| POST | `/api/auth/register` |
| POST | `/api/auth/login` |
| POST | `/api/arabalar` |
| PUT | `/api/arabalar/:id` |
| DELETE | `/api/arabalar/:id` |
| PUT | `/api/auth/update` |
| DELETE | `/api/auth/delete` |
| GET | `/api/health` |

## Deploy ayarları

| Platform | Root Directory | Build | Start | Canlı adres |
|----------|----------------|-------|-------|-------------|
| **Render (API)** | `web/backend` | `npm install` | `npm start` | https://arabam-benzeri-site.onrender.com |
| **Vercel (Web)** | `web/frontend` | `npm run build` | otomatik | https://32bit-garage.vercel.app/ |

> **Render'da `web/frontend` kullanma** — bu Vercel içindir. Yanlış ayar giriş/ilan hatalarına ve boş loglara yol açar.  
> Detaylı Render kurulumu: [RENDER-AYARLARI.md](RENDER-AYARLARI.md)

### Vercel (Web sitesi)

1. [Vercel Dashboard](https://vercel.com/dashboard) → proje → **Settings** → **General**
2. **Root Directory** = `web/frontend`
3. **Save** → **Deployments** → **Redeploy**
4. Canlı adres: **https://32bit-garage.vercel.app/**

### Render (API)

1. [Render Dashboard](https://dashboard.render.com/web/srv-d796lltactks73d124bg) → **Settings** → **Build & Deploy**
2. **Root Directory** = `web/backend` (**`web/frontend` değil!**)
3. **Start Command** = `npm start`
4. **Manual Deploy** → **Deploy latest commit**
5. Loglar: [Live Logs](https://dashboard.render.com/web/srv-d796lltactks73d124bg/logs?t=app&r=live)

## Ekip

Oğuz Kağan Arısoy — 32Bit Garage
