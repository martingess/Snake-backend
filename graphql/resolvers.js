const User = require('../models/userModel');
const Result = require('../models/resultModel')
const sha256 = require('crypto-js/sha256');
var jwt = require('jsonwebtoken');



const isLogedIn = (user) => {
  if (!user) throw 'Access denied (401)'
}

const root = {
  login: async (query) => {
    const foundUser = await User.findOne({
      login: query.username
    })
    if (!foundUser) return 'User not found'
    if (foundUser.password === sha256(process.env.SHA_SECRET + query.password).toString()) {
      return jwt.sign({
        login: foundUser.login,
        role: foundUser.role,
        _id: foundUser._id,
        name: foundUser.name
      }, process.env.JWT_SECRET);
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
    }, process.env.JWT_SECRET);
  },

  createResult: async (query, {
    thisUser
  }) => {
    isLogedIn(thisUser)
    console.log(query)
    return await Result.create({
      ...query.result,
      userId: thisUser.id
    })
  },

  updateResult: async (query, {
    thisUser
  }) => {
    console.log(thisUser)
    isLogedIn(thisUser)
    try {
      if (!query.result.id) return "You need to specify id"
      const result = await Result.findOne({
        _id: query.result.id
      });
      if (!result || result.userId != thisUser.id) return 'Access denied';
      const {
        id,
        ...toUpdate
      } = query.result;
      const updatedResult = Object.assign(result, toUpdate);
      await updatedResult.save();
      return 'Successfuly updated'
    } catch (e) {
      return e
    }
  },

  deleteUser: async (query, {
    thisUser
  }) => {
    try {
      isLogedIn(thisUser);
      const user = await User.findOneAndDelete({
        _id: thisUser._id
      });
      await Result.deleteMany({
        userId: thisUser._id
      })
      return 'Success, user deleted'
    } catch (err) {
      return err;
    }
  },

  updateUser: async (query, {thisUser}) => {
    try {
      console.log(`Log: user ${thisUser.login} trying to update his profile`)
      isLogedIn(thisUser);
      if(sha256(process.env.SHA_SECRET + query.user.password).toString() !== thisUser.password) throw 'Wrong password'
      if(query.user.newPassword) query.user.password = query.user.newPassword;
      const {newPassword, ...restQuery} = query.user;
      const updatedUser = Object.assign(thisUser, restQuery);
      updatedUser.save();
      console.log(`Log: user ${thisUser.login} has updated his profile successfuly`)
      return '200: User info successfuly updated'
    } catch (err) {
      throw err
    }
  },

  deleteResult: async (query, {
    thisUser
  }) => {
    isLogedIn(thisUser)

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