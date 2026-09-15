const prisma = require('../config/db');

const publicSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

function buildSearchWhere(search) {
  const where = {};

  if (search.keyword) {
    where.OR = [
      { name: { contains: search.keyword } },
      { email: { contains: search.keyword } }
    ];
  }

  if (search.name) {
    where.name = { contains: search.name };
  }

  if (search.email) {
    where.email = { contains: search.email };
  }

  if (search.role !== undefined && search.role !== null && search.role !== '') {
    where.role = String(search.role).trim();
  }

  return where;
}

async function create(payload) {
  const data = {
    name: payload.name,
    password: payload.password,
    email: payload.email,
    role: payload.role.trim(),
    updatedAt: new Date()
  };

  return prisma.user.create({ data, select: publicSelect });
}

async function findByName(name) {
  return prisma.user.findUnique({
    where: { name }
  });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id }
  });
}

async function list({ offset, limits, search }) {
  const where = buildSearchWhere(search || {});
  const [total, list] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      skip: offset,
      take: limits,
      select: publicSelect
    })
  ]);

  return { list, total };
}

async function detail(id) {
  return prisma.user.findUnique({
    where: { id },
    select: publicSelect
  });
}

async function update(payload) {
  const data = { updatedAt: new Date() };

  for (const field of ['name', 'password', 'email']) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }

  if (payload.role !== undefined) {
    data.role = payload.role.trim();
  }

  return prisma.user.update({
    where: { id: payload.id },
    data,
    select: publicSelect
  });
}

async function remove(ids) {
  const result = await prisma.user.deleteMany({
    where: { id: { in: ids } }
  });
  return result.count;
}

module.exports = {
  create,
  findByName,
  findById,
  list,
  detail,
  update,
  remove
};
