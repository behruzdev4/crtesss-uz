# cressuz — Telegram Mini App (kiyim-kechak do'koni)

Uzum Market uslubidagi Telegram mini app: katalog, savat, karta orqali to'lov,
chekni yuklash va admin tomonidan tasdiqlash.

## Texnologiyalar

- **Next.js 16 (App Router) + React 19 + TypeScript**
- **PostgreSQL + Drizzle ORM** (`src/db/schema.ts`)
- **Tailwind CSS v4** (mobile-first, mini app dizayni)
- **Telegram WebApp** (`telegram-web-app.js`, `initData` HMAC tekshiruvi)
- **Telegram Bot API** (webhook: `/start`, buyurtma/to'lov xabarlari, inline tasdiqlash)

## Asosiy imkoniyatlar

1. **Do'kon (mini app)**
   - Boshlang'ich sahifa: qidiruv, kategoriyalar, yangi mahsulotlar, chegirmalar
   - Katalog: kategoriya, qidiruv va narx bo'yicha saralash
   - Mahsulot kartasi: galereya, o'lcham, miqdor, savatga qo'shish
   - Savat: miqdor, yetkazish manzili, to'lov usuli (karta / naqd)
2. **To'lov va chek**
   - Buyurtmadan keyin karta raqami ko'rsatiladi va **bir tugma bilan nusxalanadi**
   - Chek rasmi (JPG/PNG/WEBP) mini appda siqilib (canvas) yuklanadi
   - Chek holati: tekshirilmoqda / tasdiqlandi / rad etildi + admin izohi
3. **Admin panel** (`/admin`)
   - Dashboard: tushum, buyurtmalar, tasdiqlash kutayotgan cheklar
   - Chekni tasdiqlash / rad etish, buyurtma holatini o'zgartirish
   - Mahsulot qo'shish, tahrirlash, arxivlash (rasm, narx, o'lcham, badge)
   - Sozlamalar: karta raqami, yetkazish narxi, do'kon nomi, bot integratsiyasi
4. **Bot**
   - `/start` — mini appni taklif qiladi (Web App tugmasi) va to'lov qo'llanmasi
   - Yangi buyurtma va yangi chek haqida adminga xabar
   - To'lov tasdiqlanganda / holat o'zgarganda mijozga xabar
   - Botdagi inline `Tasdiqlash` / `Rad etish` tugmalari

## Ishga tushirish

```bash
npm install
cp .env.example .env        # DATABASE_URL va boshqa kalitlarni to'ldiring
npx drizzle-kit push        # jadvalarni yaratish
npm run dev                 # dev server
npm run build && npm start  # production
```

Ilova birinchi ochilganda kategoriya/mahsulot/sozlamalar avtomatik seed qilinadi.

## Muhit o'zgaruvchilari

| Kalit | Tavsif |
| --- | --- |
| `DATABASE_URL` | PostgreSQL ulanish manzili |
| `TELEGRAM_BOT_TOKEN` | BotFather bergan token (initData imzosi + xabarlar) |
| `APP_URL` | Mini appning https manzili (webhook tugmasi uchun) |
| `ADMIN_IDS` | Admin Telegram ID lari, vergul bilan |
| `ADMIN_CHAT_ID` | Yangi buyurtma/chek xabarlari uchun chat ID (ixtiyoriy) |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook uchun secret token (ixtiyoriy) |
| `SESSION_SECRET` | Sessiya cookie imzosi uchun kalit |

## Vaqtinchalik server — 3 variant

Telegram Web App faqat **public HTTPS** manzilda ochiladi (`http://localhost` telefondan
ishlamaydi). Quyidagi variantlardan birini tanlang.

### 1) Tunnel — eng tez yo'l (lokal kompyuterda, 5 daqiqa)

Lokal Postgres bilan loyihani ishga tushiring:

```bash
npm install
npx drizzle-kit push
npm run build && npm start        # yoki: npm run dev
```

Boshqa terminalda HTTPS tunnel oching:

```bash
# Cloudflare (hisobsiz, eng barqaror)
npx cloudflared tunnel --url http://localhost:3000

# yoki ngrok
ngrok http 3000

# yoki localtunnel
npx localtunnel --port 3000
```

Tunnel bergan `https://...` manzilni `.env` ga yozing va serverni qayta ishga tushiring:

```env
APP_URL=https://sizning-tunnel-url.example.com
TELEGRAM_BOT_TOKEN=123456:AA...
ADMIN_IDS=123456789
SESSION_SECRET=uzun-tasodifiy-matn
```

