# Kamu İlan Takip - Proje Dokümantasyonu

Bu belge, Kamu İlan Takip platformunun teknik detaylarını, API yapısını ve yönetim bilgilerini içerir.

## 1. Genel Bakış
Kamu İlan Takip, Türkiye'deki kamu iş ilanlarını takip eden, meslek bazlı filtreleme ve bildirim desteği sunan bir platformdur.

## 2. Yönetici (Admin) Bilgileri
Sistemi yönetmek için aşağıdaki varsayılan yönetici hesabını kullanabilirsiniz:
- **E-posta:** `demo@demo.com`
- **Şifre:** `password`
- **Yetki:** Tam Erişim (İlan Ekleme/Silme/Düzenleme, Meslek Yönetimi)

## 3. Aktif API Uç Noktaları

### 3.1. Herkese Açık (Public) API'lar

#### İlanları Listele (Sayfalamalı)
- **URL:** `/api/public/announcements`
- **Metot:** `GET`
- **Parametreler:**
  - `page` (isteğe bağlı): Sayfa numarası (varsayılan: 1)
  - `profession_id` (isteğe bağlı): Meslek ID'sine göre filtreleme
- **Yanıt:**
```json
{
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### İlan Detayı
- **URL:** `/api/public/announcements/:id`
- **Metot:** `GET`

#### Meslek Listesi
- **URL:** `/api/professionals`
- **Metot:** `GET`

### 3.2. Kullanıcı API'ları (Yetki Gerekir)
- **Kayıt:** `POST /api/auth/register`
- **Giriş:** `POST /api/auth/login`
- **Profil:** `GET /api/auth/user`
- **Ayarlar:** `PUT /api/auth/notifications` (E-posta bildirim tercihi)

## 4. Teknik Mimari
- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express
- **Veritabanı:** PostgreSQL + Drizzle ORM
- **Özellikler:** PWA Desteği, Bildirim Tercihleri, Admin Paneli
