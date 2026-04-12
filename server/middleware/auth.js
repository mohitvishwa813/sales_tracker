const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Handle different payload structures gracefully
        if (decoded.user && decoded.user.id) {
            req.id = decoded.user.id;
        } else if (decoded.id) {
            req.id = decoded.id;
        } else {
            console.error('Invalid JWT Payload Structure:', decoded);
            return res.status(401).json({ msg: 'Token payload invalid' });
        }
        
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
