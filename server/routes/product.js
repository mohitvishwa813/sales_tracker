const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/Product');

// Get all products for user
router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find({ userId: req.id }).sort({ name: 1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add new product
router.post('/', auth, async (req, res) => {
    const { name, costPrice, defaultSellingPrice, minPrice, maxDiscount, stock } = req.body;
    try {
        const newProduct = new Product({
            userId: req.id,
            name,
            costPrice,
            defaultSellingPrice,
            minPrice,
            maxDiscount,
            stock
        });
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update product
router.put('/:id', auth, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (product.userId.toString() !== req.id) return res.status(401).json({ msg: 'Not authorized' });

        const { name, costPrice, defaultSellingPrice, minPrice, maxDiscount, stock } = req.body;
        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { name, costPrice, defaultSellingPrice, minPrice, maxDiscount, stock } },
            { new: true }
        );
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        if (product.userId.toString() !== req.id) return res.status(401).json({ msg: 'Not authorized' });

        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
