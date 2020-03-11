const User = require('../models/userModel');

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
    res.status(400).json(err);
  }
}