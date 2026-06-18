// Web sitesiyle aynı production API
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://arabam-benzeri-site.onrender.com';

export const ISPARTA_KONUMLAR = [
  '⭐ Çünür (Kampüs Bölgesi)',
  '⭐ İyaş Bölgesi',
  '⭐ Yedişehitler',
  '⭐ Modernevler',
  '⭐ Bahçelievler',
  '⭐ Çarşı / Merkez',
  '⭐ Fatih Mahallesi',
  'Hızırbey',
  'Yayla Mahallesi',
  'Binbirevler',
  'Dere Mahallesi',
  'Gülcü',
  'Halıkent',
  'Işıkkent',
  'Karaağaç',
  'Vatan Mahallesi',
  'Eğirdir',
  'Yalvaç',
  'Gönen',
  'Atabey',
  'Keçiborlu',
  'Şarkikaraağaç',
  'Senirkent',
  'Uluborlu',
  'Sütçüler'
];

export const VITES_OPTIONS = ['Manuel', 'Otomatik', 'Yarı Otomatik'];
export const YAKIT_OPTIONS = ['Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit', 'Benzin & LPG'];
export const KASA_OPTIONS = ['Sedan', 'Hatchback', 'SUV', 'Station Wagon', 'Coupe'];

export const SORT_OPTIONS = [
  { value: 'enYeni', label: 'En Yeni' },
  { value: 'fiyatArtan', label: 'Fiyat ↑' },
  { value: 'fiyatAzalan', label: 'Fiyat ↓' },
  { value: 'kmArtan', label: 'KM ↑' },
  { value: 'kmAzalan', label: 'KM ↓' }
];
