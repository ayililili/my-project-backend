const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const createError = require('http-errors');

const authenticateJWT = require('./middlewares/authenticateJWT');
const VerificationToken = require('../db/modules/VerificationToken');
const User = require('../db/modules/User');
const sendMail = require('../utils/sendMail');

router.get('/token', authenticateJWT, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.id });
    if (user.isEmailVerified) {
      return next(createError(400, 'Email has already been verified'));
    }

    const token = crypto.randomBytes(6).toString('hex');
    const verificationToken = new VerificationToken({
      userId: req.id,
      token
    });
    await verificationToken.save();

    res.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    next(createError(500, 'An error occurred during token generation'));
  }
});

router.get('/verify', async (req, res, next) => {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return next(createError(400, 'Token not found'));
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return next(createError(400, 'User not found'));
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying token:', error);
    next(createError(500, 'An error occurred during email verification'));
  }
});

router.post('/send-mail', authenticateJWT, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(createError(400, 'Token is required'));
    }

    const tokenExists = await VerificationToken.findOne({ token })
    if (!tokenExists) {
      return next(createError(404, 'Token not found'));
    }

    await sendMail(
      user.email,
      '確認你的電子郵件',
      `請輸入代碼 ${token} 或點擊以下鏈接以驗證你的電子郵件：${process.env.VERIFICATION_URL}${token}`,
      `<p>請輸入代碼 ${token} 或點擊以下鏈接以驗證你的電子郵件：<a href="${process.env.VERIFICATION_URL}${token}">點擊這裡確認你的電子郵件</a></p>`
    );

    res.json({ message: 'Verification email has been Sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    next(createError(500, 'An error occurred while sending verification email'));
  }
});

module.exports = router;
