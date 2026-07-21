const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoices.controller');

router.get('/', controller.getAllInvoices);
router.get('/:id', controller.getInvoiceById);
router.post('/', controller.createInvoice);
router.patch('/:id/status', controller.updateInvoiceStatus);
router.delete('/:id', controller.deleteInvoice);

module.exports = router;