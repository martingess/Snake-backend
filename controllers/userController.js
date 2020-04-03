const User = require('../models/userModel');
const sha256 = require('crypto-js/sha256');
var jwt = require('jsonwebtoken');

//TODO: переместить в окружающие эту переменную >>
const config = {
  shaSalt: 'sdkq1ejsO2)#uwv7riuasdj&238g9abBGGGawd81)9*&$**dasdgguqp[z.,vndyERYY',
  jwtSecret: 'ageirusjbjbieiqoepvhjasdoigur831ODideR'
}

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json({
      satus: 'success',
      data: {
        login: newUser.login,
        _id: newUser._id
      }
    })
  } catch (err) {
    res.status(400).json({
      status: 'error',
      data: err
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const foundUser = await User.findOne({login: req.body.login})
    if (!foundUser) return res.json({status: 'fail', data: 'User not found'})
    if(foundUser.password === sha256(config.shaSalt + req.body.password).toString()){
      return res.json({
        status: 'success',
        data: jwt.sign({ login: foundUser.login, role: foundUser.role, _id: foundUser._id }, config.jwtSecret)
      });
    }
    return res.json({status: 'fail', data: 'Password is incorrect'});
  } catch (err) {
    res.json({status: 'error', data: err})
  }
}