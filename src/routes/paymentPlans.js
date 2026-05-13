const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const paymentPlanController = require('../controllers/paymentPlanController');

router.get('/', auth, paymentPlanController.getAll);

router.post(
  '/',
  auth,
  authorize('dueno'),
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('duracion_dias').isInt({ min: 1 }).withMessage('duracion_dias debe ser entero positivo'),
  body('precio_base').isFloat({ min: 0 }).withMessage('precio_base debe ser número positivo'),
  validate,
  paymentPlanController.create
);

router.patch('/:id', auth, authorize('dueno'), paymentPlanController.update);

module.exports = router;
