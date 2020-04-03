const Result = require('../models/resultModel');
const formidable = require('formidable');

function parseData(onlyFiles, req, res) {
  if (req.user) {
    const form = formidable({
      multiples: true,
      uploadDir: 'public/img'
    })
    form.parse(req, async (err, fields, files) => {
      const filesPath = Object.keys(files).map(file => files[file].path)
      if (onlyFiles) {
        res.json({
          status: "success",
          data: filesPath
        })
        return;
      } else {
        try {
          const result = await Result.create({
            ...fields,
            urls: filesPath,
            userId: req.user._id
          });
          res.json({
            status: "success",
            data: result
          })
        } catch (e) {
          res.status(400).json({
            status: 'fail',
            data: e
          });
        }
      };
    });
    return;
  }
  return res.json({status: "failed", data: "you need to log in first"})
}

exports.createResult = async (req, res, next) => {
  parseData(false, req, res)
};

exports.createImgResult = async (req, res) => {
  parseData(true, req, res)
}