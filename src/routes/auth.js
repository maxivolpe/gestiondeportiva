const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post(
  '/login',
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validate,
  authController.login
);

router.post(
  '/refresh',
  body('refreshToken').notEmpty().withMessage('refreshToken requerido'),
  validate,
  authController.refresh
);

router.post('/logout', auth, authController.logout);

module.exports = router;
