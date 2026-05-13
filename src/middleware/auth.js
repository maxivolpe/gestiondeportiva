const { verifyAccessToken } = require('../config/jwt');
const { error } = require('../utils/apiResponse');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'Token requerido', 401);
  }

  const token = header.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.userId, rol: decoded.rol, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expirado', 401);
    return error(res, 'Token inválido', 401);
  }
};
