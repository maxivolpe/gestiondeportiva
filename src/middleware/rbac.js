const { error } = require('../utils/apiResponse');

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'No autenticado', 401);
  if (!roles.includes(req.user.rol)) return error(res, 'Sin permisos para esta acción', 403);
  next();
};

module.exports = { authorize };
