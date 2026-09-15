const userService = require('../services/user.service');

async function list(req, res, next) {
  try {
    return res.success(await userService.list(req.query));
  } catch (err) {
    return next(err);
  }
}

async function detail(req, res, next) {
  try {
    return res.success(await userService.detail(req.query));
  } catch (err) {
    return next(err);
  }
}

async function add(req, res, next) {
  try {
    return res.success(await userService.add(req.body));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    return res.success(await userService.update(req.body));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    return res.success(await userService.remove(req.body, req.user));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  list,
  detail,
  add,
  update,
  remove
};
