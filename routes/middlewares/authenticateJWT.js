const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.get('authorization');
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.id = user.id;
    req.username = user.username;
    next();
  })
}

module.exports = authenticateJWT;