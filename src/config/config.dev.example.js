module.exports = {
  port: 3000,
  databaseUrl: "mysql://user:password@localhost:3366/blog",
  jwt: {
    secret: "your_jwt_secret",
    expiresIn: '1d'
  },
  qiniu: {
    accessKey: "七牛云ak",
    secretKey: "七牛云sk"
  }
};