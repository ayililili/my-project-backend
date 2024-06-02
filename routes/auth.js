const express = require('express');
const router = express.Router();
const User = require('../modules/User');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username })
    res.send(user.password);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
