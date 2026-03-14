const articleService = require('../services/article.service');

async function list(req, res, next) {
  try {
    const result = await articleService.list(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function detail(req, res, next) {
  try {
    const result = await articleService.detail(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function add(req, res, next) {
  try {
    const result = await articleService.add(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await articleService.update(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await articleService.remove(req.body);
    return res.success(result);
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
