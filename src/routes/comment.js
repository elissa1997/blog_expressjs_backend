const express = require('express');
const commentController = require('../controllers/comment.controller');
const qiniuCommentReviewMiddleware = require('../middlewares/qiniu-comment-review.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateByKey } = require('../middlewares/validate.middleware');

const router = express.Router();

router.post('/add', validateByKey('POST /comment/add'), qiniuCommentReviewMiddleware, commentController.add);
router.get('/list', validateByKey('GET /comment/list'), commentController.list);
router.get('/admin-list', authMiddleware, validateByKey('GET /comment/admin-list'), commentController.adminList);
router.post('/delete', authMiddleware, validateByKey('POST /comment/delete'), commentController.remove);
router.post('/update', authMiddleware, validateByKey('POST /comment/update'), commentController.update);

module.exports = router;
