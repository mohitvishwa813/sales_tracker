const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

app.get('/', (req, res) => {
    res.send('Shop Tracking API - Online');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});
