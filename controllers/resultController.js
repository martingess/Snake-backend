const Result = require('../models/resultModel');
exports.createResult = async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(400).json({status: 'fail', data: error})
  }
};