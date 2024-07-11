require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const createError = require('http-errors');
const VerificationToken = require('../db/modules/VerificationToken');
const User = require('../db/modules/User');
const sendMail = require('../utils/sendMail');

const router = express.Router();

router.post('/forgot-password', async (req, res, next) => {
  const { account } = req.body;

  try {
    const user = await User.findOne({ account });
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const token = crypto.randomBytes(6).toString('hex');
    const resetToken = new VerificationToken({
      userId: user._id,
      token,
      type: 'password'
    });
    await resetToken.save();

    await sendMail(
      user.email,
      '重設密碼',
      `請點擊以下鏈接以重設密碼：${process.env.RESET_PASSWORD_URL}?token=${token}`,
      `<p>請點擊以下鏈接以重設密碼：<a href="${process.env.RESET_PASSWORD_URL}?token=${token}">點擊這裡重設密碼</a></p>`
    );

    res.json({ message: 'Password reset email has been sent' });
  } catch (error) {
    console.error('Error generating token or sending email:', error);
    next(createError(500, 'An error occurred during token generation or email sending'));
  }
});

router.get('/reset-password', async (req, res) => {
  const { token } = req.query;

  try {
    const resetToken = await VerificationToken.findOne({ token, type: 'password' });
    if (!resetToken) {
      return res.redirect(`${process.env.FRONTEND_URL}/reset-password?status=failed`);
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/reset-password?status=failed`);
    }

    res.redirect(`${process.env.FRONTEND_URL}/reset-password?token=${token}`);
  } catch (error) {
    console.error('Error verifying token:', error);
    res.redirect(`${process.env.FRONTEND_URL}/reset-password?status=failed`);
  }
});

router.post('/reset-password', async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const resetToken = await VerificationToken.findOne({ token, type: 'password' });
    if (!resetToken) {
      return next(createError(400, 'Invalid or expired token'));
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    next(createError(500, 'An error occurred during password reset'));
  }
});

module.exports = router;
