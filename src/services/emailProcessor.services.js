// services/emailProcessor.js

const nodemailer = require('nodemailer');


// create an smtp transporter service for sending emails
// https://ethereal.email/
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'velda.dibbert33@ethereal.email',
        pass: '7VStwRAPwaHZkcg8dM'
    }
});

const sendEmail = async (emailContent) => {
    try {
        await transporter.sendMail(emailContent);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = { sendEmail, transporter };
