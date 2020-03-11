const express = require('express');
const resultsController = require('../controllers/resultController')
const router = express.Router();


router
  .route('/')
  .post(resultsController.createResult);

router
  .route('/:id');

module.exports = router;