require('dotenv').config;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const authenticateJWT = require('./middlewares/authenticateJWT');
const User = require('../db/modules/User');
const RefreshToken = require('../db/modules/RefreshToken');

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

    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: '20m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      process.env.REFRESH_SECRET_KEY,
    )

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true
    })
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token not found' });
    }

    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    await RefreshToken.deleteOne({ token });
    res.clearCookie('refreshToken').json({ message: 'Account has been logged out'});
  } catch (error) {
    res.status(500).json({ error: 'An error occurred during logout' });
  }
});

router.post('/token', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(400).json({ error: 'Refresh token not found' });
    }

    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) {
      return res.status(400).json({ error: 'Invalid refresh token' });
    }

    jwt.verify(token, process.env.REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: '20m' }
      );
      res.json({ accessToken });
    });
  } catch (error) {
    console.error('Error during token refresh:', error);
    res.status(500).json({ error: 'An error occurred during token refresh' });
  }
});

module.exports = router;
