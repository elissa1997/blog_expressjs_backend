const env = process.env.NODE_ENV || "development";
let config;
if (env === "production") {
  config = require("./config.prod");
} else {
  config = require("./config.dev");
}

module.exports = config;
