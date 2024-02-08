const Purchase = require('../models/Purchase.models.js');
const ObjectId = require('mongoose').Types.ObjectId;
const Book = require('../models/Book.models.js');

const { generatePurchaseId } = require('../services/purchase.services');
const { StatusCodes } = require('http-status-codes');
const { errorHandler, sendSuccessResponse } = require('../helpers/response.helpers.js');

require('dotenv').config();
const { STRIPE_TEST_SECRET_KEY } = process.env;

const stripe = require('stripe')(STRIPE_TEST_SECRET_KEY);

// const addPurchaseWithPayment = async (req, res) => {
//     try {
//         console.log('STRIPE_TEST_SECRET_KEY', STRIPE_TEST_SECRET_KEY)
//         const userId = req.userId;
//         const { bookId, quantity, paymentMethodId } = req.body;

//         const book = await Book.findByBookId(bookId);

//         if (!book) {
//             return errorHandler(res, StatusCodes.BAD_REQUEST, 'Book not found', null);
//         }

//         // Create a new purchase
//         const newPurchase = new Purchase({
//             purchaseId: await generatePurchaseId(),
//             bookId: book._id,
//             userId,
//             quantity,
//             price: book.price * quantity,
//             currentPrice: book.price
//         });

//         // Save the purchase to the database
//         await newPurchase.save();

//         // Increment the sellCount of the purchased book
//         book.sellCount += quantity;
//         await book.save();

//         // Process the payment
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: book.price * quantity * 100,
//             currency: 'usd',
//             payment_method: paymentMethodId,
//             confirm: true
//         });

//         // Generate payment link
//         const paymentLink = paymentIntent.charges.data[0].receipt_url;

//         sendSuccessResponse(res, { paymentLink }, 'Purchase recorded successfully');
//     } catch (error) {
//         let errorMsg = 'Error adding purchase: ' + error;
//         return errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg, error);
//     }
// };

const addPurchaseWithPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const { bookId, quantity, paymentMethodId } = req.body;

        const book = await Book.findByBookId(bookId);

        if (!book) {
            return errorHandler(res, StatusCodes.BAD_REQUEST, 'Book not found', null);
        }

        if (stripe === null) {
            return errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Stripe not initialized', null);
        }

        // // Create a Card Element
        // const elements = stripe.elements();
        // const cardElement = elements.create('card');

        // console.log('cardElement', cardElement)

        // // Collect payment details using Stripe.js and create a payment method
        // stripe.createPaymentMethod({
        //     type: 'card',
        //     card: cardElement, // cardElement represents the Stripe Card Element
        // }).then(function (result) {
        //     // Handle result containing paymentMethodId
        //     const paymentMethodId = result.paymentMethod.id;
        //     console.log('paymentMethodId', paymentMethodId)
        //     // Send paymentMethodId to your server to create a PaymentIntent
        // }).catch(function (error) {
        //     // Handle errors
        // });



        // Create a new purchase
        // const newPurchase = new Purchase({
        //     purchaseId: await generatePurchaseId(),
        //     bookId: book._id,
        //     userId,
        //     quantity,
        //     price: book.price * quantity,
        //     currentPrice: book.price
        // });

        // // Save the purchase to the database
        // await newPurchase.save();

        // // Increment the sellCount of the purchased book
        // book.sellCount += quantity;
        // await book.save();
        let a = 'pm_1J3Z3vKb8aZ3e3vKb8aZ3e3vKb8a'
        // Process the payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: book.price * quantity * 100,
            currency: 'usd',
            payment_method: ['card'],
            // payment_method_types: ['card'],
            confirm: true,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        if (paymentIntent.status !== 'succeeded') {
            return errorHandler(res, StatusCodes.BAD_REQUEST, 'Payment failed', null);
        }

        // Generate payment link
        const paymentLink = paymentIntent.charges.data[0].receipt_url;

        sendSuccessResponse(res, { paymentLink }, 'Purchase recorded successfully');
    } catch (error) {
        let errorMsg = 'Error adding purchase: ' + error;
        return errorHandler(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error', errorMsg, error);
    }
};

// add webhook handler
const stripeWebhook = async (req, res) => {
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            req.headers['stripe-signature'],
            STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Error verifying stripe webhook:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent);
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!', paymentMethod);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

module.exports = {
    addPurchaseWithPayment,
    stripeWebhook
};
