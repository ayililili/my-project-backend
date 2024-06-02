const express = require('express');
const router = express.Router();
const User = require('../modules/User');

/* GET home page. */
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
