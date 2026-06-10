require('dotenv').config();
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const registerRoute = require('./routes/register');
const registerVideoRoute = require('./routes/registerVideo');
const checkRoute = require('./routes/check');
const checkVideoRoute = require('./routes/checkVideo');
const verifyRoute = require('./routes/verify');
const detectionsRoute = require('./routes/detections');
const assetsRoute = require('./routes/assets');
const { requireAuth } = require('./modules/auth');

const app = express();
const PORT = process.env.PORT || 8080;

// Trust the Cloud Run proxy so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// ALLOWED_ORIGIN: '*' (default) or a comma-separated allowlist of origins.
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(',').map(o => o.trim()),
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Basic abuse protection: cap requests per IP on the API surface.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down and try again shortly.' },
});
app.use('/api', apiLimiter);

// In-memory storage for uploaded files (multer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB — matches the Register page promise
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Video uploads go to a temp file on disk (videos are large); the Python
// pipeline reads the path, and the route deletes it afterwards.
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    // Keep a real extension so the decoder can detect the format.
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.mp4';
      cb(null, `sgvid_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 80 * 1024 * 1024 }, // 80MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed'));
    }
    cb(null, true);
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sportsguard-api', timestamp: new Date().toISOString() });
});

// Mutating / cost-bearing routes require a valid Firebase ID token
// (Google sign-in or anonymous guest). Read-only dashboard routes stay public.
app.post('/api/register', requireAuth, upload.single('image'), registerRoute);
app.post('/api/register-video', requireAuth, videoUpload.single('video'), registerVideoRoute);
app.post('/api/check', requireAuth, checkRoute);
app.post('/api/check-video', requireAuth, videoUpload.single('video'), checkVideoRoute);
app.post('/api/verify', requireAuth, upload.single('image'), verifyRoute);
app.get('/api/detections', detectionsRoute);
app.get('/api/assets', assetsRoute);

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SportsGuard API running on port ${PORT}`);
});
