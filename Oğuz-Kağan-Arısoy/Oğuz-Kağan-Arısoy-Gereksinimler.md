[render adres](https://arabam-benzeri-site.onrender.com)

render adresine:

/api/arabalar 

eklersek renderin doğru çalıştığını görebiliriz

[vercel adres](https://32bit-garage-auwh4803q-oguzkgns-projects.vercel.app/)

1) **Kayıt Olma**
- **API Metodu:** POST /api/auth/register
- **Açıklama:** Kullanıcı (öğrenci veya yerel halk) sisteme ad-soyad, email, telefon numarası ve şifre ile kayıt olur. (Not: Email adresi sistemde benzersiz olmalıdır.)

2)  **Giriş Yapma**
- **API Metodu:** POST /api/auth/login
- **Açıklama:** Kullanıcı email ve şifre ile sisteme giriş yapar. (Not: Hatalı girişlerde güvenlik sebebiyle detay verilmeden hata mesajı döner, başarılı girişte oturum token'ı üretilir.)

3) **Yeni İlan Oluşturma**
- **API Metodu:** POST /api/ads
- **Açıklama:** Kullanıcı başlık, fiyat, kategori (Motosiklet, Otomobil vb.) ve Isparta içi mahalle (Çünür, Kampüs vb.) bilgileriyle yeni bir araç ilanı oluşturur. (Not: Sadece giriş yapmış kullanıcılar ilan verebilir.)

4) **Araç İlanlarını Listeleme**
- **API Metodu:** GET /api/ads
- **Açıklama:** Sistemdeki tüm aktif araç ve motosiklet ilanları listelenir. (Not: Mahalle, kategori veya fiyat aralığına göre filtreleme yapılabilir. Herkese açıktır, giriş gerektirmez.)

5) **İlan Bilgilerini Güncelleme**
- **API Metodu:** UPDATE /api/ads/{id}
- **Açıklama:** Satıcı, yayında olan ilanının fiyatını, açıklamasını veya başlığını güncelleyebilir. (Not: Güvenlik prensipleri gereği kullanıcılar yalnızca kendi ilanlarını güncelleyebilir.)

6) **Araç İlanı Silme**
- **API Metodu:** DELETE /api/ads/{id}
- **Açıklama:** Kullanıcı, aracı satıldığında veya yayından kaldırmak istediğinde ilanını sistemden kalıcı olarak silebilir. (Not: Yalnızca ilanın sahibi veya sistem yöneticisi bu işlemi gerçekleştirebilir.)

7) **Favoriye Ekleme**
- **API Metodu:** POST /api/favorites
- **Açıklama:** Kullanıcılar fiyatını veya durumunu takip etmek istedikleri araç ilanlarını kendi favori listelerine ekleyebilir. (Not: Giriş yapmış olmak zorunludur ve aynı ilan ikinci kez favoriye eklenemez.)

8) **Favoriden Çıkarma**
- **API Metodu:** DELETE /api/favorites/{id}
- **Açıklama:** Kullanıcı daha önceden favorilerine eklediği bir araç ilanını takipten çıkarabilir ve listeden silebilir. (Not: Kullanıcı sadece kendi favori listesine müdahale edebilir.)

9) **Profil Güncelleme**
- **API Metodu:** UPDATE /api/users/{id}
- **Açıklama:** Kullanıcı iletişim numarası, ad, soyad ve şifre gibi kişisel bilgilerini güncelleyebilir. (Not: Güvenlik için giriş yapmış olmak gerekir ve kullanıcı sadece kendi bilgilerini güncelleyebilir.)

10) **Hesap Silme**
- **API Metodu:** DELETE /api/users/{id}
**Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Kullanıcı hesabını kapatmak istediğinde kullanılır. Bu işlem geri alınamaz; kullanıcının kişisel verileri, yayındaki ilanları ve favori kayıtları sistemden tamamen silinir. Güvenlik için giriş yapmış olmak gerekir.
