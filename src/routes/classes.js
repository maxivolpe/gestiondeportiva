const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const classController = require('../controllers/classController');
const attendanceRouter = require('./attendance');

router.use('/:id/attendance', attendanceRouter);

router.get('/', auth, classController.getAll);

router.post(
  '/',
  auth,
  authorize('profesor'),
  body('space_id').isInt().withMessage('space_id debe ser entero'),
  body('dia_semana')
    .isIn(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'])
    .withMessage('Día inválido'),
  body('hora_inicio').notEmpty().withMessage('hora_inicio requerida'),
  body('hora_fin').notEmpty().withMessage('hora_fin requerida'),
  body('cupos_maximos').isInt({ min: 1 }).withMessage('Cupos debe ser entero positivo'),
  validate,
  classController.create
);

router.patch('/:id', auth, authorize('profesor', 'dueno'), classController.update);
router.get('/:id/availability', auth, classController.getAvailability);

module.exports = router;
