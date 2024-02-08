const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { validatePayload, verifyToken } = require('../middlewares/payloadValidator');
const { bookSchema, bookUpdateSchema } = require('../schemas/book.schemas');

// Route for getting a book by ID
router.get('/:id', verifyToken, bookController.getBookById);

// Route for adding a new book
router.post('/add-book', verifyToken, validatePayload(bookSchema), bookController.addBook);

// Route for updating a book
router.put('/:id', verifyToken, validatePayload(bookUpdateSchema), bookController.updateBook);

// Route for deleting a book
router.delete('/:id', verifyToken, bookController.deleteBook);

// Route for submitting a review and rating for a book
router.post('/books/:bookId/reviews', bookController.submitBookReview);

// Other routes for book management (update, delete, get, etc.) can be defined here

module.exports = router;
