const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    console.log('Registering user:', req.body.email);
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ msg: 'Missing email or password' });
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ email, password });
        console.log('Attempting to save user with bcrypt hashing...');
        await user.save();
        console.log('User saved successfully');

        const payload = { user: { id: user.id } };
        console.log('Generating JWT token...');
        
        if (!process.env.JWT_SECRET) {
            console.error('FATAL: JWT_SECRET is not defined in .env');
            return res.status(500).json({ msg: 'Server misconfiguration: Secret missing' });
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err.message);
                return res.status(500).json({ msg: 'Error signing token', error: err.message });
            }
            console.log('Token generated');
            res.json({ token });
        });
    } catch (err) {
        console.error('Register Route Error:', err.message);
        res.status(500).json({ msg: 'Internal server error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) return res.status(500).json({ msg: 'Token error' });
            res.json({ token });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
