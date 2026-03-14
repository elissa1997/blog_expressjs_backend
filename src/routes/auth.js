const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', validateByKey('POST /auth/login'), authController.login);
router.get('/info', authMiddleware, authController.info);

module.exports = router;
