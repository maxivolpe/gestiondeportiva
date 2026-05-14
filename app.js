require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "unpkg.com", "cdn.tailwindcss.com", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "unpkg.com", "cdn.tailwindcss.com", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: process.env.NODE_ENV === 'development' || allowedOrigins.length === 0
    ? true  // allow all: dev mode OR no allowlist configured (single-server SaaS)
    : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/v1/auth/login', loginLimiter);

app.use('/api/v1', routes);

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', message: `Server running on port ${PORT}`, env: process.env.NODE_ENV }));
});

module.exports = app;
