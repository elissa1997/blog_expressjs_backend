const prisma = require('../config/db');
const { parsePagination, formatPagination, toDbOffset } = require('../utils/pagination');

function parseSearch(search) {
  if (!search) return {};
  if (typeof search === 'object') return search;

  try {
    return JSON.parse(search);
  } catch (err) {
    return {};
  }
}

function buildAdminWhere(search) {
  const where = {};
  if (search.name) where.name = { contains: search.name };
  if (search.url) where.url = { contains: search.url };

  const status = Number.parseInt(search.status, 10);
  if (!Number.isNaN(status)) where.status = status;
  if (search.qiniuSuggestion) where.qiniuSuggestion = search.qiniuSuggestion;
  return where;
}

async function findByUrlHash(urlHash) {
  return prisma.friendlink.findUnique({ where: { urlHash } });
}

async function findById(id) {
  return prisma.friendlink.findUnique({ where: { id } });
}

async function add(data) {
  return prisma.friendlink.create({ data });
}

async function list(query) {
  const { offset, limits } = parsePagination(query);
  const where = { status: 1 };
  const [total, list] = await Promise.all([
    prisma.friendlink.count({ where }),
    prisma.friendlink.findMany({
      where,
      orderBy: [{ sort: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: toDbOffset(offset, limits),
      take: limits,
      select: { id: true, name: true, url: true, createdAt: true }
    })
  ]);
  return formatPagination(list, total, offset, limits);
}

async function adminList(query) {
  const { offset, limits } = parsePagination(query);
  const where = buildAdminWhere(parseSearch(query.search));
  const [total, list] = await Promise.all([
    prisma.friendlink.count({ where }),
    prisma.friendlink.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: toDbOffset(offset, limits),
      take: limits,
      select: {
        id: true,
        name: true,
        url: true,
        status: true,
        qiniuSuggestion: true,
        sort: true,
        ip: true,
        agent: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ]);
  return formatPagination(list, total, offset, limits);
}

async function update(id, data) {
  return prisma.friendlink.update({ where: { id }, data });
}

async function remove(ids) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.friendlink.count({ where: { id: { in: ids } } });
    if (count !== ids.length) return false;
    await tx.friendlink.deleteMany({ where: { id: { in: ids } } });
    return true;
  });
}

module.exports = {
  findByUrlHash,
  findById,
  add,
  list,
  adminList,
  update,
  remove
};
