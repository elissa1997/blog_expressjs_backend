function responseMiddleware(req, res, next) {
  res.success = (data = {}, msg = '成功', status = 200) => {
    res.status(status).json({
      msg,
      data,
      status
    });
  };

  res.fail = (msg = '请求失败', status = 400, data = {}) => {
    res.status(status).json({
      msg,
      data,
      status
    });
  };

  next();
}

module.exports = responseMiddleware;
