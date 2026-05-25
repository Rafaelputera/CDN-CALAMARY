import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const MONGODB_URI = process.env.MONGODB_URI;

app.set("trust proxy", 1);

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Terlalu banyak request. Coba lagi dalam 1 menit."
  }
});

app.use(globalLimiter);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

let isMongoConnected = false;

async function connectMongo() {
  if (isMongoConnected) return;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI belum diatur di .env");
  }

  await mongoose.connect(MONGODB_URI);

  isMongoConnected = true;
}

const statsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global"
    },
    totalVisit: {
      type: Number,
      default: 0
    },
    totalRequest: {
      type: Number,
      default: 0
    },
    totalFile: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const fileSchema = new mongoose.Schema(
  {
    fileId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      default: "application/octet-stream"
    },
    size: {
      type: Number,
      default: 0
    },
    shortId: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    totalAccess: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Stats = mongoose.models.Stats || mongoose.model("Stats", statsSchema);
const File = mongoose.models.File || mongoose.model("File", fileSchema);

async function ensureStats() {
  await connectMongo();

  const stats = await Stats.findOneAndUpdate(
    {
      key: "global"
    },
    {
      $setOnInsert: {
        key: "global",
        totalVisit: 0,
        totalRequest: 0,
        totalFile: 0
      }
    },
    {
      upsert: true,
      returnDocument: "after"
    }
  );

  return stats;
}

async function incrementStats(field) {
  await connectMongo();

  const stats = await Stats.findOneAndUpdate(
    {
      key: "global"
    },
    {
      $inc: {
        [field]: 1
      },
      $setOnInsert: {
        key: "global"
      }
    },
    {
      upsert: true,
      returnDocument: "after"
    }
  );

  return stats;
}

app.get("/", async (req, res) => {
  try {
    await incrementStats("totalVisit");
  } catch (err) {
    console.error("Visit counter error:", err.message);
  }

  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/api/stats", async (req, res) => {
  try {
    const stats = await ensureStats();

    return res.json({
      success: true,
      totalVisit: stats.totalVisit,
      totalRequest: stats.totalRequest,
      totalFile: stats.totalFile
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    await connectMongo();

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

    await incrementStats("totalRequest");

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

    const shortId = nanoid(24);

    const file = await File.create({
      fileId: document.file_id,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      shortId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await incrementStats("totalFile");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.json({
      success: true,
      id: file.shortId,
      fileName: file.fileName,
      size: file.size,
      url: `${baseUrl}/f/${file.shortId}`
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
    await connectMongo();

    await incrementStats("totalRequest");

    const file = await File.findOne({
      shortId: req.params.id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File tidak ditemukan"
      });
    }

    if (Date.now() > new Date(file.expiresAt).getTime()) {
      await File.deleteOne({
        shortId: req.params.id
      });

      return res.status(410).json({
        success: false,
        error: "Link expired"
      });
    }

    await File.updateOne(
      {
        shortId: req.params.id
      },
      {
        $inc: {
          totalAccess: 1
        }
      }
    );

    const telegramFile = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
      {
        params: {
          file_id: file.fileId
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

    res.setHeader(
      "Content-Type",
      file.mimeType || response.headers["content-type"] || "application/octet-stream"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.fileName)}"`
    );

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
