const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const enrollmentController = require('../controllers/enrollmentController');

router.get('/', auth, enrollmentController.getAll);

router.post(
  '/',
  auth,
  authorize('secretario', 'dueno'),
  body('alumno_id').isInt().withMessage('alumno_id debe ser entero'),
  body('class_id').isInt().withMessage('class_id debe ser entero'),
  body('fecha_desde').isDate().withMessage('fecha_desde inválida'),
  validate,
  enrollmentController.create
);

router.delete('/:id', auth, authorize('secretario', 'dueno'), enrollmentController.remove);

module.exports = router;
