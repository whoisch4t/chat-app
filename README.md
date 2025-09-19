# Chat App

Gerçek zamanlı oda bazlı sohbet uygulaması.  

## Özellikler
- ✅ **Gerçek zamanlı sohbet** (WebSocket)
- ✅ **Çoklu odalar** (sohbet-1, sohbet-2, …)
- ✅ **Kullanıcı yönetimi** (login/logout, JWT auth)
- ✅ **Mesaj geçmişi** (Prisma + PostgreSQL)
- ✅ **Dosya yükleme** (uploads klasörüne kaydetme)

---

## Proje Yapısı
```
chat-app
├── apps
│   └── ws          # WebSocket sunucusu
├── packages
│   └── db          # Prisma schema ve client
├── public
│   └── uploads     # Kullanıcı dosyaları
├── app
│   ├── (chat)      # Chat sayfası
│   ├── api         # Next.js API routes
│   └── (auth)      # Login/Register ekranları
└── README.md
```

---

## Kurulum

### 1. Repoyu klonla
```bash
git clone https://github.com/whoisch4t/chat-app.git
cd chat-app
```

### 2. Paketleri yükle
```bash
npm install
```

### 3. Ortam değişkenlerini ayarla
`.env` dosyası oluştur ve içine şunları ekle:
```env
DATABASE_URL="postgresql://kullanıcı:şifre@localhost:5432/chatapp"
JWT_SECRET="super-secret-key"
WS_PORT=4001
```

### 4. Veritabanını hazırla
```bash
npx prisma migrate dev --name init --schema ./packages/db/schema.prisma
npx prisma generate --schema ./packages/db/schema.prisma
```

### 5. Geliştirme ortamını çalıştır
```bash
npm run dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)  
- WebSocket server: [ws://localhost:4001](ws://localhost:4001)  

---

## Lisans
MIT License © 2025 [Senin İsmin]  
