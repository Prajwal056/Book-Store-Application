const nodemailer = require('nodemailer');
const Purchase = require('../models/Purchase.models');
const User = require('../models/User.models');
const dotenv = require('dotenv');
const HttpStatus = require('http-status-codes').StatusCodes;
const Queue = require('bull');

dotenv.config();
const { EMAIL_FROM, REDIS_URL } = process.env;

const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');

// Import email services
const emailService = require('../services/email.services');

// Define Bull queue for email notifications
const emailQueue = new Queue('emailNotifications', REDIS_URL);

// Function to calculate revenue for each author
const calculateAuthorRevenue = async (req, res) => {
    try {
        const authors = await User.find({ role: 'author' });

        const UserPurchase = await Purchase.find().populate('bookId').exec();

        const authorRevenueMap = authors.map(author => {
            const authorPurchases = UserPurchase.filter(purchase => purchase.bookId.authors.includes(author._id));
            const revenue = authorPurchases.reduce((totalRevenue, purchase) => totalRevenue + purchase.price * purchase.quantity, 0);
            return { email: author.email, revenue };
        });
        return authorRevenueMap;
    } catch (error) {
        // throw new Error('Error calculating author revenue: ' + error);
        let errorMessage = 'Error calculating author revenue';
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, errorMessage, errorMessage, error);
    }
};

// Function to send email notifications to authors with revenue details
const sendRevenueNotificationsToAuthors = async (req, res) => {
    try {
        // Calculate revenue for each author
        const authorRevenueMap = await calculateAuthorRevenue();

        // Get current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();

        // Compose and send email notifications
        await Promise.all(authorRevenueMap.map(async (author) => {
            const mailOptions = {
                from: EMAIL_FROM,
                to: author.email,
                subject: `Revenue Report - ${currentMonth} ${currentYear}`,
                html: `
                    <p>Dear Author,</p>
                    <p>Here is your revenue report for ${currentMonth} ${currentYear}:</p>
                    <p>Current Month Revenue: $${author.revenue}</p>
                    <p>Total Revenue: $${author.revenue}</p>
                    <p>Thank you for your contributions!</p>
                `
            };
            await emailQueue.add('sendEmail', { mailOptions });
        }));

        // Send success response
        sendSuccessResponse(res, 'Revenue notifications added to the queue', HttpStatus.OK);
        console.log('Revenue notifications added to the queue');
    } catch (error) {
        // Handle errors
        let errorMessage = 'Error sending revenue notifications';
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, errorMessage, errorMessage, error);
    }
};


// Worker function to send emails
emailQueue.process('sendEmail', async (job) => {
    const { mailOptions } = job.data;
    console.log('Sending email:', mailOptions)
    try {
        await emailService.sendEmail(mailOptions);
    } catch (error) {
        let errorMessage = 'Error sending email';
        errorHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, errorMessage, errorMessage, error);
    }
});


// Listen for failed jobs
emailQueue.on('failed', (job, err) => {
    console.error('Job failed:', job.id, err);
});

// Function to include relevant purchase information in the email content
const generatePurchaseInfoEmailContent = (purchaseInfo) => {
    // Generate email content with purchase information
    // Example: "Hello, You have purchased a book titled 'Book Title' on 'Purchase Date' for 'Price'."
    return `Hello,\n\nYou have purchased a book titled '${purchaseInfo.bookTitle}' on '${purchaseInfo.purchaseDate}' for '${purchaseInfo.price}'.\n\nThank you for your purchase!\n`;
};


// Function to send bulk email notifications to retail users about new book releases
const sendBulkEmailNotificationsToRetailUsers = async () => {
    try {
        // Logic to fetch new book releases and retail user email addresses
        const newBookReleases = await fetchNewBookReleases();
        const retailUsers = await RetailUser.find({}, 'email');

        // Compose email content with new book release information
        const mailOptionsList = retailUsers.map(user => {
            return {
                from: EMAIL_FROM,
                to: user.email,
                subject: 'New Book Releases Notification',
                html: `
                    <p>Dear Reader,</p>
                    <p>Check out our latest book releases:</p>
                    <ul>
                        ${newBookReleases.map(book => `<li>${book.title} by ${book.authors.join(', ')}</li>`).join('')}
                    </ul>
                    <p>Happy reading!</p>
                `
            };
        });

        // Push email tasks to the queue
        await Promise.all(mailOptionsList.map(mailOptions => emailQueue.add('sendEmail', { mailOptions })));

        console.log('Bulk email notifications sent successfully');
    } catch (error) {
        console.error('Error sending bulk email notifications:', error);
    }
};


module.exports = {
    calculateAuthorRevenue,
    sendRevenueNotificationsToAuthors,
};
