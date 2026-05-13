const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/disciplines', require('./disciplines'));
router.use('/classes', require('./classes'));
router.use('/enrollments', require('./enrollments'));
router.use('/makeups', require('./makeups'));
router.use('/payments', require('./payments'));
router.use('/payment-plans', require('./paymentPlans'));
router.use('/dashboard', require('./dashboard'));

module.exports = router;
