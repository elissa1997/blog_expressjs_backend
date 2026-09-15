const test = require('node:test');
const assert = require('node:assert/strict');
const { validateByKey } = require('../src/middlewares/validate.middleware');
const userModel = require('../src/models/user.model');

function validate(key, body) {
  let error;
  validateByKey(key)({ body }, {}, (nextError) => {
    error = nextError;
  });
  return error;
}

test('user add accepts arbitrary non-empty string roles', () => {
  const baseUser = {
    name: 'tester',
    password: 'password',
    email: 'tester@example.com'
  };

  assert.equal(validate('POST /user/add', { ...baseUser, role: 'editor' }), undefined);
  assert.equal(validate('POST /user/add', { ...baseUser, role: '1' }), undefined);
  assert.match(validate('POST /user/add', { ...baseUser, role: 1 }).message, /role 类型必须为 string/);
  assert.match(validate('POST /user/add', { ...baseUser, role: '   ' }).message, /role 不能为空/);
});

test('user update recognizes role as an editable field', () => {
  assert.equal(validate('POST /user/update', { id: 1, role: 'author' }), undefined);
  assert.match(validate('POST /user/update', { id: 1, admin: 1 }).message, /至少需要提供一个字段/);
});

test('admin middleware only authorizes role string 1', async () => {
  const originalFindById = userModel.findById;
  delete require.cache[require.resolve('../src/middlewares/admin.middleware')];
  const adminMiddleware = require('../src/middlewares/admin.middleware');

  try {
    for (const [role, allowed] of [['1', true], ['editor', false], [1, false]]) {
      userModel.findById = async () => ({ id: 7, role });
      let nextCalled = false;
      let failure;
      const req = { user: { id: 7 } };
      const res = {
        fail(message, status) {
          failure = { message, status };
        }
      };

      await adminMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, allowed);
      assert.equal(failure?.status, allowed ? undefined : 403);
    }
  } finally {
    userModel.findById = originalFindById;
    delete require.cache[require.resolve('../src/middlewares/admin.middleware')];
  }
});
