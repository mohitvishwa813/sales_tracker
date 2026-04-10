const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Add sale
router.post('/', auth, async (req, res) => {
    const { productId, sellingPrice, quantity, date } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const profit = (sellingPrice - product.costPrice) * quantity;

        const newSale = new Sale({
            userId: req.id,
            productId,
            sellingPrice,
            quantity,
            profit,
            date: date ? new Date(date) : undefined
        });

        // Update stock
        product.stock -= quantity;
        await product.save();

        const sale = await newSale.save();
        res.json(sale);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get sales (with optional date filtering)
router.get('/', auth, async (req, res) => {
    const { start, end } = req.query;
    let query = { userId: req.id };

    if (start && end) {
        query.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    try {
        const sales = await Sale.find(query).populate('productId', 'name costPrice minPrice').sort({ date: -1 });
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get daily summary
router.get('/summary/daily', auth, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const sales = await Sale.find({
            userId: req.id,
            date: { $gte: today }
        });

        const summary = sales.reduce((acc, sale) => {
            acc.totalSales += (sale.sellingPrice * sale.quantity);
            acc.totalProfit += sale.profit;
            acc.itemCount += sale.quantity;
            return acc;
        }, { totalSales: 0, totalProfit: 0, itemCount: 0 });

        res.json(summary);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
