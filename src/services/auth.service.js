const userModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');

function stripPassword(user) {
  if (!user) {
    return null;
  }

  const { password, ...rest } = user;
  return rest;
}

async function register(payload) {
  if (!payload || !payload.name || !payload.password || !payload.email) {
    const error = new Error('用户名、密码和邮箱不能为空');
    error.status = 400;
    throw error;
  }

  const hashed = await hashPassword(payload.password);
  try {
    const created = await userModel.create({
      ...payload,
      password: hashed
    });
    return stripPassword(created);
  } catch (err) {
    if (err && err.code === 'P2002') {
      const error = new Error('用户名或邮箱已存在');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

async function login(payload) {
  const user = await userModel.findByName(payload.name);
  if (!user) {
    const error = new Error('用户名或密码错误');
    error.status = 401;
    throw error;
  }

  const match = await comparePassword(payload.password, user.password);
  if (!match) {
    const error = new Error('用户名或密码错误');
    error.status = 401;
    throw error;
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    admin: user.admin
  });

  return {
    token,
    user: stripPassword(user)
  };
}

async function info(payload) {
  if (!payload) {
    return null;
  }

  const user = await userModel.findById(payload.id);
  return stripPassword(user);
}

module.exports = {
  register,
  login,
  info
};
