const { StatusCodes } = require('http-status-codes');
const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
let { JWT_SECRET_TOKEN } = process.env;

const validatePayload = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        let errorMsg = error.details[0].message;
        return errorHandler(res, StatusCodes.BAD_REQUEST, errorMsg, 'validating payload: ' + errorMsg);
    }
    next();
};

const verifyToken = async (req, res, next) => {
    try {

        let token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

        if (!token) {
            return errorHandler(res, StatusCodes.BAD_REQUEST, 'Token is required', null);
        }

        jwt.verify(token, JWT_SECRET_TOKEN, async (err, decoded) => {
            if (err) {
                if (err instanceof jwt.TokenExpiredError) {
                    return errorHandler(res, StatusCodes.UNAUTHORIZED, 'Token has expired', null);
                } else {
                    return errorHandler(res, StatusCodes.UNAUTHORIZED, 'Token is invalid', null);
                }
            }
            req.userId = decoded.userId; // Attach userId to the request object for later use
            next(); // Call next middleware
        });
    } catch (error) {
        let errorMsg = 'Verifying token: ' + error;
        errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
};

module.exports = { validatePayload, verifyToken };
