const express = require('express');
const router = express.Router();
const controller = require('../controllers/learners.controller');

router.get('/', controller.getAllLearners);
router.get('/:id', controller.getLearnerById);
router.post('/', controller.createLearner);
router.put('/:id', controller.updateLearner);
router.delete('/:id', controller.deleteLearner);

module.exports = router;