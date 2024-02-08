const Purchase = require('../models/Purchase.models.js');

// Function to generate unique purchaseId (as per the provided documentation)
const generatePurchaseId = async () => {
    // Get the current year and month
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');

    // Find the latest purchaseId in the current month
    const latestPurchase = await Purchase.findOne({ purchaseId: { $regex: `^${year}-${month}-` } })
        .sort({ purchaseId: -1 })
        .limit(1);

    let numericIncrementId = 1;
    if (latestPurchase) {
        // Extract the numeric part from the latest purchaseId and increment it
        const latestNumericPart = parseInt(latestPurchase.purchaseId.split('-')[2]);
        numericIncrementId = latestNumericPart + 1;
    }

    // Pad the numeric increment id with leading zeros if needed
    const paddedNumericIncrementId = String(numericIncrementId)

    // Construct the new purchaseId
    const newPurchaseId = `${year}-${month}-${paddedNumericIncrementId}`;

    return newPurchaseId;
};

module.exports = {
    generatePurchaseId
};