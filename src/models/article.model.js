const prisma = require('../config/db');

function buildSearchWhere(search) {
  const where = {};

  if (search.title) {
    where.title = { contains: search.title };
  }

  if (search.category !== undefined && search.category !== null && search.category !== '') {
    where.category = search.category.trim();
  }

  if (search.status !== undefined && search.status !== null && search.status !== '') {
    where.status = search.status.trim();
  }

  return where;
}

async function list({ offset, limits, search }) {
  const where = buildSearchWhere(search || {});
  const [total, list] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: offset,
      take: limits,
      select: {
        id: true,
        title: true,
        cover: true,
        content: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);

  return { list, total };
}

async function detail({ id }) {
  return prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      cover: true,
      content: true,
      category: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

async function add(payload) {
  const title = payload.title;
  const cover = payload.cover || null;
  const content = payload.content;
  const category = payload.category ? payload.category.trim() : '0';
  const status = payload.status ? payload.status.trim() : '0';

  const created = await prisma.article.create({
    data: {
      title,
      cover,
      content,
      category,
      status,
      updatedAt: new Date()
    }
  });

  return !!created;
}

async function update(payload) {
  const data = {};

  if (payload.title !== undefined) {
    data.title = payload.title;
  }

  if (payload.cover !== undefined) {
    data.cover = payload.cover;
  }

  if (payload.content !== undefined) {
    data.content = payload.content;
  }

  if (payload.category !== undefined) {
    data.category = payload.category.trim();
  }

  if (payload.status !== undefined) {
    data.status = payload.status.trim();
  }

  if (Object.keys(data).length === 0) {
    return false;
  }

  data.updatedAt = new Date();

  try {
    const updated = await prisma.article.update({
      where: { id: payload.a_id },
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

async function remove({ ids }) {
  const result = await prisma.article.deleteMany({
    where: {
      id: { in: ids }
    }
  });
  return result.count > 0;
}

module.exports = {
  list,
  detail,
  add,
  update,
  remove
};
