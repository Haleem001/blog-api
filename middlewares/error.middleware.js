const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // ALWAYS log the error with full details in development
    if (process.env.NODE_ENV === 'development') {
        logger.error(err.message, err.stack);
    }

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: don't leak stack traces but log everything
        logger.error(`[${err.statusCode}] ${err.message}`, {
            code: err.code,
            name: err.name,
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });

        let error = { ...err };
        error.message = err.message;

        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}: ${err.value}`;
            error = {
                statusCode: 400,
                status: 'fail',
                message: message,
                isOperational: true
            };
        }

        // Mongoose duplicate key - improved parsing
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            const value = err.keyValue[field];
            const message = `Duplicate field value: "${value}". Please use another value!`;
            error = {
                statusCode: 400,
                status: 'fail',
                message: message,
                isOperational: true
            };
        }

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            const message = `Invalid input data. ${errors.join('. ')}`;
            error = {
                statusCode: 400,
                status: 'fail',
                message: message,
                isOperational: true
            };
        }

        // JWT errors
        if (err.name === 'JsonWebTokenError') {
            error = {
                statusCode: 401,
                status: 'fail',
                message: 'Invalid token. Please login again!',
                isOperational: true
            };
        }

        if (err.name === 'TokenExpiredError') {
            error = {
                statusCode: 401,
                status: 'fail',
                message: 'Your token has expired! Please login again.',
                isOperational: true
            };
        }

        if (error.isOperational) {
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong! Please try again later.'
            });
        }
    }
};

module.exports = errorHandler;
