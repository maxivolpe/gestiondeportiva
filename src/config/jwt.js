const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7');

const generateAccessToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const verifyAccessToken = (token) => jwt.verify(token, JWT_SECRET);

const generateRefreshToken = () => crypto.randomUUID();

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getRefreshTokenExpiry = () => {
  const date = new Date();
  date.setDate(date.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return date;
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
};
