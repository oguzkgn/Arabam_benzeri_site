# 32Bit Garage — Mobil

## Klasörler

| Klasör | Açıklama | GitHub |
|--------|----------|--------|
| `mobile/frontend/` | Expo React Native uygulaması | [mobile/frontend](https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/mobile/frontend) |
| `mobile/backend/` | Redis + RabbitMQ mobil API (opsiyonel) | [mobile/backend](https://github.com/oguzkgn/Arabam_benzeri_site/tree/main/mobile/backend) |

## API adresi

Mobil uygulama, web ile **aynı production API**'yi kullanır:

```
https://arabam-benzeri-site.onrender.com
```

Tanım: `mobile/frontend/src/constants/config.js`

## Çalıştırma

```bash
# Redis + RabbitMQ
docker compose up -d

# Mobil backend (opsiyonel, port 5001)
cd mobile/backend
npm install
npm start

# Mobil frontend (Expo)
cd mobile/frontend
npm install
npx expo start --clear
```

## 10 özellik

1. Üye ol · 2. Giriş · 3. İlan ver · 4. Listele · 5. Güncelle · 6. Sil · 7. Favori ekle · 8. Favori çıkar · 9. Profil güncelle · 10. Hesap sil
