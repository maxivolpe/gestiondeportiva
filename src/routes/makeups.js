const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const makeupController = require('../controllers/makeupController');

router.get('/', auth, authorize('alumno', 'secretario'), makeupController.getAll);

router.post(
  '/',
  auth,
  authorize('alumno'),
  body('class_origen_id').isInt().withMessage('class_origen_id requerido'),
  body('class_destino_id').isInt().withMessage('class_destino_id requerido'),
  body('fecha_clase_origen').isDate().withMessage('fecha_clase_origen inválida'),
  body('fecha_clase_destino').isDate().withMessage('fecha_clase_destino inválida'),
  validate,
  makeupController.create
);

router.patch('/:id/approve', auth, authorize('secretario'), makeupController.approve);
router.patch('/:id/reject', auth, authorize('secretario'), makeupController.reject);

module.exports = router;
