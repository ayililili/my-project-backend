const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: '10m'
  }
})

module.exports = mongoose.model('verificationToken', verificationTokenSchema);