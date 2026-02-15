const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            const error = new Error('Not authorized, no token');
            error.statusCode = 401;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find user and attach to request (excluding password)
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            const error = new Error('User no longer exists');
            error.statusCode = 401;
            error.status = 'fail';
            error.isOperational = true;
            return next(error);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            const err = new Error('Not authorized, token failed');
            err.statusCode = 401;
            err.status = 'fail';
            err.isOperational = true;
            return next(err);
        }
        next(error);
    }
};

const optionalProtect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
            req.user = user;
        }
        next();
    } catch (error) {
        // If token is invalid or user not found, just proceed as guest
        next();
    }
};

module.exports = { protect, optionalProtect };