const mongoose = require('mongoose');
const sha256 = require('crypto-js/sha256');

//TODO: переместить в окружающие эту переменную >>
const config = {
  shaSalt: 'sdkq1ejsO2)#uwv7riuasdj&238g9abBGGGawd81)9*&$**dasdgguqp[z.,vndyERYY',
}

class UserClass {
  get id() {
    return this._id
  }
}

const userScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  login: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  avatar: String,
  role: {
    type: String,
    default: 'user'
  }
});

userScheme.loadClass(UserClass)

userScheme.pre('save', function(next) {
  this.password = sha256(config.shaSalt + this.password).toString();
  next();
});

const User = mongoose.model('User', userScheme)

//TODO: delete this 
// const func = async ()=>{
//   const user = await User.findOne({login: "Max"})
//   console.log(user)
//   console.log(user.id)
// }
// func()


module.exports = User;