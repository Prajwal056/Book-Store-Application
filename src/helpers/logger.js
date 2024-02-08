const winston = require('winston');
const { format } = winston;
const fs = require('fs');
const path = require('path');

// Create a logs directory if it doesn't exist
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Define log format
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
);

// Create separate transports for info and error logs
const infoTransport = new winston.transports.File({ filename: path.join(logsDir, 'info.log'), level: 'info' });
const errorTransport = new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' });

// Create a logger instance
const logger = winston.createLogger({
    level: 'info', // Set the minimum log level
    format: logFormat,
    transports: [
        infoTransport, // Log info level logs to info.log file
        errorTransport // Log error level logs to error.log file
    ]
});

module.exports = logger;
