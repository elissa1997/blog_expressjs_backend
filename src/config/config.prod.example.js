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
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d'
  },
  qiniu: {
    accessKey: "七牛云ak",
    secretKey: "七牛云sk"
  }
};
