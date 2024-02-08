const Purchase = require('../models/Purchase.models.js');
const ObjectId = require('mongoose').Types.ObjectId;
const Book = require('../models/Book.models.js');

const { generatePurchaseId } = require('../services/purchase.services');
const HttpStatus = require('http-status-codes').StatusCodes;
const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');

const addPurchase = async (req, res) => {
    try {

        const userId = req.userId;
        const { bookId, quantity } = req.body;

        const book = await Book.findByBookId(bookId);

        if (!book) {
            errorHandler(res, HttpStatus.BAD_REQUEST, 'Book not found', null);
        }

        // Create a new purchase
        const newPurchase = new Purchase({
            purchaseId: await generatePurchaseId(),
            bookId: book._id,
            userId,
            quantity,
            price: book.price * quantity,
            currentPrice: book.price
        });

        // Save the purchase to the database
        await newPurchase.save();

        // Increment the sellCount of the purchased book
        book.sellCount += quantity;
        await book.save();

        res.status(201).json({ message: 'Purchase recorded successfully' });
    } catch (error) {
        let errorMsg = 'Error adding purchase: ' + error;
        return errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg, error);
    }
};

const getPurchasesByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('userId:', userId);

        const purchases = await Purchase.find({ userId: new ObjectId(userId) }).populate('bookId').exec();

        res.status(200).json(purchases);
    } catch (error) {
        console.error('Error getting purchases by user ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports = {
    addPurchase,
    getPurchasesByUserId
};
