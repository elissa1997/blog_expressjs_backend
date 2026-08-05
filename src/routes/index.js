const express = require('express');
const authRoutes = require('./auth');
const articleRoutes = require('./article');
const commentRoutes = require('./comment');
const othercommentRoutes = require('./othercomment');
const dictRoutes = require('./dict');
const friendlinkRoutes = require('./friendlink');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/article', articleRoutes);
router.use('/comment', commentRoutes);
router.use('/othercomment', othercommentRoutes);
router.use('/dict', dictRoutes);
router.use('/friendlink', friendlinkRoutes);

module.exports = router;
