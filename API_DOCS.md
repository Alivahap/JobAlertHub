# Aktif Kullanılan API Uç Noktaları

Şu an mobil uygulamanız için yayında olan ve aktif olarak veri döndüren API listesi aşağıdadır:

### 1. Herkese Açık (Public) İlan API'ları
Mobil uygulamanızda ilanları listelemek ve filtrelemek için bunları kullanın.

*   **Tüm İlanları Listele:** `GET /api/public/announcements`
    *   *Filtreleme:* Belirli bir mesleğe göre ilan çekmek için: `/api/public/announcements?profession_id=3`
*   **İlan Detayı:** `GET /api/public/announcements/:id`
    *   Örnek: `/api/public/announcements/1`

### 2. Meslek Listesi API'ı
Kullanıcının meslek seçebilmesi için sistemdeki tüm meslekleri buradan çekin.

*   **Meslekleri Listele:** `GET /api/professional`

### 3. Kullanıcı ve Kimlik Doğrulama API'ları
*   **Kayıt:** `POST /api/auth/register`
*   **Giriş:** `POST /api/auth/login`
*   **Profil:** `GET /api/auth/user` (Bearer Token gerekir)
*   **Tercih Güncelleme:** `PUT /api/auth/notifications` (Bearer Token gerekir)

*Not: `/api/announcements` gibi diğer uç noktalar sadece web arayüzü ve yönetici işlemleri için içsel olarak kullanılmaktadır. Mobil uygulamanız için yukarıdaki `public` uç noktalarını kullanmanız en güvenli yoldur.*
