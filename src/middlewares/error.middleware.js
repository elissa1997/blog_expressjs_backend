function errorMiddleware(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  const msg = (err.message || '服务器内部错误').split('\n')[0];

  if (typeof res.fail === 'function') {
    return res.fail(msg, status);
  }

  return res.status(status).json({
    msg,
    data: {},
    status
  });
}

module.exports = errorMiddleware;
