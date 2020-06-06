const mongoose = require('mongoose');
const UserModel = require('./userModel');

class ResultClass {
  get user() {
    return (async () => {
      return await UserModel.findOne({
        _id: this.userId
      })
    })()
  }
  get id() {
    return this._id
  }
  get doctors() {
    return (async () => await Promise.all(this.doctorsIds.map(id => UserModel.findOne({
      _id: id
    }))))
  }
  get notConfirmedDoctors() {
    return (async () => await Promise.all(this.waitingDoctorsConfirmation.map(id => UserModel.findOne({
      _id: id
    }))))
  }
}

const resultScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: Date.now()
  },
  imgsPaths: {
    type: Array,
    required: true
  },
  doctorsIds: [String],
  doctorName: String,
  waitingDoctorsConfirmation: [String],
  doctorsComments: [String],
  note: String,
  userId: {
    type: String,
    required: true
  },

});

resultScheme.loadClass(ResultClass)
const Result = mongoose.model('Result', resultScheme)
module.exports = Result;