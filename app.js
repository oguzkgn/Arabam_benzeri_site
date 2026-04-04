const express = require('express');
const cors = require('cors');

// Express uygulamasını başlatıyoruz
const app = express();

// Gelen JSON verilerini okuyabilmek ve dış bağlantılara izin vermek için ayarlar
app.use(express.json());
app.use(cors());

// Ana sayfaya girildiğinde çalışacak basit bir test mesajı
app.get('/', (req, res) => {
  res.send('32Bit Garage API Sunucusu Başarıyla Çalışıyor! Isparta/SDÜ');
});

// Sunucuyu 5000 portunda ayağa kaldırıyoruz
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışmaya başladı...`);
  console.log(`Test etmek için tarayıcıda şu adrese git: http://localhost:${PORT}`);
});