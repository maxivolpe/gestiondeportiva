const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const paymentController = require('../controllers/paymentController');

// /due-soon must be before /:id to avoid route conflict
router.get('/due-soon', auth, authorize('secretario', 'dueno'), paymentController.getDueSoon);

router.get('/', auth, paymentController.getAll);

router.post(
  '/',
  auth,
  authorize('secretario'),
  body('alumno_id').isInt().withMessage('alumno_id requerido'),
  body('plan_id').isInt().withMessage('plan_id requerido'),
  body('fecha_inicio').isDate().withMessage('fecha_inicio inválida'),
  validate,
  paymentController.create
);

router.patch('/:id', auth, authorize('secretario'), paymentController.update);

module.exports = router;
