const User = require('../models/userModel');
const Result = require('../models/resultModel');
const sha256 = require('crypto-js/sha256');
var jwt = require('jsonwebtoken');

const isLogedIn = (user) => {
  if (!user) throw 'Access denied (401)';
};

const isResultExsist = (result) => {
  if (!result) throw 'Results not found';
};

const checkId = (id) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw 'Wrong ID format';
  }
};

const isUserDoctor = (user) => {
  if (user.role !== 'doctor') {
    throw 'You must be doctor for this action ';
  }
};

const isQueryEmpty = (query) => {
  if(query === "") throw 'Your query is invalid'
}

const root = {
  login: async (query) => {
    const foundUser = await User.findOne({
      login: query.username,
    });
    if (!foundUser) return 'User not found';
    if (
      foundUser.password ===
      sha256(process.env.SHA_SECRET + query.password).toString()
    ) {
      return jwt.sign(
        {
          login: foundUser.login,
          role: foundUser.role,
          _id: foundUser._id,
          name: foundUser.name,
        },
        process.env.JWT_SECRET,
      );
    }
    return 'Password is incorrect';
  },

  findUserResults: async (query, { thisUser }) => {
    isLogedIn(thisUser);
    const foundResults = await Result.find({
      userId: thisUser.id,
    });
    if (!foundResults[0]) throw 'No results found';
    return foundResults;
  },

  findUser: async (query) => {
    const foundUser = await User.findOne({
      login: query.username,
    });
    if (!foundUser) return 'User not found';
    return foundUser;
  },

  findAllUsers: async () => {
    const allUsers = await User.find();
    return allUsers;
  },

  createUser: async (query) => {
    const userExist = await User.findOne({
      $or: [
        {
          login: query.user.login,
        },
        {
          email: query.user.email,
        },
      ],
    });
    if (userExist) return 'This login or email is already taken';
    const user = await User.create(query.user);
    return jwt.sign(
      {
        login: user.login,
        role: user.role,
        _id: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET,
    );
  },

  createResult: async (query, { thisUser }) => {
    isLogedIn(thisUser);
    console.log(query);
    return await Result.create({
      ...query.result,
      userId: thisUser.id,
    });
  },

  updateResult: async (query, { thisUser }) => {
    try {
      //validation
      isLogedIn(thisUser);
      if (!query.result.id) return 'You need to specify id';
      const result = await Result.findOne({
        _id: query.result.id,
      });
      isResultExsist(result);
      if (!result || result.userId != thisUser.id)
        return 'Access denied';
      //cut off unnecessary fields
      const { id, shareWithDoctor, ...toUpdate } = query.result;
      //is user trying to add new doctor? If so, add doctor to result
      if (shareWithDoctor) {
        checkId(shareWithDoctor);
        if (
          !result.waitingDoctorsConfirmation.includes(
            shareWithDoctor,
          ) &&
          !result.doctorsIds.includes(shareWithDoctor)
        ) {
          result.waitingDoctorsConfirmation.push(shareWithDoctor);
        }
      }
      const updatedResult = Object.assign(result, toUpdate);

      await updatedResult.save();
      return 'Successfuly updated';
    } catch (e) {
      return e;
    }
  },

  deleteUser: async (query, { thisUser }) => {
    try {
      isLogedIn(thisUser);
      await User.findOneAndDelete({
        _id: thisUser._id,
      });
      await Result.deleteMany({
        userId: thisUser._id,
      });
      return 'Success, user deleted';
    } catch (err) {
      return err;
    }
  },

  updateUser: async (query, { thisUser }) => {
    try {
      console.log(
        `Log: user ${thisUser.login} trying to update his profile`,
      );
      isLogedIn(thisUser);
      if (
        sha256(
          process.env.SHA_SECRET + query.user.password,
        ).toString() !== thisUser.password
      )
        throw 'Wrong password';
      if (query.user.newPassword)
        query.user.password = query.user.newPassword;
      const { newPassword, ...restQuery } = query.user;
      const updatedUser = Object.assign(thisUser, restQuery);
      await updatedUser.save();
      console.log(
        `Log: user ${thisUser.login} has updated his profile successfuly`,
      );
      return '200: User info successfuly updated';
    } catch (err) {
      throw err;
    }
  },

  deleteResult: async (query, { thisUser }) => {
    isLogedIn(thisUser);
    checkId(query.id);
    try {
      const result = await Result.findOne({
        _id: query.id,
      });
      if (!result) {
        return 'Result with such ID does not exist';
      }
      if (thisUser.id != result.userId) {
        return 'Permission denied';
      }
      await Result.deleteOne({
        _id: result.id,
      });
      return 'Success';
    } catch (e) {
      return 'An error occurre';
    }
  },

  search: async (query, { thisUser }) => {
    if (!query.query) throw 'Not found';
    isLogedIn(thisUser);
    const regExpQuery = { $regex: query.query, $options: 'i' };
    const results = await Result.find({
      userId: thisUser.id,
      $or: [
        { name: regExpQuery },
        { note: regExpQuery },
        { doctorName: regExpQuery },
      ],
    });
    if (!results[0]) throw 'Not found';
    return results;
  },

  //doctor section
  resultsForApprove: async (query, { thisUser }) => {
    isLogedIn(thisUser);
    const results = await Result.find({
      waitingDoctorsConfirmation: thisUser.id,
    });
    return results;
  },

  approveResult: async (query, { thisUser }) => {
    try {
      isLogedIn(thisUser);
      const result = await Result.findOne({ _id: query.id });
      isResultExsist(result);
      if (result.waitingDoctorsConfirmation.includes(thisUser.id)) {
        result.waitingDoctorsConfirmation = result.waitingDoctorsConfirmation.filter(
          (item) => item != thisUser.id,
        );
        result.doctorsIds.push(thisUser.id);
        await result.save();
        return 'Result aproved';
      }
      throw 'You are is not in confirm-for-share list for this result';
    } catch (err) {
      return err;
    }
  },
  removeDoctorFromResult: async (query, { thisUser }) => {
    isLogedIn(thisUser);
    isQueryEmpty(query.doctorId);
    isQueryEmpty(query.resultId);
    //if user is doctor who tries to delete himself from result
    if (!query.doctorId) {
      isUserDoctor(thisUser);
      query.doctorId = thisUser.id
      const result = await Result.findOne({
        _id: query.resultId,
        $or: [
          { waitingDoctorsConfirmation: thisUser.id },
          { doctorsIds: thisUser.id },
        ],
      });
      isResultExsist(result);
      await deleteDoctorFromResult(result);
      return 'You are delted from this result'
    }
    //if user is owner who tries to delete doctor from result
    const result = await Result.findById(query.resultId);
    if (result.userId != thisUser.id) throw 'Access denied';
    isResultExsist(result);
    await deleteDoctorFromResult(result);
    return 'Doctor deleted from result'
    async function deleteDoctorFromResult (result) {
      result.waitingDoctorsConfirmation = result.waitingDoctorsConfirmation.filter(
        (item) => item != query.doctorId,
      );
      result.doctorsIds = result.doctorsIds.filter(
        (item) => item != query.doctorId,
      );
      await result.save();
    }
  },
  findDoctorResults: async (query, {thisUser}) => {
    isLogedIn(thisUser);
    const results = await Result.find({doctorsIds: thisUser.id})
    return results;
  }
};

module.exports = root;
