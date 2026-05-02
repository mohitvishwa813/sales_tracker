const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');

// Add sale
router.post('/', auth, async (req, res) => {
    const { productId, sellingPrice, quantity, date } = req.body;
    try {
        const user = await User.findById(req.id);
        if (!user || user.status !== 'VIP') {
            return res.status(403).json({ msg: 'Upgrade to VIP to add sales' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const profit = (Number(sellingPrice) - product.buyPrice) * Number(quantity);

        const newSale = new Sale({
            userId: req.id,
            productId,
            sellingPrice: Number(sellingPrice),
            quantity: Number(quantity),
            profit,
            date: date ? new Date(date) : undefined
        });

        if (product.stockQuantity !== undefined) {
          product.stockQuantity -= Number(quantity);
          await product.save();
        }

        const sale = await newSale.save();
        res.json(sale);
    } catch (err) {
        console.error('Sale Record Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Get aggregated stats for Charts
router.get('/stats', auth, async (req, res) => {
    try {
        const sales = await Sale.find({ userId: req.id }).sort({ date: 1 });
        const customers = await Customer.find({ user: req.id });
        
        // Group by day for the chart
        const grouped = {};
        
        sales.forEach((sale) => {
            const day = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!grouped[day]) {
                grouped[day] = { name: day, sales: 0, profit: 0, debt: 0 };
            }
            grouped[day].sales += (sale.sellingPrice * sale.quantity);
            grouped[day].profit += sale.profit;
        });

        customers.forEach(customer => {
            customer.debts.forEach(debt => {
                const day = new Date(debt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (!grouped[day]) {
                    grouped[day] = { name: day, sales: 0, profit: 0, debt: 0 };
                }
                grouped[day].debt += debt.amount;
            });
        });

        // Ensure array is sorted by date properly (since object keys might not be ordered correctly)
        // A simple way is to recreate the dates or just return Object.values(grouped).slice(-7) assuming recent activity
        // Better: create last 7 days keys
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            result.push(grouped[dayStr] || { name: dayStr, sales: 0, profit: 0, debt: 0 });
        }

        res.json(result);
    } catch (err) {
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
        const sales = await Sale.find(query).populate('productId', 'name buyPrice mrp').sort({ date: -1 });
        res.json(sales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get summary
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
