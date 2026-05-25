# 🚀 Calamary CDN

Modern Telegram File CDN & Streaming Platform built with Express.js, MongoDB, Tailwind CSS, and Telegram Bot API.

![Preview](https://athars.space/uploads/d5f34978.png)

---

# ✨ Features

- ⚡ Fast Telegram File Streaming
- ☁️ Telegram Cloud Storage
- 🔒 Secure File Access
- 📊 Realtime Stats System
- 🛡️ Anti Spam Protection
- 🌙 Modern Dark UI
- 📱 Fully Responsive
- 🚀 Vercel Ready
- 🗄 MongoDB Integration
- 📂 Support All File Types
- 🔗 Auto Generate Stream URL

---

# 📸 Preview

## Main Interface

- Upload file directly to Telegram
- Generate instant stream URL
- Realtime statistics
- Beautiful responsive design

---

# 🛠 Tech Stack

| Technology | Description |
|---|---|
| Express.js | Backend Framework |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| Tailwind CSS | Frontend Styling |
| Telegram Bot API | File Storage |
| Multer | File Upload |
| Axios | HTTP Client |
| Vercel | Deployment |

---

# 📂 Project Structure

```bash
project/
│
├── api/
│   └── index.js
│
├── public/
│   └── index.html
│
├── .env
├── package.json
└── vercel.json
```

---

# ⚙️ Installation

## 1. Clone Project

```bash
git clone https://github.com/yourusername/calamary-cdn.git
```

---

## 2. Install Dependencies

```bash
npm install
```

---

# 📦 Required Packages

```bash
npm install express multer axios form-data nanoid dotenv mongoose express-rate-limit
```

---

# ⚠️ Environment Variables Setup

Project ini mendukung:

- ✅ Localhost
- ✅ VPS
- ✅ Vercel

Namun cara penggunaan `.env` berbeda.

---

# 💻 Localhost / VPS Setup

Jika menjalankan project di localhost atau VPS biasa:

Buat file:

```txt
.env
```

Isi:

```env
BOT_TOKEN=YOUR_BOT_TOKEN
CHAT_ID=YOUR_CHAT_ID
MONGODB_URI=YOUR_MONGODB_URI
PORT=3000
```

Kemudian jalankan:

```bash
npm run dev
```

---

# 🚀 Vercel Deployment Setup

Jika deploy ke Vercel:

❌ Jangan mengandalkan `.env`

✅ Gunakan:

```txt
Vercel Environment Variables
```

---

# 📌 Cara Menambahkan Environment Variables di Vercel

Buka:

👉 https://vercel.com/dashboard

Masuk ke:

```txt
Project
→ Settings
→ Environment Variables
```

Tambahkan:

| Key | Value |
|---|---|
| BOT_TOKEN | Telegram Bot Token |
| CHAT_ID | Telegram Chat ID |
| MONGODB_URI | MongoDB URI |
| PORT | 3000 |

---

# ⚠️ Penting

Di `index.js` gunakan:

```js
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
```

Agar:

- localhost → membaca `.env`
- Vercel → membaca Environment Variables Vercel

---

# 🔒 Private Repository Method

Kalau repository kamu PRIVATE:

Sebenarnya aman saja jika file `.env` tetap ada di repository private.

Namun tetap disarankan:

```gitignore
.env
```

agar lebih aman.

---

# 🌍 Public Repository Warning

Jika repository PUBLIC:

❌ JANGAN upload `.env`

Karena semua orang bisa melihat:

- BOT_TOKEN
- MongoDB URI
- CHAT_ID

dan bot kamu bisa diambil alih.

---

# 🤖 Create Telegram Bot

Open:

👉 https://t.me/BotFather

Create bot:

```txt
/newbot
```

Copy bot token.

---

# 💬 Get Chat ID

Add bot into group/channel.

Open:

```txt
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

Find:

```json
"chat": {
  "id": -100xxxxxxxxx
}
```

Use that ID as:

```env
CHAT_ID=-100xxxxxxxxx
```

---

# 🗄 MongoDB Setup

Create free cluster:

👉 https://www.mongodb.com/cloud/atlas

Get connection URI:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/calamary-cdn
```

---

# ▶️ Run Localhost

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# 🚀 Deploy To Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel
```

---

# 📡 API Endpoints

## Upload File

```http
POST /upload
```

### Form Data

| Key | Type |
|---|---|
| file | File |

---

## Response

```json
{
  "success": true,
  "url": "https://yourdomain.com/f/abc123"
}
```

---

# 📊 Stats API

```http
GET /api/stats
```

## Response

```json
{
  "success": true,
  "totalVisit": 100,
  "totalRequest": 500,
  "totalFile": 120
}
```

---

# 🔒 Anti Spam System

Built-in rate limiter:

```txt
30 requests / minute per IP
```

If exceeded:

```json
{
  "success": false,
  "error": "Terlalu banyak request. Coba lagi dalam 1 menit."
}
```

---

# ☁️ How It Works

```txt
User Upload File
        ↓
Express Server
        ↓
Telegram Bot API
        ↓
Telegram Stores File
        ↓
Generate Stream URL
        ↓
User Access Stream
```

---

# 📈 Realtime Stats

Website automatically updates:

- Total Visit
- Total Requests
- Total Files

Using:

```txt
/api/stats
```

---

# 🛡 Security Features

- Anti spam rate limiter
- File stream proxy
- Hidden Telegram file URL
- Expired file system
- MongoDB validation
- Request protection

---

# 📱 Responsive Design

Optimized for:

- Desktop
- Tablet
- Mobile

---

# 🎨 UI Features

- Modern glassmorphism
- Dark mode
- SVG icons
- Smooth animations
- Responsive layout
- Hero banner
- Realtime dashboard

---

# ⚡ Important Notes

## Vercel Upload Speed

Karena sistem bekerja seperti ini:

```txt
Browser → Vercel → Telegram
```

Maka upload file besar bisa terasa lambat.

Disarankan:

- Maksimal 20MB upload
- Gunakan VPS/Railway untuk upload besar
- Vercel cocok untuk frontend + API ringan

---

# 📜 License

MIT License

Free to use and modify.

---

# ❤️ Credits

Made with ❤️ using:

- Express.js
- Telegram Bot API
- MongoDB
- Tailwind CSS

---

# 👨‍💻 Author

**RafaelXD**

Calamary CDN Platform

---
