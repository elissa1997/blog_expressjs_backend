const prisma = require('../config/db');

async function create(payload) {
  const data = {
    name: payload.name,
    password: payload.password,
    email: payload.email,
    updatedAt: new Date()
  };

  if (payload.admin !== undefined) {
    data.admin = Number.parseInt(payload.admin, 10);
  }

  return prisma.user.create({ data });
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

module.exports = {
  create,
  findByName,
  findById
};
