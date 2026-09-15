const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function info(req, res, next) {
  try {
    const result = await authService.info(req.user);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  info
};
