const userModel = require('../models/user.model');

async function adminMiddleware(req, res, next) {
  try {
    const user = await userModel.findById(Number.parseInt(req.user.id, 10));

    if (!user) {
      return res.fail('登录用户不存在，请重新登录', 401);
    }

    if (user.role !== '1') {
      return res.fail('无权进行用户管理', 403);
    }

    req.currentUser = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = adminMiddleware;
