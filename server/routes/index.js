const express = require('express');
const priceController = require('../controllers/price');

const router = express.Router();

// Wrapper to catch errors for async/await middlewares
const catchErrors = fn =>
  (req, res, next) =>
    fn(req, res, next).catch(next);

router.get('/:id', catchErrors(priceController.fetchPrices));

module.exports = router;
