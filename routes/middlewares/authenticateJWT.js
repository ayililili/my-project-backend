const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const authenticateJWT = (req, res, next) => {
  const token = req.get('authorization');
  if (!token) {
    return next(createError(401, 'Token missing'));
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return next(createError(403, 'Invalid or expired token'));
    }
    req.id = user.id;
    next();
  });
};

module.exports = authenticateJWT;
