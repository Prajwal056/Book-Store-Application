const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long'
    }),
    role: Joi.string().required().valid('author', 'admin', 'retailUser').default('retailUser')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
    })
});

const putProfileSchema = Joi.object({
    username: Joi.string(),
    email: Joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address'
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    putProfileSchema
};