const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const userController = require('../controllers/userController');

router.get('/', auth, authorize('dueno', 'secretario'), userController.getAll);

router.post(
  '/',
  auth,
  authorize('dueno'),
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
  body('rol')
    .isIn(['alumno', 'profesor', 'secretario', 'dueno'])
    .withMessage('Rol inválido'),
  validate,
  userController.create
);

router.get('/:id', auth, authorize('dueno', 'secretario'), userController.getOne);
router.patch('/:id', auth, authorize('dueno'), userController.update);
router.delete('/:id', auth, authorize('dueno'), userController.remove);

module.exports = router;
