const userModel = require('../models/user.model');
const { comparePassword } = require('../utils/bcrypt');
const { signToken } = require('../utils/jwt');

function stripPassword(user) {
  if (!user) {
    return null;
  }

  const { password, ...rest } = user;
  return rest;
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
  login,
  info
};
