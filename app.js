const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB bağlantı linkin
const dbURI = "mongodb+srv://oguz:KagAn32@cluster0.6bfboko.mongodb.net/?appName=Cluster0";

// Veritabanına bağlanıyoruz
mongoose.connect(dbURI)
  .then(() => console.log("MongoDB veritabanına başarıyla bağlanıldı! 🚀"))
  .catch((err) => console.log("Veritabanı bağlantı hatası:", err));

app.get('/', (req, res) => {
  res.send('32Bit Garage API Sunucusu ve Veritabanı Çalışıyor! Isparta/SDÜ');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışmaya başladı...`);
});