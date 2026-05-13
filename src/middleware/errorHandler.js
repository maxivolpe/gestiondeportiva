module.exports = (err, req, res, next) => {
  console.log(
    JSON.stringify({
      level: 'error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    })
  );

  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors?.map((e) => e.message) || [],
    });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    errors: [],
  });
};
