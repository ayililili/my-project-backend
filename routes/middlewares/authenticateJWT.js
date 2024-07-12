const jwt = require('jsonwebtoken');
const createError = require('http-errors');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.get('authorization');
  if (!authHeader) {
    return next(createError(401, 'Authorization header missing'));
  }

  const token = authHeader.split(' ')[1];
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
