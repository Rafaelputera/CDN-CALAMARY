# Telegram CDN Vercel

Website upload file ke Telegram lalu membuat URL stream sementara/sekali buka.

## Deploy ke Vercel

1. Upload project ini ke GitHub.
2. Import ke Vercel.
3. Tambahkan Environment Variables:

```env
BOT_TOKEN=token_bot_kamu
CHAT_ID=chat_id_kamu
MAX_FILE_SIZE_MB=45
```

4. Deploy.

## Cara dapat BOT_TOKEN

Buka Telegram, chat `@BotFather`, buat bot baru, lalu salin token.

## Cara dapat CHAT_ID

Tambahkan bot ke group/channel, kirim pesan ke group/channel, lalu buka:

```txt
https://api.telegram.org/botTOKEN_KAMU/getUpdates
```

Cari bagian:

```json
"chat":{"id":-100xxxxxxxxxx}
```

## Catatan penting

Versi ini tidak memakai database. Link disimpan di memory server, sehingga bisa hilang jika Vercel cold start/restart. Untuk production gunakan Redis/Upstash.
