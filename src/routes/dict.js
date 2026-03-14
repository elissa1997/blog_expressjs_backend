const express = require('express');
const dictController = require('../controllers/dict.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/list', authMiddleware, validateByKey('GET /dict/list'), dictController.list);
router.get('/findbytype', validateByKey('GET /dict/findbytype'), dictController.findByType);
router.post('/add', authMiddleware, validateByKey('POST /dict/add'), dictController.add);
router.post('/update', authMiddleware, validateByKey('POST /dict/update'), dictController.update);
router.post('/delete', authMiddleware, validateByKey('POST /dict/delete'), dictController.remove);

module.exports = router;
