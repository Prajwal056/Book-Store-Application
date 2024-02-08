// email.services.js
const { transporter } = require('./emailProcessor.services');

// Function to send email
const sendEmail = async (mailOptions) => {
    try {
        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email: ' + error.message);
    }
};

module.exports = {
    sendEmail
};
