const es = require('express-session');
const MongoStore = require('connect-mongo');

const session = es({
  name: 'sid', // cookie name
  secret: process.env.SECRET_KEY,
  saveUninitialized: false, // 收到請求時自動產生
  resave: true, // 重新請求後重置生命週期
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    httpOnly: true, // 無法透過js操作
    maxAge: 24 * 60 * 60 * 1000 // 生命週期(毫秒)
  },
});

module.exports = session;