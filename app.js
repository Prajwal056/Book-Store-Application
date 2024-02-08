const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const purchaseRoutes = require('./src/routes/purchaseRoutes');
const revenueRoutes = require('./src/routes/revenueRoutes');
const paymentRoutes = require('./src/routes/payment.routes');
const databaseConnection = require('./databaseConnection');
const app = express();

// Middlewares
app.use(bodyParser.json()); // for parsing application/json


// Routes
app.use('/users', userRoutes);
app.use('/books', bookRoutes);
app.use('/purchases', purchaseRoutes);
app.use('/revenue', revenueRoutes);
app.use('/payment', paymentRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to the database
databaseConnection();
