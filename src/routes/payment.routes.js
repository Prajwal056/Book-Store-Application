const paymentController = require('../controllers/payment.controller');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/payloadValidator');

// Route for getting a book by ID
router.post('/book', verifyToken, paymentController.addPurchaseWithPayment);

// Route for adding a new book
module.exports = router;