module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '1d'
  },
  qiniu: {
    accessKey: process.env.QINIU_AK,
    secretKey: process.env.QINIU_SK
  }
};