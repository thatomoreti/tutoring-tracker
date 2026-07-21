const express = require('express');
const router = express.Router();
const controller = require('../controllers/subjects.controller');

router.get('/', controller.getAllSubjects);
router.get('/:id', controller.getSubjectById);
router.post('/', controller.createSubject);
router.put('/:id', controller.updateSubject);
router.delete('/:id', controller.deleteSubject);

module.exports = router;