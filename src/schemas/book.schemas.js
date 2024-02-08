const Joi = require('joi');

const bookSchema = Joi.object({
    bookId: Joi.string().pattern(/^book-\d+$/).required().messages({
        'string.pattern.base': 'Invalid bookId format',
        'string.empty': 'bookId is required',
        'any.required': 'bookId is required'
    }),
    title: Joi.string().required().messages({
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
        'string.base': 'Title must be a string'
    }),
    authors: Joi.array().required().items(Joi.string()).required().messages({
        'array.base': 'Authors must be an array',
        'array.empty': 'Authors is required',
        'any.required': 'Authors is required',
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
        'string.base': 'Description must be a string'
    }),
    price: Joi.number().required().min(100).max(1000).messages({
        'number.base': 'Price must be a number',
        'number.empty': 'Price is required',
        'any.required': 'Price is required',
        'number.min': 'Price must be at least 100',
        'number.max': 'Price must be at most 1000'
    })
});

const bookUpdateSchema = Joi.object({
    title: Joi.string().optional().messages({
        'string.base': 'Title must be a string',
    }),
    description: Joi.string().optional().messages({
        'string.base': 'Description must be a string',
    }),
    price: Joi.number().optional().min(100).max(1000)
});

module.exports = { bookSchema, bookUpdateSchema };