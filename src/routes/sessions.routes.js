const express = require('express');
const router = express.Router();
const controller = require('../controllers/sessions.controller');

router.get('/', controller.getAllSessions);
router.get('/:id', controller.getSessionById);
router.post('/', controller.createSession);
router.put('/:id', controller.updateSession);
router.delete('/:id', controller.deleteSession);

module.exports = router;