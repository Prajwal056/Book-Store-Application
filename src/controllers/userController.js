const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.models.js');
const logger = require('../helpers/logger.js');
const HttpStatus = require('http-status-codes').StatusCodes;
const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');
require('dotenv').config();
let { JWT_SECRET_TOKEN } = process.env;

const registerUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        logger.info('Registering user:', username, email, role);

        // Check if the user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorHandler(res, HttpStatus.BAD_REQUEST, 'User already exists', null);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        // Save the user to the database
        await newUser.save();

        sendSuccessResponse(res, null, 'User registered successfully');

    } catch (error) {
        let errorMsg = 'Error registering user: ' + error;
        return errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET_TOKEN, { expiresIn: '1d' });

        res.status(200).json({ token });
    } catch (error) {
        let errorMsg = 'Error logging in user: ' + error;
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) {
            return errorHandler(res, HttpStatus.NOT_FOUND, 'User not found', null);
        }

        return sendSuccessResponse(res, user, 'User profile retrieved successfully');
    } catch (error) {
        let errorMsg = 'Getting user profile: ' + error;
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // Assume userId is extracted from the JWT token
        const { username, email } = req.body;

        // Update user profile information in the database
        await User.findByIdAndUpdate(userId, { username, email });

        res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
        let errorMsg = 'Error updating user profile: ' + error;
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};
