const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const authenticateJWT = require('./middlewares/authenticateJWT');
const VerificationToken = require('../db/modules/VerificationToken');
const User = require('../db/modules/User');
const sendMail = require('../utils/sendMail');

router.get('/token', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.id });
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email has been authenticated' });
    }

    const token = crypto.randomBytes(3).toString('hex');
    const verificationToken = new VerificationToken({
      userId: req.id,
      token
    });
    await verificationToken.save();

    res.json({ token: token });
  } catch {
    res.status(500).json({ error: 'An error occurred during token generation' });
  }
})

router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({ error: 'Token not found' });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during email verification' });
  }
})

router.post('/send-mail', authenticateJWT, async (req, res) => {
  try {
    const token = req.body.token;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    sendMail(
      user.email,
      '確認你的信箱',
      `輸入代碼${token}或點擊以下連結: ${process.env.VERIFICATION_URL}${token}`,
      `<p>輸入代碼${token}或點擊以下連結: <a href=${process.env.VERIFICATION_URL}${token}>點擊認證信箱</a>`
    );

    res.json({ message: 'Verification email sent' });
  } catch (error) {
      res.status(500).json({ error: 'An error occurred during sending verification email'});
  }
})

module.exports = router;