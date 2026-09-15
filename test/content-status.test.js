const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/db');
const articleModel = require('../src/models/article.model');
const commentModel = require('../src/models/comment.model');
const friendlinkModel = require('../src/models/friendlink.model');

test('public article queries force pass while admin queries can include hide', async () => {
  const originalCount = prisma.article.count;
  const originalFindMany = prisma.article.findMany;
  const originalFindFirst = prisma.article.findFirst;
  const wheres = [];

  prisma.article.count = async ({ where }) => {
    wheres.push(where);
    return 0;
  };
  prisma.article.findMany = async ({ where }) => {
    wheres.push(where);
    return [];
  };
  prisma.article.findFirst = async ({ where }) => {
    wheres.push(where);
    return null;
  };

  try {
    await articleModel.list({ offset: 0, limits: 10, search: { status: 'hide' } });
    assert.deepEqual(wheres.splice(0), [{ status: 'pass' }, { status: 'pass' }]);

    await articleModel.adminList({ offset: 0, limits: 10, search: { status: 'hide' } });
    assert.deepEqual(wheres.splice(0), [{ status: 'hide' }, { status: 'hide' }]);

    await articleModel.detail({ id: 1 });
    assert.deepEqual(wheres.splice(0), [{ id: 1, status: 'pass' }]);
  } finally {
    prisma.article.count = originalCount;
    prisma.article.findMany = originalFindMany;
    prisma.article.findFirst = originalFindFirst;
  }
});

test('public comment and friendlink lists only query pass records', async () => {
  const originalCommentCount = prisma.comment.count;
  const originalCommentFindMany = prisma.comment.findMany;
  const originalFriendlinkCount = prisma.friendlink.count;
  const originalFriendlinkFindMany = prisma.friendlink.findMany;
  const commentWheres = [];
  const friendlinkWheres = [];

  prisma.comment.count = async ({ where }) => {
    commentWheres.push(where);
    return 0;
  };
  prisma.comment.findMany = async ({ where }) => {
    commentWheres.push(where);
    return [];
  };
  prisma.friendlink.count = async ({ where }) => {
    friendlinkWheres.push(where);
    return 0;
  };
  prisma.friendlink.findMany = async ({ where }) => {
    friendlinkWheres.push(where);
    return [];
  };

  try {
    await commentModel.list({ a_id: 1, offset: 1, limits: 10 });
    assert.equal(commentWheres.length, 2);
    assert.ok(commentWheres.every((where) => where.status === 'pass'));

    await friendlinkModel.list({ offset: 1, limits: 10 });
    assert.deepEqual(friendlinkWheres, [{ status: 'pass' }, { status: 'pass' }]);
  } finally {
    prisma.comment.count = originalCommentCount;
    prisma.comment.findMany = originalCommentFindMany;
    prisma.friendlink.count = originalFriendlinkCount;
    prisma.friendlink.findMany = originalFriendlinkFindMany;
  }
});

test('new articles default to hide', async () => {
  const originalCreate = prisma.article.create;
  let createdData;
  prisma.article.create = async ({ data }) => {
    createdData = data;
    return { id: 1 };
  };

  try {
    assert.equal(await articleModel.add({ title: '标题', content: '内容' }), true);
    assert.equal(createdData.status, 'hide');
  } finally {
    prisma.article.create = originalCreate;
  }
});
