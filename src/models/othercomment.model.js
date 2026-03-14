const prisma = require('../config/db');
const { parsePagination, formatPagination, toDbOffset } = require('../utils/pagination');
function parseSearch(search) {
  if (!search) {
    return {};
  }

  if (typeof search === 'object') {
    return search;
  }

  try {
    return JSON.parse(search);
  } catch (err) {
    return {};
  }
}

function buildSearchWhere(search, options = {}) {
  const { includeContent = false } = options;
  const where = {};
  const parsedType = Number.parseInt(search.type, 10);
  const parsedStatus = Number.parseInt(search.status, 10);

  if (!Number.isNaN(parsedType)) {
    where.type = parsedType;
  }

  if (!Number.isNaN(parsedStatus)) {
    where.status = parsedStatus;
  }

  if (search.user_name) {
    where.user_name = { contains: search.user_name };
  }

  if (search.email) {
    where.email = { contains: search.email };
  }

  const contentKeyword = search.content || search.text;
  if (includeContent && contentKeyword) {
    where.text = { contains: contentKeyword };
  }

  return where;
}

function normalizeParentId(parentId) {
  const parsed = Number.parseInt(parentId, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

async function add(payload) {
  const created = await prisma.othercomment.create({
    data: {
      type: Number.parseInt(payload.type || 0, 10),
      parent_id: normalizeParentId(payload.parent_id),
      is_regist: Number.parseInt(payload.is_regist || 0, 10),
      user_name: payload.user_name,
      email: payload.email,
      url: payload.url || null,
      ip: payload.ip || '127.0.0.1',
      agent: payload.agent || 'unknow',
      text: payload.text || null,
      status: 1,
      updatedAt: new Date()
    }
  });

  return !!created;
}

async function collectTreeIds(rootIds) {
  const allIds = new Set(rootIds);
  let parentIds = [...rootIds];

  while (parentIds.length > 0) {
    const children = await prisma.othercomment.findMany({
      where: {
        parent_id: { in: parentIds },
        status: 1
      },
      select: { id: true }
    });

    const nextParentIds = [];
    for (const child of children) {
      if (!allIds.has(child.id)) {
        allIds.add(child.id);
        nextParentIds.push(child.id);
      }
    }
    parentIds = nextParentIds;
  }

  return [...allIds];
}

async function fetchTreeListByRootIds(rootIds) {
  if (rootIds.length === 0) {
    return [];
  }

  const treeIds = await collectTreeIds(rootIds);
  return prisma.othercomment.findMany({
    where: { id: { in: treeIds } },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  });
}

async function list(query) {
  const { offset, limits } = parsePagination(query);
  const topWhere = {
    parent_id: null,
    status: 1
  };

  if (query.type !== undefined && query.type !== null && query.type !== '') {
    topWhere.type = Number.parseInt(query.type, 10);
  }

  const [total, roots] = await Promise.all([
    prisma.othercomment.count({ where: topWhere }),
    prisma.othercomment.findMany({
      where: topWhere,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: toDbOffset(offset, limits),
      take: limits,
      select: { id: true }
    })
  ]);

  const list = await fetchTreeListByRootIds(roots.map((item) => item.id));
  return formatPagination(list, total, offset, limits);
}

async function adminList(query) {
  const { offset, limits } = parsePagination(query);
  const search = parseSearch(query.search);
  const where = buildSearchWhere(search, { includeContent: true });

  const [total, list] = await Promise.all([
    prisma.othercomment.count({ where }),
    prisma.othercomment.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: toDbOffset(offset, limits),
      take: limits
    })
  ]);

  return formatPagination(list, total, offset, limits);
}

async function remove(payload) {
  const rootIds = Array.isArray(payload.id)
    ? payload.id.map((id) => Number.parseInt(id, 10)).filter((id) => Number.isInteger(id))
    : [];
  const uniqueRootIds = [...new Set(rootIds)];

  if (uniqueRootIds.length === 0) {
    return false;
  }

  const result = await prisma.othercomment.deleteMany({
    where: {
      id: { in: uniqueRootIds }
    }
  });

  return result.count === uniqueRootIds.length;
}

async function update(payload) {
  const data = {};

  if (payload.status !== undefined) {
    data.status = Number.parseInt(payload.status, 10);
  }

  if (Object.keys(data).length === 0) {
    return false;
  }

  data.updatedAt = new Date();

  try {
    const updated = await prisma.othercomment.update({
      where: { id: Number.parseInt(payload.id, 10) },
      data
    });
    return !!updated;
  } catch (err) {
    if (err && err.code === 'P2025') {
      return false;
    }
    throw err;
  }
}

module.exports = {
  add,
  list,
  adminList,
  remove,
  update
};
