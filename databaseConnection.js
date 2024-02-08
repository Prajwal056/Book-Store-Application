const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Add import statement for 'dotenv'
dotenv.config(); // Load environment variables from .env file
const { MONGODB_URI } = process.env;

/**
 * Establishes a connection to the database.
 * @async
 * @function databaseConnection
 * @throws {Error} If there is an error connecting to the database.
 */

const databaseConnection = async () => {
    try {
        mongoose.connect(MONGODB_URI);
        mongoose.connection.on('connected', () => {
            console.log('Database connected');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('Database disconnected');
        });
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

module.exports = databaseConnection;
