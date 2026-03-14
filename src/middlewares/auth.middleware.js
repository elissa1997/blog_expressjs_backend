const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  const scheme = parts[0];
  const token = parts[1];

  if (scheme !== 'Bearer' || !token) {
    return res.fail('未授权，请先登录', 401);
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch (err) {
    return res.fail('登录状态已失效，请重新登录', 401);
  }
}

module.exports = authMiddleware;
