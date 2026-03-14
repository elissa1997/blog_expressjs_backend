const othercommentService = require('../services/othercomment.service');

function extractClientIp(req) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
    return xForwardedFor.split(',')[0].trim();
  }

  const candidate =
    req.ip ||
    (req.socket && req.socket.remoteAddress) ||
    (req.connection && req.connection.remoteAddress) ||
    '';

  if (typeof candidate !== 'string' || !candidate.trim()) {
    return '127.0.0.1';
  }

  return candidate.replace('::ffff:', '').trim();
}

async function add(req, res, next) {
  try {
    const payload = {
      ...req.body,
      ip: extractClientIp(req),
      agent: req.headers['user-agent'] || 'unknow',
      status: 1
    };
    const result = await othercommentService.add(payload);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    const result = await othercommentService.list(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function adminList(req, res, next) {
  try {
    const result = await othercommentService.adminList(req.query);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await othercommentService.remove(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await othercommentService.update(req.body);
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  add,
  list,
  adminList,
  remove,
  update
};
