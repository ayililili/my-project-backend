const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(createError(400, 'Validation failed', { errors: errors.array() }));
  }
  next();
};

module.exports = handleValidationErrors;