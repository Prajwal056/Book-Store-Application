// services/emailQueue.js

const Queue = require('bull');

const emailQueue = new Queue('emailQueue', {
    redis: {
        port: 6379,
        host: '127.0.0.1',
    },
});

module.exports = emailQueue;
