const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../modules/User');
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
    await user.save();
    res.status(201).send('ok');
  } catch (error) {
    console.log('Error:', error);
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username })
    res.send(user.password);
  } catch (error) {
    console.log('Error:', error);
  }
});

module.exports = router;
