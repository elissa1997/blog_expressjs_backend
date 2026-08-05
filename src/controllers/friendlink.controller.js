const friendlinkService = require('../services/friendlink.service');

function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 45);
  }

  const candidate = req.ip || (req.socket && req.socket.remoteAddress) || '';
  return typeof candidate === 'string' && candidate.trim()
    ? candidate.replace('::ffff:', '').trim().slice(0, 45)
    : '127.0.0.1';
}

async function add(req, res, next) {
  try {
    const result = await friendlinkService.add({
      ...req.body,
      ip: extractClientIp(req),
      agent: (req.headers['user-agent'] || 'unknow').slice(0, 512)
    });
    return res.success(result);
  } catch (err) {
    return next(err);
  }
}

async function list(req, res, next) {
  try {
    return res.success(await friendlinkService.list(req.query));
  } catch (err) {
    return next(err);
  }
}

async function adminList(req, res, next) {
  try {
    return res.success(await friendlinkService.adminList(req.query));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    return res.success(await friendlinkService.update(req.body));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    return res.success(await friendlinkService.remove(req.body));
  } catch (err) {
    return next(err);
  }
}

module.exports = { add, list, adminList, update, remove };
