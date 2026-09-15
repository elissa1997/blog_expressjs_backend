const test = require('node:test');
const assert = require('node:assert/strict');
const { validateByKey } = require('../src/middlewares/validate.middleware');
const articleService = require('../src/services/article.service');
const commentService = require('../src/services/comment.service');
const friendlinkModel = require('../src/models/friendlink.model');
const friendlinkService = require('../src/services/friendlink.service');

function validate(key, body) {
  let error;
  validateByKey(key)({ body }, {}, (nextError) => {
    error = nextError;
  });
  return error;
}

test('dict-backed request fields require strings', () => {
  const article = {
    title: '标题',
    content: '内容',
    category: '1',
    status: '1'
  };
  assert.equal(validate('POST /article/add', article), undefined);
  assert.match(validate('POST /article/add', { ...article, category: 1 }).message, /category 类型必须为 string/);
  assert.match(validate('POST /article/add', { ...article, status: 1 }).message, /status 类型必须为 string/);

  assert.equal(validate('POST /comment/update', { id: 1, status: '1' }), undefined);
  assert.match(validate('POST /comment/update', { id: 1, status: 1 }).message, /status 类型必须为 string/);

  assert.equal(validate('POST /friendlink/update', { id: 1, status: '2' }), undefined);
  assert.match(validate('POST /friendlink/update', { id: 1, status: 2 }).message, /status 类型必须为 string/);
});

test('numeric status and category search values are rejected', async () => {
  await assert.rejects(
    articleService.list({ offset: 1, limits: 10, search: '{"category":1}' }),
    { status: 400, message: 'search.category 类型必须为 string' }
  );
  await assert.rejects(
    commentService.adminList({ offset: 1, limits: 10, search: '{"status":1}' }),
    { status: 400, message: 'search.status 类型必须为 string' }
  );
  await assert.rejects(
    friendlinkModel.adminList({ offset: 1, limits: 10, search: '{"status":1}' }),
    { status: 400, message: 'search.status 类型必须为 string' }
  );
});

test('friendlink updates persist status as a string', async () => {
  const originalFindById = friendlinkModel.findById;
  const originalUpdate = friendlinkModel.update;
  let updatedData;
  friendlinkModel.findById = async () => ({ id: 1 });
  friendlinkModel.update = async (id, data) => {
    updatedData = data;
    return { id };
  };

  try {
    assert.equal(await friendlinkService.update({ id: 1, status: '2' }), true);
    assert.equal(updatedData.status, '2');
  } finally {
    friendlinkModel.findById = originalFindById;
    friendlinkModel.update = originalUpdate;
  }
});
