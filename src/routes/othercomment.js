const express = require('express');
const othercommentController = require('../controllers/othercomment.controller');
const qiniuCommentReviewMiddleware = require('../middlewares/qiniu-comment-review.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/add', validateByKey('POST /othercomment/add'), qiniuCommentReviewMiddleware, othercommentController.add);
router.get('/list', validateByKey('GET /othercomment/list'), othercommentController.list);
router.get('/admin-list', authMiddleware, validateByKey('GET /othercomment/admin-list'), othercommentController.adminList);
router.post('/delete', authMiddleware, validateByKey('POST /othercomment/delete'), othercommentController.remove);
router.post('/update', authMiddleware, validateByKey('POST /othercomment/update'), othercommentController.update);

module.exports = router;
