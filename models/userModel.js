const mongoose = require('mongoose');

const userScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  login: {
    type: String,
    default: function (){
      return this.email
    }
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  avatar: String,
});

const User = mongoose.model('User', userScheme)
module.exports = User;