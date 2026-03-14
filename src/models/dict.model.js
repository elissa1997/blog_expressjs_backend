const prisma = require('../config/db');

function buildSearchWhere(search) {
  const where = {};

  if (search.dict_type) {
    where.dict_type = { contains: search.dict_type };
  }

  if (search.name) {
    where.name = { contains: search.name };
  }

  return where;
}

async function add(payload) {
  const created = await prisma.dict.create({
    data: {
      dict_type: payload.dict_type,
      name: payload.name,
      value: Number.parseInt(payload.value, 10),
      updatedAt: new Date()
    }
  });

  return !!created;
}

async function list({ offset, limits, search, order }) {
  const fixedOrder = order === 'desc' ? 'desc' : 'asc';
  const where = buildSearchWhere(search || {});
  const [total, list] = await Promise.all([
    prisma.dict.count({ where }),
    prisma.dict.findMany({
      where,
      orderBy: [
        { dict_type: fixedOrder },
        { value: fixedOrder },
        { id: fixedOrder }
      ],
      skip: offset,
      take: limits
    })
  ]);

  return { list, total };
}

async function findByType({ dict_type, offset, limits, exact, value, order }) {
  const fixedOrder = order === 'desc' ? 'desc' : 'asc';
  const where = {};

  if (exact) {
    where.dict_type = dict_type;
  } else {
    where.dict_type = { contains: dict_type };
  }

  if (value !== undefined) {
    where.value = value;
  }

  const [total, list] = await Promise.all([
    prisma.dict.count({ where }),
    prisma.dict.findMany({
      where,
      orderBy: [
        { value: fixedOrder },
        { id: fixedOrder }
      ],
      skip: offset,
      take: limits
    })
  ]);

  return { list, total };
}

async function findOneById(id) {
  return prisma.dict.findUnique({
    where: { id },
    select: {
      id: true,
      dict_type: true,
      value: true
    }
  });
}

async function findValueConflict({ dict_type, value, excludeId }) {
  return prisma.dict.findFirst({
    where: {
      dict_type,
      value,
      ...(excludeId ? { NOT: { id: excludeId } } : {})
    },
    select: { id: true }
  });
}

async function findDistinctValuesByType(dict_type) {
  const rows = await prisma.dict.findMany({
    where: { dict_type },
    select: { value: true },
    distinct: ['value']
  });
  return rows.map((row) => row.value);
}

async function existsByDictType(dict_type) {
  const record = await prisma.dict.findFirst({
    where: { dict_type },
    select: { id: true }
  });
  return !!record;
}

async function update(payload) {
  if (payload.mode === 'type') {
    const result = await prisma.dict.updateMany({
      where: {
        dict_type: payload.dict_type
      },
      data: {
        dict_type: payload.update_dict_type,
        updatedAt: new Date()
      }
    });

    return result.count > 0;
  }

  try {
    const updated = await prisma.dict.update({
      where: { id: payload.id },
      data: {
        dict_type: payload.dict_type,
        name: payload.name,
        value: Number.parseInt(payload.value, 10),
        updatedAt: new Date()
      }
    });
    return !!updated;
  } catch (err) {
    if (err && err.code === 'P2025') {
      return false;
    }
    throw err;
  }
}

async function remove(payload) {
  const where = {};

  if (payload.mode === 'dict_type') {
    where.dict_type = { in: payload.dict_type };
  } else {
    where.id = { in: payload.id };
  }

  const result = await prisma.dict.deleteMany({ where });
  return result.count > 0;
}

module.exports = {
  add,
  list,
  findByType,
  findOneById,
  findValueConflict,
  findDistinctValuesByType,
  existsByDictType,
  update,
  remove
};
