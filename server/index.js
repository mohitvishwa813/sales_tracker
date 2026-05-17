const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Razorpay webhook needs the raw request body to verify the HMAC signature.
// Must be registered BEFORE express.json() — otherwise the body is parsed and
// the original bytes are lost, making signature verification impossible.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/sales', require('./routes/sale'));
app.use('/api/customers', require('./routes/customer'));
app.use('/api/payments', require('./routes/payment'));

app.get('/', (req, res) => {
    res.send('ShopTracker API - Online');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});
