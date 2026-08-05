module.exports = {
  port: process.env.PORT || 3000,
  trustProxy: 1,
  rateLimit: {
    enabled: true,
    comment: {
      windowMinutes: 5,
      limit: 10
    },
    friendlink: {
      windowMinutes: 30,
      limit: 2
    }
  },
  databaseUrl: "mysql://user:password@服务器线上ip:3366/blog",
  jwt: {
    secret: "your_jwt_secret",
    expiresIn: '1d'
  },
  qiniu: {
    accessKey: "七牛云ak",
    secretKey: "七牛云sk"
  }
};
