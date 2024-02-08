const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { validatePayload, verifyToken } = require('../middlewares/payloadValidator');


// Route for recording a new purchase
router.post('/add', verifyToken, purchaseController.addPurchase);
router.get('/get', verifyToken, purchaseController.getPurchasesByUserId);


// Other routes for purchase history management (retrieve, update, delete, etc.) can be defined here

module.exports = router;


