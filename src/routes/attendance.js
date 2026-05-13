const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const attendanceController = require('../controllers/attendanceController');

router.get('/', auth, authorize('profesor', 'secretario'), attendanceController.getByClass);

router.post(
  '/',
  auth,
  authorize('profesor', 'secretario'),
  body('fecha').isDate().withMessage('Fecha inválida'),
  body('attendances').isArray().withMessage('attendances debe ser array'),
  validate,
  attendanceController.register
);

module.exports = router;
