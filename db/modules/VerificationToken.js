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
  type: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10m'
  }
})

module.exports = mongoose.model('verificationToken', verificationTokenSchema);