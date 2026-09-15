const test = require('node:test');
const assert = require('node:assert/strict');
const { validateByKey } = require('../src/middlewares/validate.middleware');
const dictModel = require('../src/models/dict.model');

function validate(key, body) {
  let error;
  validateByKey(key)({ body }, {}, (nextError) => {
    error = nextError;
  });
  return error;
}

test('dict add and single-item update require value to be a string', () => {
  assert.equal(validate('POST /dict/add', {
    dict_type: 'article_status',
    name: 'Published',
    value: 'published'
  }), undefined);

  assert.match(validate('POST /dict/add', {
    dict_type: 'article_status',
    name: 'Published',
    value: 1
  }).message, /value 类型必须为 string/);

  assert.equal(validate('POST /dict/update', {
    id: 1,
    dict_type: 'article_status',
    name: 'Published',
    value: 'published'
  }), undefined);
});

test('dict value rejects blank and overlong strings', () => {
  assert.match(validate('POST /dict/add', {
    dict_type: 'article_status',
    name: 'Published',
    value: '   '
  }).message, /value 不能为空/);

  assert.match(validate('POST /dict/add', {
    dict_type: 'article_status',
    name: 'Published',
    value: 'x'.repeat(192)
  }).message, /value 长度不能超过 191/);
});

test('dict service trims value before duplicate checks and writes', async () => {
  const originalFindByType = dictModel.findByType;
  const originalAdd = dictModel.add;
  let lookupValue;
  let writtenValue;

  dictModel.findByType = async ({ value }) => {
    lookupValue = value;
    return { list: [], total: 0 };
  };
  dictModel.add = async (payload) => {
    writtenValue = payload.value;
    return true;
  };

  delete require.cache[require.resolve('../src/services/dict.service')];
  const dictService = require('../src/services/dict.service');

  try {
    assert.equal(await dictService.add({
      dict_type: 'article_status',
      name: 'Published',
      value: '  published  '
    }), true);
    assert.equal(lookupValue, 'published');
    assert.equal(writtenValue, 'published');
  } finally {
    dictModel.findByType = originalFindByType;
    dictModel.add = originalAdd;
    delete require.cache[require.resolve('../src/services/dict.service')];
  }
});
