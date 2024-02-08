const logger = require('./logger');
const { StatusCodes } = require('http-status-codes');

const sendSuccessResponse = (res, data = null, message = 'Success') => {
    logger.info(message);
    return res.status(StatusCodes.OK).json({
        success: true,
        message,
        data
    });
};

let errorHandler = (res, statusMessage, message, errorMessage, error) => {
    return new Promise((resolve, reject) => {
        let errorMsg = errorMessage !== null ? errorMessage : message;

        if (error && error.code === 11000) {
            // MongoDB duplicate key error occurred
            logger.error(errorMsg);
            console.error("ERROR:", errorMsg);

            res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Duplicate key error'
            });
        } else if (error && error.name === 'ValidationError') {
            // MongoDB validation error occurred
            logger.error(errorMsg);
            console.error("ERROR:", errorMsg);

            res.status(StatusCodes.BAD_REQUEST).json({
                message: 'Validation error'
            });
        } else {
            // Other types of errors
            logger.error(errorMsg);
            console.error("ERROR:", errorMsg);

            res.status(statusMessage).json({
                message
            });
        }
        resolve();
    });
};




module.exports = {
    sendSuccessResponse,
    errorHandler
};
