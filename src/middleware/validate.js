const { validationResult } = require('express-validator');
const { error } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Error de validación', 400, errors.array().map((e) => e.msg));
  }
  next();
};

module.exports = { validate };
