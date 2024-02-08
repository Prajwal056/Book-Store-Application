const Book = require('../models/Book.models');
const User = require('../models/User.models');
const slugify = require('slugify');
const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');
const HttpStatus = require('http-status-codes').StatusCodes;

const addBook = async (req, res) => {
    try {
        const { bookId, authors, title, description, price } = req.body;

        if (authors.length == 0) {
            errorHandler(res, HttpStatus.BAD_REQUEST, 'authors can not be empty!', null)
        }

        let allAuthors = await User.find({
            username: {
                $in: authors,
                $regex: new RegExp(authors.join('|'), 'i') // Constructing a regex pattern
            },
            role: 'author'
        }).then(authors => authors.map(author => author._id));

        let existingBook = await Book.findOne({ bookId });

        if (existingBook) {
            return errorHandler(res, HttpStatus.BAD_REQUEST, 'Book already exists', null);
        }
        console.log('allAuthors:', allAuthors);
        const slugifiedTitle = slugify(title, { lower: true });
        let existingSlug = await Book.findOne({ slug: slugifiedTitle });
        if (existingSlug) {
            const randomString = Math.random().toString(36).substring(2, 8);
            const uniqueSlug = `${slugifiedTitle}-${randomString}`;
            const newBook = new Book({
                bookId,
                authors: allAuthors,
                title,
                slug: uniqueSlug,
                description,
                price
            });

            await newBook.save();
        } else {
            const newBook = new Book({
                bookId,
                authors: allAuthors,
                title,
                slug: slugifiedTitle,
                description,
                price
            });

            await newBook.save();
        }
        sendSuccessResponse(res, null, 'Book added successfully');
    } catch (error) {
        if (error.name === 'ValidationError') {
            return errorHandler(res, HttpStatus.BAD_REQUEST, 'Validation error', error.message);
        }
        let errorMsg = 'Error adding book: ' + error;
        return errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg, error);
    }
};

const updateBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const { title, description, price } = req.body;

        // Check if the book exists
        const existingBook = await Book.findOne({ bookId });
        if (!existingBook) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Generate slug from the updated title
        const updatedSlug = slugify(title, { lower: true });

        // Check if the updated slug is already in use
        const existingSlug = await Book.findOne({ slug: updatedSlug });
        if (existingSlug && existingSlug._id.toString() !== existingBook._id.toString()) {
            // If the updated slug is already in use by another book, append a random string to make it unique
            const randomString = Math.random().toString(36).substring(2, 8);
            updatedSlug = `${updatedSlug}-${randomString}`;
        }

        // Update book information in the database
        await Book.findOneAndUpdate({ bookId }, { title, slug: updatedSlug, description, price });

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        // Delete book from the database
        await Book.findOneAndDelete({ bookId });

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getBookById = async (req, res) => {
    try {
        const bookId = req.params.id

        console.log('bookId:', bookId);

        // Fetch book information from the database
        const book = await Book.findOne({ bookId });

        if (!book) {
            errorHandler(res, HttpStatus.NOT_FOUND, 'Book not found', null);
        }

        sendSuccessResponse(res, book, 'Book retrieved successfully');
    } catch (error) {
        let errorMsg = 'Error getting book by ID: ' + error;
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
};

const submitBookReview = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { userId, rating, comment } = req.body;

        // Find the book by ID
        const book = await Book.findById(bookId);

        // Add the review to the book's reviews array
        book.reviews.push({ user: userId, rating, comment });

        // Calculate the average rating for the book
        const totalRatings = book.reviews.reduce((sum, review) => sum + review.rating, 0);
        book.averageRating = totalRatings / book.reviews.length;

        // Save the updated book with the new review
        await book.save();

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Error submitting book review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller function to search and filter books
const searchBooks = async (req, res) => {
    try {
        // Extract search criteria from query parameters
        const { title, author, minPrice, maxPrice } = req.query;

        // Construct Mongoose query based on provided criteria
        const query = {};

        if (title) {
            query.title = { $regex: title, $options: 'i' }; // Case-insensitive search
        }
        if (author) {
            query.authors = { $regex: author, $options: 'i' }; // Case-insensitive search for author
        }
        if (minPrice !== undefined && maxPrice !== undefined) {
            query.price = { $gte: minPrice, $lte: maxPrice }; // Price range query
        } else if (minPrice !== undefined) {
            query.price = { $gte: minPrice }; // Minimum price query
        } else if (maxPrice !== undefined) {
            query.price = { $lte: maxPrice }; // Maximum price query
        }

        // Find books matching the query criteria
        const books = await Book.find(query);

        // Return the filtered books as a response
        res.json({ success: true, data: books });
    } catch (error) {
        // Handle errors
        console.error('Error searching books:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    submitBookReview,
    searchBooks
};
