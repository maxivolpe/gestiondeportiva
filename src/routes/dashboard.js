const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const dashboardController = require('../controllers/dashboardController');

router.get('/summary', auth, authorize('dueno'), dashboardController.getSummary);

module.exports = router;
