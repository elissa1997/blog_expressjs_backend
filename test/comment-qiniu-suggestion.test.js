const test = require('node:test');
const assert = require('node:assert/strict');
const qiniuTextReview = require('../src/utils/qiniu-text-review');
const commentService = require('../src/services/comment.service');
const commentModel = require('../src/models/comment.model');
const prisma = require('../src/config/db');

function loadReviewMiddleware(reviewResult) {
  const originalReviewText = qiniuTextReview.reviewText;
  qiniuTextReview.reviewText = async () => reviewResult;
  delete require.cache[require.resolve('../src/middlewares/qiniu-comment-review.middleware')];
  const middleware = require('../src/middlewares/qiniu-comment-review.middleware');
  qiniuTextReview.reviewText = originalReviewText;
  return middleware;
}

test('comment review middleware forwards a passed Qiniu suggestion', async () => {
  const middleware = loadReviewMiddleware({ result: { suggestion: 'pass' } });
  const req = { body: { text: '正常评论' } };
  let nextError;

  await middleware(req, {}, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(req.qiniuSuggestion, 'pass');
});

test('comment review middleware records pass when review is skipped', async () => {
  const middleware = loadReviewMiddleware({ skipped: true });
  const req = { body: { text: '未配置审核时的评论' } };
  let nextCalled = false;

  await middleware(req, {}, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.qiniuSuggestion, 'pass');
});

test('comment review middleware forwards review for manual approval', async () => {
  const middleware = loadReviewMiddleware({ result: { suggestion: 'review' } });
  const req = { body: { text: '需要人工审核的评论' } };
  let nextError;

  await middleware(req, {}, (error) => {
    nextError = error;
  });

  assert.equal(nextError, undefined);
  assert.equal(req.qiniuSuggestion, 'review');
});

test('comment review middleware still rejects blocked content', async () => {
  const middleware = loadReviewMiddleware({ result: { suggestion: 'block' } });
  const req = { body: { text: '违规评论' } };
  let failure;

  await middleware(req, {
    fail(message, status, data) {
      failure = { message, status, data };
    }
  }, () => {
    throw new Error('block 不应继续入库');
  });

  assert.equal(req.qiniuSuggestion, 'block');
  assert.equal(failure.status, 403);
  assert.deepEqual(failure.data, { suggestion: 'block' });
});

test('comment controller uses only the server-side review suggestion', async () => {
  const originalAdd = commentService.add;
  let savedPayload;
  commentService.add = async (payload) => {
    savedPayload = payload;
    return true;
  };
  delete require.cache[require.resolve('../src/controllers/comment.controller')];
  const commentController = require('../src/controllers/comment.controller');

  try {
    await commentController.add({
      body: { text: '评论', qiniuSuggestion: 'block' },
      qiniuSuggestion: 'pass',
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1'
    }, {
      success(result) {
        return result;
      }
    }, (error) => {
      throw error;
    });

    assert.equal(savedPayload.qiniuSuggestion, 'pass');
  } finally {
    commentService.add = originalAdd;
    delete require.cache[require.resolve('../src/controllers/comment.controller')];
  }
});

test('comment model persists qiniuSuggestion', async () => {
  const originalCreate = prisma.comment.create;
  let createdData;
  prisma.comment.create = async ({ data }) => {
    createdData = data;
    return { id: 1 };
  };

  try {
    assert.equal(await commentModel.add({
      a_id: 1,
      parent_id: 0,
      is_regist: 0,
      user_name: 'tester',
      email: 'tester@example.com',
      text: '评论',
      qiniuSuggestion: 'pass'
    }), true);
    assert.equal(createdData.qiniuSuggestion, 'pass');
    assert.equal(createdData.status, '1');

    assert.equal(await commentModel.add({
      a_id: 1,
      parent_id: 0,
      is_regist: 0,
      user_name: 'tester',
      email: 'tester@example.com',
      text: '待人工审核评论',
      qiniuSuggestion: 'review'
    }), true);
    assert.equal(createdData.qiniuSuggestion, 'review');
    assert.equal(createdData.status, '0');
  } finally {
    prisma.comment.create = originalCreate;
  }
});
