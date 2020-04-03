const express = require('express');
const resultsController = require('../controllers/resultController')
const router = express.Router();


router
  .route('/')
  .post(resultsController.createResult);

router
  .route('/:id');
router
  .route('/img')
  .post(resultsController.createImgResult)

module.exports = router;