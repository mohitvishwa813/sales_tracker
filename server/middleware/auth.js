const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let userId;
        if (decoded.user && decoded.user.id) {
            userId = decoded.user.id;
        } else if (decoded.id) {
            userId = decoded.id;
        } else {
            console.error('Invalid JWT Payload Structure:', decoded);
            return res.status(401).json({ msg: 'Token payload invalid' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ msg: 'User not found' });
        }

        // Lazy expiry — if their period has ended and they're still flagged
        // TRIALING / ACTIVE, flip to INACTIVE before downstream routes see them.
        // The daily cron is a backstop; this catches the user the moment they hit the API.
        const periodExpired = user.currentPeriodEnd && user.currentPeriodEnd < new Date();
        const stillFlaggedActive = ['TRIALING', 'ACTIVE'].includes(user.subscriptionState);
        if (periodExpired && stillFlaggedActive) {
            user.subscriptionState = 'INACTIVE';
            await user.save();
        }

        req.id = user.id;
        req.user = user;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
