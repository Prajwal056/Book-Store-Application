// worker.js
const emailProcessor = require('./services/emailProcessor.services');
const emailQueue = require('./services/emailQueue.services');

emailQueue.process('sendEmail', async (job) => {
    await emailProcessor.sendEmail(job.data.emailContent);
});
