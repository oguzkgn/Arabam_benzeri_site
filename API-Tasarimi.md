# API Tasarımı - OpenAPI Specification Örneği

**OpenAPI Spesifikasyon Dosyası:** [lamine.yaml](lamine.yaml)

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: 32Bit Garage API
  description: |
    Isparta yerel halkı ve üniversite öğrencileri için geliştirilmiş ikinci el araç ve motosiklet platformu RESTful API tasarımı.
    
    ## Özellikler
    - Kullanıcı Kimlik Doğrulama (Kayıt / Giriş)
    - Araç İlanı Yönetimi
    - Favori İlan İşlemleri
    - Profil Yönetimi
    - JWT tabanlı yetkilendirme
  version: 1.0.0
  contact:
    name: 32Bit Garage Destek Ekibi
    email: api-support@32bitgarage.com

servers:
  - url: https://api.32bitgarage.com/v1
    description: Production server
  - url: http://localhost:5000/api
    description: Development server

tags:
  - name: auth
    description: Kimlik doğrulama işlemleri
  - name: ads
    description: Araç ve motosiklet ilanı işlemleri
  - name: favorites
    description: İlan favoriye ekleme/çıkarma işlemleri
  - name: users
    description: Kullanıcı profili işlemleri

paths:
  /auth/register:
    post:
      tags:
        - auth
      summary: 1. Üye Olma İşlemi
      description: Sisteme yeni bir kullanıcı kaydeder.
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistration'
      responses:
        '201':
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'

  /auth/login:
    post:
      tags:
        - auth
      summary: 2. Giriş Yapma İşlemi
      description: Email ve şifre ile giriş yapar, oturum için JWT token döner.
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /ads:
    get:
      tags:
        - ads
      summary: 4. Araç İlanlarını Listeleme
      description: Sistemdeki tüm aktif araç ve motosiklet ilanlarını listeler (sayfalama ve mahalle filtresi ile).
      operationId: listAds
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: mahalle
          in: query
          description: İsparta içi mahalle filtresi (Örn. Çünür)
          schema:
            type: string
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AdList'
                
    post:
      tags:
        - ads
      summary: 3. Yeni Araç/Motosiklet İlanı Verme İşlemi
      description: Sisteme yeni bir taşıt ilanı ekler.
      operationId: createAd
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AdCreate'
      responses:
        '201':
          description: İlan başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Ad'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /ads/{adId}:
    put:
      tags:
        - ads
      summary: 5. İlan Bilgilerini Güncelleme
      description: İlanın başlık, fiyat ve açıklama gibi bilgilerini günceller.
      operationId: updateAd
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/AdIdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AdUpdate'
      responses:
        '200':
          description: İlan başarıyla güncellendi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      tags:
        - ads
      summary: 6. Araç İlanını Sistemden Silme
      description: Kullanıcının kendi ilanını sistemden kalıcı olarak silmesini sağlar.
      operationId: deleteAd
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/AdIdParam'
      responses:
        '204':
          description: İlan başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /favorites:
    post:
      tags:
        - favorites
      summary: 7. İlanı Favorilere Ekleme
      description: Belirli bir ilanı kullanıcının favori listesine ekler.
      operationId: addFavorite
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - adId
              properties:
                adId:
                  type: string
                  format: uuid
      responses:
        '201':
          description: İlan favorilere eklendi
        '401':
          $ref: '#/components/responses/Unauthorized'

  /favorites/{adId}:
    delete:
      tags:
        - favorites
      summary: 8. İlanı Favorilerden Çıkarma
      description: İlanı kullanıcının favori listesinden siler.
      operationId: removeFavorite
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/AdIdParam'
      responses:
        '204':
          description: Favorilerden başarıyla çıkarıldı
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /users/{userId}:
    put:
      tags:
        - users
      summary: 9. Profil Bilgilerini Güncelleme
      description: Kullanıcının kişisel bilgilerini veya şifresini günceller.
      operationId: updateUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserIdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: Profil başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

    delete:
      tags:
        - users
      summary: 10. Kullanıcı Hesabını Silme
      description: Kullanıcıyı ve ona ait tüm verileri sistemden siler.
      operationId: deleteUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserIdParam'
      responses:
        '204':
          description: Hesap başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama

  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      description: Kullanıcı ID'si
      schema:
        type: string
        format: uuid
        
    AdIdParam:
      name: adId
      in: path
      required: true
      description: İlan ID'si
      schema:
        type: string
        format: uuid
        
    PageParam:
      name: page
      in: query
      description: Sayfa numarası
      schema:
        type: integer
        minimum: 1
        default: 1
        
    LimitParam:
      name: limit
      in: query
      description: Sayfa başına kayıt sayısı
      schema:
        type: integer
        minimum: 1
        maximum: 50
        default: 20

  schemas:
    User:
      type: object
      required:
        - id
        - email
        - firstName
        - lastName
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string

    UserRegistration:
      type: object
      required:
        - email
        - password
        - firstName
        - lastName
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
          minLength: 6
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string

    LoginCredentials:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    AuthToken:
      type: object
      required:
        - token
      properties:
        token:
          type: string
        expiresIn:
          type: integer
        user:
          $ref: '#/components/schemas/User'

    UserUpdate:
      type: object
      properties:
        firstName:
          type: string
        lastName:
          type: string
        phone:
          type: string
        password:
          type: string
          format: password

    Ad:
      type: object
      required:
        - id
        - title
        - price
        - mahalle
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          example: "Sahibinden Temiz Motosiklet"
        description:
          type: string
        price:
          type: number
          format: float
        mahalle:
          type: string
          example: "Çünür"
        createdAt:
          type: string
          format: date-time

    AdCreate:
      type: object
      required:
        - title
        - price
        - mahalle
      properties:
        title:
          type: string
        description:
          type: string
        price:
          type: number
          format: float
        mahalle:
          type: string

    AdUpdate:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        price:
          type: number
          format: float
        mahalle:
          type: string

    AdList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Ad'
        pagination:
          type: object
          properties:
            page:
              type: integer
            totalPages:
              type: integer

    Error:
      type: object
      required:
        - message
      properties:
        code:
          type: string
        message:
          type: string

  responses:
    BadRequest:
      description: Geçersiz istek (Eksik veya hatalı parametre)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Yetkisiz erişim (Token eksik veya geçersiz)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Forbidden:
      description: Erişim reddedildi (Bu işlem için yetki yok)
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: İstenen kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
