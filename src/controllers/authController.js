const authService = require('../services/authService');
const { success, error } = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    success(res, result, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'refreshToken requerido', 400);
    const result = await authService.refresh(refreshToken);
    success(res, result, 'Token renovado');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    success(res, null, 'Sesión cerrada');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout };
