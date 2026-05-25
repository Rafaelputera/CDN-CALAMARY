import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.memoryStorage()
});

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const files = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        success: false,
        error: "BOT_TOKEN atau CHAT_ID belum diatur di .env"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "File tidak ditemukan"
      });
    }

    const form = new FormData();

    form.append("chat_id", CHAT_ID);

    form.append("document", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const document = telegramResponse.data.result.document;

    const id = nanoid(24);

    files.set(id, {
      fileId: document.file_id,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.json({
      success: true,
      fileName: req.file.originalname,
      url: `${baseUrl}/f/${id}`
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message
    });
  }
});

app.get("/f/:id", async (req, res) => {
  try {
    const data = files.get(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "File tidak ditemukan atau link sudah hilang"
      });
    }

    if (Date.now() > data.expiresAt) {
      files.delete(req.params.id);

      return res.status(410).json({
        success: false,
        error: "Link expired"
      });
    }

    const telegramFile = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
      {
        params: {
          file_id: data.fileId
        }
      }
    );

    const filePath = telegramFile.data.result.file_path;

    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream"
    });

    res.setHeader("Content-Type", data.mimeType || response.headers["content-type"] || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(data.fileName)}"`);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

    response.data.pipe(res);

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message
    });
  }
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;