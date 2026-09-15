const express = require('express');
const articleController = require('../controllers/article.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.get('/list', validateByKey('GET /article/list'), articleController.list);
router.get('/detail', validateByKey('GET /article/detail'), articleController.detail);
router.get('/admin-list', authMiddleware, validateByKey('GET /article/admin-list'), articleController.adminList);
router.get('/admin-detail', authMiddleware, validateByKey('GET /article/admin-detail'), articleController.adminDetail);
router.post('/add', authMiddleware, validateByKey('POST /article/add'), articleController.add);
router.post('/update', authMiddleware, validateByKey('POST /article/update'), articleController.update);
router.post('/delete', authMiddleware, validateByKey('POST /article/delete'), articleController.remove);

module.exports = router;
