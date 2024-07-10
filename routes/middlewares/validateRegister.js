const { body } = require('express-validator');

const validateRegister = [
  body('account')
    .isLength({ min: 3, max: 30 }).withMessage('Account must be between 3 and 30 characters')
    .matches(/^\w+$/).withMessage('Account can only contain letters, numbers, and underscores')
    .trim()
    .toLowerCase(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .trim(),
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

module.exports = validateRegister;