So'ng **Admin → Sozlamalar → “Webhook”** tugmasini bosing: webhook, buyruqlar va menu
tugmasi avtomatik o'rnatiladi. Botga `/start` yozib mini appni oching.

> Tunnel bepul variantida manzil har ishga tushirishda o'zgaradi — `APP_URL` ni yangilab,
> “Webhook” tugmasini qayta bosing. ngrok’da `--domain=...` (reserved domain) bilan
> doimiy manzil olish mumkin.

### 2) Vercel + bepul bulutli Postgres (doimiyroq demo)

1. Postgres: [Neon](https://neon.tech) yoki [Supabase](https://supabase.com) da bepul baza
   yarating va connection string (`?sslmode=require`) oling.
2. GitHub'ga repo qo'ying → [vercel.com](https://vercel.com) da import qiling.
3. Environment Variables:
   `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `APP_URL` (Vercel domeningiz),
   `ADMIN_IDS`, `SESSION_SECRET`.
4. Jadval + namunaviy mahsulotlar: lokal terminalda `.env` ga Neon URLini qo'yib
   `npx drizzle-kit push` (yoki Vercel Build Command ga vaqtincha qo'shib, keyin olib
   tashlang). Birinchi sahifa ochilganda seed avtomatik ishlaydi.
5. Vercel domenini `APP_URL` qilib, `/admin/settings` da webhookni ulang.

### 3) Railway / Render / Fly.io

Bir xil tamoyil: repo ulash → `DATABASE_URL` (Railway'da Postgres add-on) → build
`npm run build`, start `npm start` → `TELEGRAM_BOT_TOKEN`, `APP_URL`, `ADMIN_IDS`,
`SESSION_SECRET` environment'larini qo'shish → webhookni ulash.

**Checklist (har qanday hosting uchun)**

- [ ] Sayt HTTPS bilan ochiladi (`/api/health` → `{"ok":true}`)
- [ ] `.env` da `APP_URL` = hosting manzili (oxirida `/` siz)
- [ ] Admin panelda webhook “Ulangan” holatida
- [ ] Botda `/start` → Web App tugmasi ko'rinadi
- [ ] Demo loginlar: `/login` (mijoz/admin)

## Telegram sozlash

1. BotFather → `/newbot` → tokenni `TELEGRAM_BOT_TOKEN` ga yozing.
2. Mini appni hostingga joylang, `APP_URL` ni kiriting.
3. Webhook:

```bash
curl "https://api.telegram.org/bot$TOKEN/setWebhook?url=$APP_URL/api/telegram/webhook"
```

4. BotFather → `/setmenubutton` yoki botdagi `/start` orqali mini appni ochish.
5. Admin Telegram ID sini `ADMIN_IDS` ga qo'shing (ID ni `@userinfobot` orqali bilib oling).

## Demo rejim (brauzer)

Telegram bo'lmaganda `/login` sahifasida:

- **Mijoz sifatida kirish** — demo mijoz sessiyasi
- **Admin sifatida** — demo admin sessiyasi (`/admin` panel)

## Buyurtma hayoti

```
awaiting_payment → pending_review (chek yuklandi) → confirmed (admin tasdiqladi)
→ shipped → delivered
                    ↘ cancelled / rad etilgan chek → awaiting_payment
```

## API

| Metod | Yo'l | Tavsif |
| --- | --- | --- |
| POST | `/api/auth/telegram` | initData tekshirish, sessiya yaratish |
| POST | `/api/auth/demo` | demo login (mijoz/admin) |
| GET/POST/PATCH/DELETE | `/api/products` | katalog va mahsulot CRUD (admin) |
| GET/POST | `/api/orders` | buyurtmalar ro'yxati / yaratish |
| POST | `/api/orders/[id]/receipt` | chek yuklash |
| GET | `/api/receipts/[id]` | chek rasmini ko'rish (owner/admin) |
| PATCH | `/api/admin/orders/[id]` | chekni tasdiqlash/rad etish, holat |
| PUT | `/api/admin/settings` | do'kon sozlamalari |
| POST | `/api/telegram/webhook` | bot webhook |
| GET | `/api/health` | healthcheck |

## Xavfsizlik

- Telegram `initData` HMAC-SHA256 bilan tekshiriladi
- Sessiya cookie HMAC bilan imzolangan, `httpOnly`
- Admin amallari server tomonda `isAdmin` bilan himoyalangan
- Narxlar har doim serverda bazadan qayta hisoblanadi
- Chek rasmi faqat egasi yoki adminga ko'rinadi
