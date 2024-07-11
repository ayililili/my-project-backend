require('dotenv').config(); // 確保在其他配置之前加載環境變數

const http = require('http');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('./db/mongoose');
const cors = require('cors');

const app = express();

// 導入中間件、路由
const authRouter = require('./routes/auth');
const verifyRouter = require('./routes/verify');
const passwordRouter = require('./routes/password');
const youtubeRouter = require('./routes/youtube');

// 使用 CORS 中間件
app.use(cors());

// 使用日誌記錄中間件
app.use(logger('dev'));

// 解析 JSON 和 URL 編碼的請求體
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 解析 cookie
app.use(cookieParser());

// 提供靜態文件
app.use(express.static(path.join(__dirname, 'public')));

// 使用路由
app.use('/auth', authRouter);
app.use('password', passwordRouter);
app.use('/verify', verifyRouter);
app.use('/youtube', youtubeRouter);

// 捕捉 404 錯誤並轉發給錯誤處理中間件
app.use((req, res, next) => {
  next(createError(404));
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  // 設置本地變量，僅在開發環境中提供錯誤
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 發送錯誤頁面
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;
