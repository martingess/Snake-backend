const mongoose = require('mongoose');

const resultScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    default: Date.now()
  },
  url: {
    type: String,
    required: true
  },
  doctorName: String,
  analyzeType: {
    type: String,
    required: true
  },
  note: String
});

const Result = mongoose.model('Result', resultScheme)
module.exports = Result;