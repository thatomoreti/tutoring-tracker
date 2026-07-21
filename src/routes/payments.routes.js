const express = require('express');
const router = express.Router();
const controller = require('../controllers/payments.controller');

router.get('/', controller.getAllPayments);
router.get('/:id', controller.getPaymentById);
router.post('/', controller.createPayment);
router.delete('/:id', controller.deletePayment);

module.exports = router;