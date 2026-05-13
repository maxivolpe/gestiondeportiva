const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} = require('../config/jwt');

const login = async (email, password) => {
  const user = await User.findOne({
    where: { email, activo: true },
    attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'password_hash'],
  });

  if (!user) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken({ userId: user.id, rol: user.rol, email: user.email });
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  await RefreshToken.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: getRefreshTokenExpiry(),
    revocado: false,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    user: { id: user.id, nombre: user.nombre, rol: user.rol, email: user.email },
  };
};

const refresh = async (rawRefreshToken) => {
  const tokenHash = hashToken(rawRefreshToken);

  const stored = await RefreshToken.findOne({
    where: { token_hash: tokenHash, revocado: false },
    include: [{ model: User, required: true, where: { activo: true } }],
  });

  if (!stored || stored.expires_at < new Date()) {
    const err = new Error('Refresh token inválido o expirado');
    err.status = 401;
    throw err;
  }

  await stored.update({ revocado: true });

  const user = stored.User;
  const accessToken = generateAccessToken({ userId: user.id, rol: user.rol, email: user.email });
  const newRawToken = generateRefreshToken();
  const newHash = hashToken(newRawToken);

  await RefreshToken.create({
    user_id: user.id,
    token_hash: newHash,
    expires_at: getRefreshTokenExpiry(),
    revocado: false,
  });

  return { accessToken, refreshToken: newRawToken };
};

const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await RefreshToken.update({ revocado: true }, { where: { token_hash: tokenHash } });
};

module.exports = { login, refresh, logout };
