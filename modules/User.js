const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require :true,
    unique :true,
    trim :true,
    minlength: 3,
    maxlength: 30,
    lowercase: true,
    match: /^\w+$/
  },
  password: {
    type: String,
    require :true,
    trim :true,
  },
  email: {
    type: String,
    required :true,
    unique :true,
    lowercase: true,
    match: /^\w+@(\w+\.)+\w{2,}$/
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    console.log('123');
    try {
      const salt = await bcrypt.genSalt(10);
      console.log(this);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
})

module.exports = mongoose.model('user', userSchema);