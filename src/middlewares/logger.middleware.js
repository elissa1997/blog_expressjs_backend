function loggerMiddleware(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
    console.log(`${req.method} ${req.originalUrl} ${ip} ${duration}ms`);
  });

  next();
}

module.exports = loggerMiddleware;
