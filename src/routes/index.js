const express = require('express');
const authRoutes = require('./auth');
const articleRoutes = require('./article');
const commentRoutes = require('./comment');
const dictRoutes = require('./dict');
const friendlinkRoutes = require('./friendlink');
const userRoutes = require('./user');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/article', articleRoutes);
router.use('/comment', commentRoutes);
router.use('/dict', dictRoutes);
router.use('/friendlink', friendlinkRoutes);
router.use('/user', userRoutes);

module.exports = router;
