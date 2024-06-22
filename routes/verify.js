const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const authenticateJWT = require('./middlewares/authenticateJWT');
const VerificationToken = require('../modules/VerificationToken');
const User = require('../modules/User');

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

router.post('/verify', authenticateJWT, async (req, res) => {
  const { token } = req.body;

  try {
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).json({ error: 'Token not found' });
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (req.id !== verificationToken.userId.toString()) {
      return res.status(400).json({ error: 'Id does not match' });
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during email verification' });
  }
})

module.exports = router;