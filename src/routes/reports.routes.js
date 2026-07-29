const express = require('express');
const router = express.Router();
const controller = require('../controllers/reports.controller');

router.get('/dashboard', controller.getDashboardStats);
router.get('/balances', controller.getBalances);
router.get('/revenue', controller.getRevenueByMonth);
router.get('/attendance', controller.getAttendanceSummary);

module.exports = router;