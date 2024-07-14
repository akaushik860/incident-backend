const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secretKey = 'your_secret_key';  // Replace with a secure key

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({status: 401, message: 'Token is not valid' });
    }
};

module.exports = { authMiddleware };
