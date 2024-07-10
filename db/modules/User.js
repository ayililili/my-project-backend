const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    lowercase: true,
    match: /^\w+$/
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+@(\w+\.)+\w{2,}$/
  },
  username: {
    type: String,
    trim: true,
    maxlength: 30,
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
});

userSchema.pre('save', function(next) {
  if (!this.username) {
    this.username = this.account;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
