const express = require('express');
const router = express.Router();
const controller = require('../controllers/progress.controller');

router.get('/', controller.getAllProgress);
router.get('/:id', controller.getProgressById);
router.post('/', controller.createProgress);
router.put('/:id', controller.updateProgress);
router.delete('/:id', controller.deleteProgress);

module.exports = router;