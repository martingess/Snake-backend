const User = require('../models/userModel');
const Result = require('../models/resultModel')
const sha256 = require('crypto-js/sha256');
var jwt = require('jsonwebtoken');

const config = {
  shaSalt: 'sdkq1ejsO2)#uwv7riuasdj&238g9abBGGGawd81)9*&$**dasdgguqp[z.,vndyERYY',
  jwtSecret: 'ageirusjbjbieiqoepvhjasdoigur831ODideR'
}

const root = {
  login: async (query) => {
    const foundUser = await User.findOne({
      login: query.username
    })
    if (!foundUser) return 'User not found'
    if (foundUser.password === sha256(config.shaSalt + query.password).toString()) {
      return jwt.sign({
        login: foundUser.login,
        role: foundUser.role,
        _id: foundUser._id,
        name: foundUser.name
      }, config.jwtSecret);
    }
    return 'Password is incorrect';
  },
  findUserResults: async (query, {
    thisUser
  }) => {
    const foundResults = await Result.find({
      userId: thisUser.id
    })
    return foundResults;
  },
  findUser: async (query) => {
    const foundUser = await User.findOne({
      login: query.username
    });
    if (!foundUser) return 'User not found';
    return foundUser
  },
  findAllUsers: async () => {
    const allUsers = await User.find();
    return allUsers
  },
  createUser: async (query) => {
    const userExist = await User.findOne({
      $or: [{
        login: query.user.login
      }, {
        email: query.user.email
      }]
    });
    if (userExist) return 'This login or email is already taken'
    const user = await User.create(query.user);
    return jwt.sign({
      login: user.login,
      role: user.role,
      _id: user._id,
      name: user.name
    }, config.jwtSecret);
  },
  createResult: async (query, {thisUser}) => {
    if (!thisUser) return "You need to login first"
    console.log(query)
    return await Result.create({
      ...query.result,
      userId: thisUser.id
    })
  },
  updateResult: async (query, {
    thisUser
  }) => {
    try {
      if (!thisUser) return "You need to login first";
      if (!query.input.id) return "You need to specify id"
      const result = await Result.findOne({
        _id: query.input.id
      });
      if (!result || result.userId != thisUser.id) return 'Access denied';
      const {
        id,
        ...toUpdate
      } = query.input;
      const updatedRsult = Object.assign(result, toUpdate);
      await updatedRsult.save();
      return 'Successfuly updated'
    } catch (e) {
      return 'Some error occured'
    }
  },
  deleteResult: async (query, {
    thisUser
  }) => {
    if (!thisUser) {
      return "Unauthorized access denied"
    }

    if (!query.id.match(/^[0-9a-fA-F]{24}$/)) {
      return "Wrong ID format"
    }
    try {
      const result = await Result.findOne({
        _id: query.id
      })
      if (!result) {
        return 'Result with such ID does not exist'
      }
      if (thisUser.id != result.userId) {
        return 'Permission denied'
      }
      await Result.deleteOne({
        _id: result.id
      })
      return "Success"
    } catch (e) {
      return 'An error occurre'
    }
  }
}

module.exports = root;