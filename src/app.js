const express = require('express');
const routes = require('./routes');
const config = require('./config');
const responseMiddleware = require('./middlewares/response.middleware');
const errorMiddleware = require('./middlewares/error.middleware');
const loggerMiddleware = require('./middlewares/logger.middleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(responseMiddleware);
app.use('/', routes);
app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

module.exports = app;
