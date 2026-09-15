const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);
router.get('/list', validateByKey('GET /user/list'), userController.list);
router.get('/detail', validateByKey('GET /user/detail'), userController.detail);
router.post('/add', validateByKey('POST /user/add'), userController.add);
router.post('/update', validateByKey('POST /user/update'), userController.update);
router.post('/delete', validateByKey('POST /user/delete'), userController.remove);

module.exports = router;
