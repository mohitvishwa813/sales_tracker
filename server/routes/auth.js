const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    console.log('Registering user:', req.body.email);
    const { email, password, shopName, ownerName, phone } = req.body;
    try {
        if (!email || !password || !shopName || !ownerName || !phone) {
            return res.status(400).json({ msg: 'Missing required fields: email, password, shopName, ownerName, phone' });
        }

        const phoneDigits = String(phone).replace(/\D/g, '').slice(-10);
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
            return res.status(400).json({ msg: 'Phone must be a 10-digit Indian mobile number' });
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            email,
            password,
            shopName: shopName.trim(),
            ownerName: ownerName.trim(),
            phone: phoneDigits
        });
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
            res.json({ token, subscription: user.toSubscriptionInfo(), profile: user.toProfile() });
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
            res.json({ token, subscription: user.toSubscriptionInfo(), profile: user.toProfile() });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Fetch current user's profile + subscription state
// @access  Private
router.get('/me', auth, async (req, res) => {
    res.json({
        profile: req.user.toProfile(),
        subscription: req.user.toSubscriptionInfo()
    });
});

// @route   PATCH /api/auth/me
// @desc    Update editable profile fields (shopName, ownerName)
// @access  Private
router.patch('/me', auth, async (req, res) => {
    const { shopName, ownerName, phone } = req.body;
    try {
        if (typeof shopName === 'string') {
            const trimmed = shopName.trim();
            if (!trimmed) return res.status(400).json({ msg: 'shopName cannot be empty' });
            req.user.shopName = trimmed;
        }
        if (typeof ownerName === 'string') {
            const trimmed = ownerName.trim();
            if (!trimmed) return res.status(400).json({ msg: 'ownerName cannot be empty' });
            req.user.ownerName = trimmed;
        }
        if (typeof phone === 'string') {
            const phoneDigits = phone.replace(/\D/g, '').slice(-10);
            if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
                return res.status(400).json({ msg: 'Phone must be a 10-digit Indian mobile number' });
            }
            req.user.phone = phoneDigits;
        }
        await req.user.save();
        res.json({ profile: req.user.toProfile() });
    } catch (err) {
        console.error('Profile update error:', err.message);
        res.status(500).json({ msg: 'Failed to update profile' });
    }
});

module.exports = router;
