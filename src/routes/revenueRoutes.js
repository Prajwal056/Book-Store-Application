// routes/revenueRoutes.js

const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// Route for computing and updating revenue for authors


router.post('/compute', revenueController.calculateAuthorRevenue);
router.post('/notify', revenueController.sendRevenueNotificationsToAuthors);
// router.post('/compute', async (req, res) => {
//     try {
//         return "dd"
//         return await computeAuthorRevenue();
//         res.status(200).json({ message: 'Author revenue computed successfully' });
//     } catch (error) {
//         console.error('Error computing author revenue:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Route for sending revenue notifications to authors
router.post('/notify', async (req, res) => {
    try {
        await sendRevenueNotificationsToAuthors();
        res.status(200).json({ message: 'Revenue notifications sent successfully' });
    } catch (error) {
        console.error('Error sending revenue notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
