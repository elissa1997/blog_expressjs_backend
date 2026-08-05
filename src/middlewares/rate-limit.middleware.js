const { rateLimit } = require('express-rate-limit');
const config = require('../config');

function validateLimiterConfig(name, limiterConfig) {
  if (!limiterConfig || !Number.isFinite(limiterConfig.windowMinutes) || limiterConfig.windowMinutes <= 0) {
    throw new Error(`${name} 限流窗口配置不正确`);
  }

  if (!Number.isInteger(limiterConfig.limit) || limiterConfig.limit <= 0) {
    throw new Error(`${name} 限流次数配置不正确`);
  }
}

function createSubmissionLimiter(name, limiterConfig) {
  validateLimiterConfig(name, limiterConfig);

  return rateLimit({
    windowMs: limiterConfig.windowMinutes * 60 * 1000,
    limit: limiterConfig.limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => config.rateLimit.enabled === false,
    handler(req, res, next, options) {
      return res.fail('请求过于频繁，请稍后再试', options.statusCode);
    }
  });
}

const commentSubmissionLimiter = createSubmissionLimiter('评论', config.rateLimit.comment);
const friendlinkSubmissionLimiter = createSubmissionLimiter('友情链接', config.rateLimit.friendlink);

module.exports = {
  commentSubmissionLimiter,
  friendlinkSubmissionLimiter
};
