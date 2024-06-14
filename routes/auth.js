const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../modules/User');
const VerificationToken = require('../modules/VerificationToken');
const sendMail = require('../utils/sendMail');

router.get('/mail', (req, res) => {
  console.log(req.query);
  sendMail(req.query.to, req.query.sub, req.query.text, req.query.html);
  res.send('send mail');
})

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  const user = new User({
    username,
    password,
    email,
  });

  try {
    const savedUser = await user.save();
    const token = crypto.randomBytes(3).toString('hex');
    const verificationToken = new VerificationToken({
      userId: savedUser._id,
      token
    })
    await verificationToken.save();

    res.status(201).send(token);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('error');
  }
})

router.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  try {
    const verificationToken = await VerificationToken.findOne({ token });
    if (!verificationToken) {
      return res.status(400).send('Invalid or expired token');
    }

    const user = await User.findById(verificationToken.userId);
    if (!user) {
      return res.status(400).send('User not found');
    }

    user.isEmailVerified = true;
    await user.save();

    await VerificationToken.deleteOne({ token });

    res.send('Email verified successfully');
  } catch (error) {
    res.status(500).send('An error occurred during email verification');
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username })
    res.send(user.password);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).send('error');
  }
});

module.exports = router;
