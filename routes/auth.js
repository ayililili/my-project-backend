require('dotenv').config;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const User = require('../modules/User');

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const userExists = await User.findOne({username});
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const emailExists = await User.findOne({email});
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({
      username,
      password,
      email,
    });

    const savedUser = await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: savedUser._id });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: '1m' }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

module.exports = router;
