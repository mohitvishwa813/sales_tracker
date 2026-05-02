const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');

// @route   GET api/customers
// @desc    Get all customers for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const customers = await Customer.find({ user: req.id }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/customers
// @desc    Create a new customer
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, number } = req.body;
        
        let customer = await Customer.findOne({ number, user: req.id });
        if (customer) {
            return res.status(400).json({ msg: 'Customer with this number already exists' });
        }

        customer = new Customer({
            name,
            number,
            user: req.id
        });

        await customer.save();
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/customers/:id/debts
// @desc    Add a debt to customer
// @access  Private
router.post('/:id/debts', auth, async (req, res) => {
    try {
        const { productName, amount } = req.body;
        
        const customer = await Customer.findOne({ _id: req.params.id, user: req.id });
        if (!customer) {
            return res.status(404).json({ msg: 'Customer not found' });
        }

        customer.debts.push({
            productName,
            amount: Number(amount)
        });

        await customer.save();
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.id });
        
        if (!customer) {
            return res.status(404).json({ msg: 'Customer not found' });
        }

        res.json({ msg: 'Customer removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/customers/:id/debts/:debtId
// @desc    Remove a specific debt record
// @access  Private
router.delete('/:id/debts/:debtId', auth, async (req, res) => {
    try {
        const customer = await Customer.findOne({ _id: req.params.id, user: req.id });
        
        if (!customer) {
            return res.status(404).json({ msg: 'Customer not found' });
        }

        const initialLength = customer.debts.length;
        customer.debts = customer.debts.filter(debt => debt._id.toString() !== req.params.debtId);

        if (customer.debts.length === initialLength) {
            return res.status(404).json({ msg: 'Debt record not found' });
        }

        await customer.save();
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
