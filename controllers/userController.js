const User = require('../models/userModel');
const sha256 = require('crypto-js/sha256');
var jwt = require('jsonwebtoken');


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
    if(foundUser.password === sha256(process.env.SHA_SECRET + req.body.password).toString()){
      return res.json({
        status: 'success',
        data: jwt.sign({ login: foundUser.login, role: foundUser.role, _id: foundUser._id }, process.env.JWT_SECRET)
      });
    }
    return res.json({status: 'fail', data: 'Password is incorrect'});
  } catch (err) {
    res.json({status: 'error', data: err})
  }
}