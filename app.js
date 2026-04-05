import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// --- ISPARTA YEREL KONUMLAR LİSTESİ ---
const ISPARTA_KONUMLAR = [
  "⭐ Çünür (Kampüs Bölgesi)",
  "⭐ İyaş Bölgesi",
  "⭐ Yedişehitler",
  "⭐ Modernevler",
  "⭐ Bahçelievler",
  "⭐ Çarşı / Merkez",
  "⭐ Fatih Mahallesi",
  "Hızırbey",
  "Yayla Mahallesi",
  "Binbirevler",
  "Dere Mahallesi",
  "Gülcü",
  "Halıkent",
  "Işıkkent",
  "Karaağaç",
  "Vatan Mahallesi",
  "Eğirdir",
  "Yalvaç",
  "Gönen",
  "Atabey",
  "Keçiborlu",
  "Şarkikaraağaç",
  "Senirkent",
  "Uluborlu",
  "Sütçüler"
];

function App() {
  const [arabalar, setArabalar] = useState([]);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [resimDosyalari, setResimDosyalari] = useState([]); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); 
  const [profileMode, setProfileMode] = useState(false); 
  const [favoriler, setFavoriler] = useState([]); 
  const [sadeceFavoriler, setSadeceFavoriler] = useState(false); 

  const API_URL = "https://arabam-benzeri-site.onrender.com";

  const [authData, setAuthData] = useState({ 
    adSoyad: '', 
    email: '', 
    sifre: '', 
    eskiSifre: '', 
    yeniSifre: '' 
  });

  const [yeniIlan, setYeniIlan] = useState({
    marka: '', seri: '', model: '', yil: '', kilometre: '',
    vites: '', yakit: '', kasaTipi: '', fiyat: '', aciklama: '',
    konum: '' // Konum eklendi
  });

  const [filtreler, setFiltreler] = useState({ 
    vites: '', yakit: '', kasaTipi: '', minFiyat: '', maxFiyat: '', maxKm: '', 
    konum: '' // Filtre için konum eklendi
  });
  
  const [siralama, setSiralama] = useState('enYeni');

  useEffect(() => {
    tumIlanlariGetir();
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== "undefined") {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    const savedFavs = JSON.parse(localStorage.getItem('favoriler')) || [];
    setFavoriler(savedFavs);
  }, []);

  const tumIlanlariGetir = () => {
    axios.get(`${API_URL}/api/arabalar`)
      .then(res => setArabalar(res.data))
      .catch(err => console.error("Veri çekme hatası:", err));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const url = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    axios.post(`${API_URL}${url}`, authData)
      .then(res => {
        if (authMode === 'login') {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.kullanici));
          setUser(res.data.kullanici);
          setIsLoggedIn(true);
          setAuthData({ adSoyad: '', email: '', sifre: '', eskiSifre: '', yeniSifre: '' });
        } else {
          alert("Kayıt başarılı! Şimdi giriş yap.");
          setAuthMode('login');
        }
      }).catch(err => alert(err.response?.data?.mesaj || "Hata!"));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = {
      adSoyad: authData.adSoyad,
      eskiSifre: authData.eskiSifre,
      yeniSifre: authData.yeniSifre
    };

    axios.put(`${API_URL}/api/auth/update`, payload, { 
      headers: { 'x-auth-token': token } 
    })
      .then(res => {
        alert(res.data.mesaj || "Profil güncellendi. Güvenlik için tekrar giriş yapın.");
        handleLogout();
      }).catch(err => alert(err.response?.data?.mesaj || "Güncelleme hatası!"));
  };

  const handleAccountDelete = () => {
    if (window.confirm("Hesabınızı ve tüm ilanlarınızı kalıcı olarak silmek istediğinize emin misiniz?")) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/api/auth/delete`, { headers: { 'x-auth-token': token } })
        .then(() => { alert("Hesap silindi."); handleLogout(); })
        .catch(err => alert("Hata oluştu."));
    }
  };

  const toggleFavori = (id) => {
    let yeniFavoriler = favoriler.includes(id) ? favoriler.filter(favId => favId !== id) : [...favoriler, id];
    setFavoriler(yeniFavoriler);
    localStorage.setItem('favoriler', JSON.stringify(yeniFavoriler));
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  const handleChange = (e) => setYeniIlan({ ...yeniIlan, [e.target.name]: e.target.value });
  const handleFiltreChange = (e) => setFiltreler({ ...filtreler, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    Object.keys(yeniIlan).forEach(key => formData.append(key, yeniIlan[key]));
    if (resimDosyalari) for (let i = 0; i < resimDosyalari.length; i++) formData.append('resimler', resimDosyalari[i]);
    
    const method = duzenlenenId ? 'put' : 'post';
    const url = `${API_URL}/api/arabalar${duzenlenenId ? '/' + duzenlenenId : ''}`;
    
    axios[method](url, formData, { headers: { 'x-auth-token': token } })
      .then(() => { alert("İşlem Başarılı!"); tumIlanlariGetir(); formSifirla(); })
      .catch(err => alert(err.response?.data?.mesaj || "Hata!"));
  };

  const ilanSil = (id) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      const token = localStorage.getItem('token');
      axios.delete(`${API_URL}/api/arabalar/${id}`, { headers: { 'x-auth-token': token } })
        .then(() => tumIlanlariGetir()).catch(err => alert(err.response?.data?.mesaj || "Hata!"));
    }
  };

  const formSifirla = () => {
    setYeniIlan({ marka: '', seri: '', model: '', yil: '', kilometre: '', vites: '', yakit: '', kasaTipi: '', fiyat: '', aciklama: '', konum: '' });
    setResimDosyalari([]); setDuzenlenenId(null);
    const fileInput = document.getElementById('resim-input');
    if(fileInput) fileInput.value = '';
  };

  let islenenArabalar = [...arabalar];
  if (filtreler.vites) islenenArabalar = islenenArabalar.filter(a => a.vites === filtreler.vites);
  if (filtreler.yakit) islenenArabalar = islenenArabalar.filter(a => a.yakit.toLowerCase().includes(filtreler.yakit.toLowerCase()));
  if (filtreler.kasaTipi) islenenArabalar = islenenArabalar.filter(a => a.kasaTipi === filtreler.kasaTipi);
  if (filtreler.maxKm) islenenArabalar = islenenArabalar.filter(a => Number(a.kilometre) <= Number(filtreler.maxKm));
  if (filtreler.maxFiyat) islenenArabalar = islenenArabalar.filter(a => Number(a.fiyat) <= Number(filtreler.maxFiyat));
  if (filtreler.konum) islenenArabalar = islenenArabalar.filter(a => a.konum === filtreler.konum); // Konum filtresi aktif
  if (sadeceFavoriler) islenenArabalar = islenenArabalar.filter(a => favoriler.includes(a._id));

  islenenArabalar.sort((a, b) => {
    if (siralama === 'fiyatArtan') return Number(a.fiyat) - Number(b.fiyat);
    if (siralama === 'fiyatAzalan') return Number(b.fiyat) - Number(a.fiyat);
    if (siralama === 'kmArtan') return Number(a.kilometre) - Number(b.kilometre);
    if (siralama === 'kmAzalan') return Number(b.kilometre) - Number(a.kilometre);
    return b._id.localeCompare(a._id);
  });

  return (
    <div className="App">
      <header className="header">
        <h1 onClick={() => window.location.reload()} style={{cursor:'pointer'}}>32Bit Garage</h1>
        <div className="user-info">
          {isLoggedIn ? (
            <div className="nav-btns">
              <button onClick={() => {setSadeceFavoriler(!sadeceFavoriler); setProfileMode(false)}} className={sadeceFavoriler ? "fav-active" : ""}>Favoriler ❤️</button>
              <button onClick={() => {setProfileMode(!profileMode); setSadeceFavoriler(false); setAuthData({adSoyad:'', email:'', sifre:'', eskiSifre:'', yeniSifre:''})}}>Profil 👤</button>
              <button onClick={handleLogout} className="logout-btn">Çıkış</button>
            </div>
          ) : (
            <button onClick={() => setAuthMode('login')} className="login-btn">Giriş / Üye Ol</button>
          )}
        </div>
      </header>

      {isLoggedIn && profileMode && (
        <div className="form-kapsayici">
          <div className="auth-box profile-box">
            <h2>Profil Ayarlarım</h2>
            <form onSubmit={handleUpdateProfile}>
              <p style={{fontSize: '11px', color: 'gray', marginBottom: '10px'}}>Değiştirmek istemediğiniz alanı boş bırakın.</p>
              <label>Yeni Ad Soyad:</label>
              <input type="text" placeholder={user?.adSoyad} value={authData.adSoyad} onChange={e => setAuthData({...authData, adSoyad: e.target.value})} />
              <label>Yeni Şifre:</label>
              <input type="password" placeholder="••••••••" value={authData.yeniSifre} onChange={e => setAuthData({...authData, yeniSifre: e.target.value})} />
              <hr style={{margin: '15px 0', border: '0.5px solid #eee'}} />
              <p style={{color: '#e74c3c', fontSize: '12px', fontWeight: 'bold'}}>Onay için mevcut şifrenizi girin:</p>
              <input type="password" placeholder="Eski Şifre (Zorunlu)" value={authData.eskiSifre} onChange={e => setAuthData({...authData, eskiSifre: e.target.value})} required />
              <button type="submit" className="kaydet-btn">Bilgileri Güncelle</button>
            </form>
            <button onClick={handleAccountDelete} className="delete-acc-btn">Hesabımı Sil</button>
            <button onClick={() => setProfileMode(false)} className="iptal-btn">Kapat</button>
          </div>
        </div>
      )}

      {!isLoggedIn && (
        <div className="form-kapsayici">
          <div className="auth-box">
            <h2>{authMode === 'login' ? 'Giriş Yap' : 'Üye Ol'}</h2>
            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <input type="text" placeholder="Ad Soyad" value={authData.adSoyad} onChange={e => setAuthData({...authData, adSoyad: e.target.value})} required />
              )}
              <input type="email" placeholder="E-posta" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} required />
              <input type="password" placeholder="Şifre" value={authData.sifre} onChange={e => setAuthData({...authData, sifre: e.target.value})} required />
              <button type="submit" className="kaydet-btn">{authMode === 'login' ? 'Giriş' : 'Kayıt'}</button>
            </form>
            <p className="auth-toggle" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>Mod Değiştir</p>
          </div>
        </div>
      )}

      {isLoggedIn && !profileMode && (
        <div className="form-kapsayici">
          <div className="ilan-ekleme-alani">
            <h2>{duzenlenenId ? "İlanı Düzenle" : "Yeni İlan Ver"}</h2>
            <form onSubmit={handleSubmit} className="ilan-formu">
              <input type="text" name="marka" placeholder="Marka" value={yeniIlan.marka} onChange={handleChange} required />
              <input type="text" name="seri" placeholder="Seri" value={yeniIlan.seri} onChange={handleChange} required />
              <input type="text" name="model" placeholder="Model" value={yeniIlan.model} onChange={handleChange} required />
              <input type="number" name="yil" placeholder="Yıl" value={yeniIlan.yil} onChange={handleChange} required />
              <input type="number" name="kilometre" placeholder="KM" value={yeniIlan.kilometre} onChange={handleChange} required />
              <select name="vites" value={yeniIlan.vites} onChange={handleChange} required>
                <option value="">Vites Seç</option>
                <option value="Manuel">Manuel</option>
                <option value="Otomatik">Otomatik</option>
                <option value="Yarı Otomatik">Yarı Otomatik</option>
              </select>
              <select name="yakit" value={yeniIlan.yakit} onChange={handleChange} required>
                <option value="">Yakıt Seç</option>
                <option value="Benzin">Benzin</option>
                <option value="Dizel">Dizel</option>
                <option value="LPG">LPG</option>
                <option value="Hibrit">Hibrit</option>
                <option value="Benzin & LPG">Benzin & LPG</option>
              </select>
              
              {/* ISPARTA KONUM SEÇİMİ */}
              <select name="konum" value={yeniIlan.konum} onChange={handleChange} required>
                <option value="">Isparta - Konum Seç</option>
                {ISPARTA_KONUMLAR.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>

              <input type="number" name="fiyat" placeholder="Fiyat" value={yeniIlan.fiyat} onChange={handleChange} required />
              <input type="text" name="aciklama" placeholder="Açıklama" value={yeniIlan.aciklama} onChange={handleChange} required />
              <input type="file" id="resim-input" multiple accept="image/*" onChange={e => setResimDosyalari(e.target.files)} />
              <button type="submit" className="kaydet-btn">Onayla</button>
              {duzenlenenId && <button type="button" className="iptal-btn" onClick={formSifirla}>İptal</button>}
            </form>
          </div>
        </div>
      )}

      <div className="ilan-listesi-konteynir">
        <h2>{sadeceFavoriler ? "Favori İlanlarım ❤️" : `İlanlar (${islenenArabalar.length})`}</h2>
        <div className="filtre-paneli">
          <select value={siralama} onChange={(e) => setSiralama(e.target.value)}>
            <option value="enYeni">En Yeni</option>
            <option value="fiyatArtan">Fiyat: Artan</option>
            <option value="fiyatAzalan">Fiyat: Azalan</option>
          </select>

          {/* KONUM FİLTRESİ */}
          <select name="konum" value={filtreler.konum} onChange={handleFiltreChange}>
            <option value="">Tüm Isparta (Konum)</option>
            {ISPARTA_KONUMLAR.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>

          <input type="number" name="maxFiyat" placeholder="Maks Fiyat" onChange={handleFiltreChange} />
          <button className="temizle-btn" onClick={() => {setFiltreler({ vites:'', yakit:'', kasaTipi:'', minFiyat:'', maxFiyat:'', maxKm:'', konum:'' }); setSadeceFavoriler(false)}}>Temizle</button>
        </div>

        <div className="liste-grid">
          {islenenArabalar.map(a => (
            <div key={a._id} className="araba-kart-konteynir">
              <div className="araba-kart-resim-alani">
                {isLoggedIn && <div className={`fav-icon ${favoriler.includes(a._id) ? 'active' : ''}`} onClick={() => toggleFavori(a._id)}>{favoriler.includes(a._id) ? '❤️' : '🤍'}</div>}
                {a.resimler && a.resimler.length > 0 ? (
                  <img src={`${API_URL}/uploads/${a.resimler[0]}`} alt="Araba" className="araba-kart-resim" />
                ) : (
                  <div className="resim-yok-alani">Fotoğraf Yok</div>
                )}
              </div>
              <div className="kart-bilgi">
                <h3 className="ilan-baslik">{a.marka} {a.seri}</h3>
                <p className="fiyat">{a.fiyat} TL</p>
                <p className="konum-etiket">📍 {a.konum}</p> {/* KONUM KARTTA GÖRÜNSÜN */}
                <p className="ozellik-metin">{a.model} - {a.yil} - {a.kilometre} KM</p>
                
                {isLoggedIn && (
                  String(user?.id || user?._id) === String(a.saticiId) || 
                  user?.rol === 'admin'
                ) && (
                  <div className="kart-butonlar">
                    <button className="btn-duzenle" onClick={() => { setYeniIlan(a); setDuzenlenenId(a._id); setProfileMode(false); window.scrollTo(0,0); }}>Düzenle</button>
                    <button className="btn-sil" onClick={() => ilanSil(a._id)}>Sil</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;