# Render Deploy Ayarları — 32Bit Garage API

> **ÖNEMLİ:** Render = **API (backend)** · Vercel = **Web sitesi (frontend)**

| Platform | Root Directory | Ne deploy edilir? |
|----------|----------------|-------------------|
| **Render** | `web/backend` | REST API (giriş, kayıt, ilanlar) |
| **Vercel** | `web/frontend` | React web arayüzü |

`web/frontend` Render'a **yazılmamalı** — bu klasör Vercel içindir. Render'da bu ayarla deploy edersen giriş/ilan istekleri hata verir ve loglarda API işlemleri görünmez.

---

## Render Dashboard — Adım adım

1. [Render Dashboard](https://dashboard.render.com/web/srv-d796lltactks73d124bg) → **arabam-benzeri-site** servisi
2. **Settings** → **Build & Deploy**
3. Şu değerleri gir:

| Ayar | Değer |
|------|-------|
| **Root Directory** | `web/backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

4. **Environment** sekmesinde **sadece bunlar zorunlu**:

| Key | Değer | Zorunlu |
|-----|-------|---------|
| `MONGO_URI` | MongoDB bağlantı adresin | ✅ Evet |
| `JWT_SECRET` | Güçlü rastgele bir anahtar | ✅ Evet |

> `NODE_ENV` Render'da görünmese de sorun değil — API buna ihtiyaç duymaz.  
> Render çoğu zaman bunu otomatik ayarlar; elle eklemek istersen: **Add Environment Variable** → Key: `NODE_ENV`, Value: `production`

**Eklemene gerek olmayanlar** (lokal Docker içindir):

| Key | Neden ekleme? |
|-----|---------------|
| `REDIS_URL` | Render'da Redis yok — ekleyince hata alırsın |
| `RABBITMQ_URL` | Render'da RabbitMQ yok |

5. **Save Changes**
6. **Manual Deploy** → **Deploy latest commit**

---

## Loglarda ne görmelisin?

Deploy başarılı olunca [Live Logs](https://dashboard.render.com/web/srv-d796lltactks73d124bg/logs?t=app&r=live) ekranında:

```
[BOOT] 32Bit Garage API başlatıldı — http://0.0.0.0:10000
[BOOT] Render loglarında [HTTP], [AUTH] ve [ILAN] satırlarını göreceksiniz.
MongoDB Veritabanına Başarıyla Bağlanıldı!
```

Giriş/kayıt yapınca:

```
[HTTP] POST /api/auth/login → 401 (45ms) ip=...
[AUTH] Giriş başarısız — şifre hatalı {"email":"og***@gmail.com"}
[AUTH] Giriş başarılı {"email":"og***@gmail.com","kullaniciId":"..."}
```

---

## Canlı test

```bash
curl https://arabam-benzeri-site.onrender.com/api/health
```

---

## Sık yapılan hata

| Yanlış | Doğru |
|--------|-------|
| Render Root = `web/frontend` | Render Root = `web/backend` |
| Vercel Root = `web/backend` | Vercel Root = `web/frontend` |
