require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const validateRegister = require('./middlewares/validateRegister');
const handleValidationErrors = require('./middlewares/handleValidationErrors');
const authenticateJWT = require('./middlewares/authenticateJWT');
const User = require('../db/modules/User');
const RefreshToken = require('../db/modules/RefreshToken');

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, async (req, res, next) => {
  const { account, password, email } = req.body;

  try {
    const userExists = await User.findOne({ account });
    if (userExists) {
      return next(createError(400, 'User already exists'));
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(createError(400, 'Email already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      account,
      password: hashedPassword,
      email,
    });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(createError(500, 'An error occurred while registering the user'));
  }
});

router.post('/login', async (req, res, next) => {
  const { account, password } = req.body;

  try {
    const user = await User.findOne({ account });
    if (!user) {
      return next(createError(404, 'User not found'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createError(401, 'Invalid password'));
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY,
      { expiresIn: '20m' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET_KEY
    );

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        account: user.account,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      },
      accessToken
    });
  } catch (error) {
    next(createError(500, 'An error occurred during login'));
  }
});

router.post('/logout', authenticateJWT, async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(createError(400, 'Refresh token not found'));
    }

    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) {
      return next(createError(400, 'Invalid refresh token'));
    }

    await RefreshToken.deleteOne({ token });
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
      .json({ message: 'Account has been logged out' });
  } catch (error) {
    next(createError(500, 'An error occurred during logout'));
  }
});

router.post('/token', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(createError(400, 'Refresh token not found'));
    }

    const savedToken = await RefreshToken.findOne({ token });
    if (!savedToken) {
      return next(createError(400, 'Invalid refresh token'));
    }

    jwt.verify(token, process.env.REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        return next(createError(403, 'Invalid refresh token'));
      }

      const accessToken = jwt.sign(
        { id: user.id },
        process.env.SECRET_KEY,
        { expiresIn: '20m' }
      );
      res.json({ accessToken });
    });
  } catch (error) {
    next(createError(500, 'An error occurred during token refresh'));
  }
});

router.post('/check-token', async (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return next(createError(400, 'Token missing'));
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return next(createError(403, 'Invalid or expired token'));
    }
    res.status(200).json({ message: 'Token is valid', userId: user.id });
  });
});

router.get('/check-account/:account', async (req, res, next) => {
  try {
    const { account } = req.params;
    const userExists = await User.findOne({ account });
    res.json({ available: !userExists });
  } catch (error) {
    next(createError(500, 'An error occurred while checking the account'));
  }
});

router.get('/check-email/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const emailExists = await User.findOne({ email });
    res.json({ available: !emailExists });
  } catch (error) {
    next(createError(500, 'An error occurred while checking the email'));
  }
});

module.exports = router;