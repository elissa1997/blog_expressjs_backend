const express = require('express');
const friendlinkController = require('../controllers/friendlink.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');
const { friendlinkSubmissionLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.post('/add', friendlinkSubmissionLimiter, validateByKey('POST /friendlink/add'), friendlinkController.add);
router.get('/list', validateByKey('GET /friendlink/list'), friendlinkController.list);
router.get('/admin-list', authMiddleware, validateByKey('GET /friendlink/admin-list'), friendlinkController.adminList);
router.post('/update', authMiddleware, validateByKey('POST /friendlink/update'), friendlinkController.update);
router.post('/delete', authMiddleware, validateByKey('POST /friendlink/delete'), friendlinkController.remove);

module.exports = router;
