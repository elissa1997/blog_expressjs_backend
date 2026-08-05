const { reviewText, pickSuggestion } = require('../utils/qiniu-text-review');

async function qiniuCommentReviewMiddleware(req, res, next) {
  try {
    const text = ((req.body && req.body.text) || '').trim();

    if (!text) {
      return res.fail('评论内容不能为空', 400);
    }

    const result = await reviewText(text);
    if (result.skipped) {
      return next();
    }

    const suggestion = pickSuggestion(result);
    if (suggestion === 'pass') {
      return next();
    }

    if (suggestion === 'review') {
      return res.fail('评论包含敏感内容，待审核后发布', 403, { suggestion });
    }

    return res.fail('评论包含违规内容，发布失败', 403, {
      suggestion: suggestion || 'block'
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = qiniuCommentReviewMiddleware;
