# Oğuz Kağan Arısoy'un REST API Metotları

**API Test Videosu:** [Link](https://youtu.be/R94exoo6X5A)

[render adres](https://arabam-benzeri-site.onrender.com)

render adresine:

/api/arabalar 

eklersek renderin doğru çalıştığını görebiliriz

[vercel adres](https://32bit-garage-auwh4803q-oguzkgns-projects.vercel.app/)

## 1. Üye Olma
- **Endpoint:** `POST /auth/register`
- **Request Body:** 
  ```json
  {
    "email": "kullanici@example.com",
    "password": "Guvenli123!",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  }
  ```
- **Response:** `201 Created` - Kullanıcı başarıyla oluşturuldu

## 2. Kullanıcı Bilgilerini Görüntüleme
- **Endpoint:** `GET /users/{userId}`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı bilgileri başarıyla getirildi

## 3. Kullanıcı Bilgilerini Güncelleme
- **Endpoint:** `PUT /users/{userId}`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Request Body:** 
  ```json
  {
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "yeniemail@example.com",
    "phone": "+905551234567"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı başarıyla güncellendi

## 4. Kullanıcı Silme
- **Endpoint:** `DELETE /users/{userId}`
- **Path Parameters:** 
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli (Yönetici yetkisi veya kendi hesabını silme yetkisi)
- **Response:** `204 No Content` - Kullanıcı başarıyla silindi
