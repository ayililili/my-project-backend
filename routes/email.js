require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const createError = require('http-errors');

const authenticateJWT = require('./middlewares/authenticateJWT');
const VerificationToken = require('../db/modules/VerificationToken');
const User = require('../db/modules/User');
const sendMail = require('../utils/sendMail');

router.post('/verify-email', authenticateJWT, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.id });
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    if (user.isEmailVerified) {
      return next(createError(400, 'Email has already been verified'));
    }

    const token = crypto.randomBytes(6).toString('hex');
    const verificationToken = new VerificationToken({
      userId: req.id,
      token,
      type: 'email'
    });
    await verificationToken.save();

    await sendMail(
      user.email,
      '確認你的電子郵件',
      `請輸入代碼 ${token} 或點擊以下鏈接以驗證你的電子郵件：${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      `<p>請輸入代碼 ${token} 或點擊以下鏈接以驗證你的電子郵件：<a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">點擊這裡確認你的電子郵件</a></p>`
    );

    res.json({ message: 'Verification email has been sent' });
  } catch (error) {
    console.error('Error generating token or sending email:', error);
    next(createError(500, 'An error occurred during token generation or email sending'));
  }
});

router.get('/verify-token', async (req, res, next) => {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token, type: 'email' });
    if (!verificationToken) {
      return res.status(400).json({ status: 'failed', message: 'Invalid or expired token' });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return res.status(400).json({ status: 'failed', message: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.json({ status: 'success', message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying token:', error);
    next(createError(500, 'Internal server error'));
  }
});

module.exports = router;
