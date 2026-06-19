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

**Render (API):** Root Directory = `web/backend` · Start = `npm start`

**Vercel (Web):**

1. [Vercel Dashboard](https://vercel.com/dashboard) → proje → **Settings** → **General**
2. **Root Directory** = `web/frontend` (eski `frontend` değil!)
3. **Save** → **Deployments** → son `main` deploy → **Redeploy**
4. Canlı adres: **https://32bit-garage.vercel.app/**

> Önizleme URL'leri (`...-oguzkgns-projects.vercel.app`) eski deploy olabilir. Her zaman production domain'i kullanın.

## Ekip

Oğuz Kağan Arısoy — 32Bit Garage
