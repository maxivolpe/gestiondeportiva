const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const disciplineController = require('../controllers/disciplineController');

router.get('/', auth, disciplineController.getAll);

router.post(
  '/',
  auth,
  authorize('dueno'),
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  validate,
  disciplineController.create
);

router.patch('/:id', auth, authorize('dueno'), disciplineController.update);

router.get('/:id/spaces', auth, disciplineController.getSpaces);

router.post(
  '/:id/spaces',
  auth,
  authorize('dueno'),
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('capacidad_maxima').isInt({ min: 1 }).withMessage('Capacidad debe ser entero positivo'),
  validate,
  disciplineController.createSpace
);

module.exports = router;
