const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error
    logger.error(err.message, { stack: err.stack });

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: don't leak stack traces
        let error = { ...err };
        error.message = err.message;

        // Mongoose bad ObjectId
        if (err.name === 'CastError') {
            const message = `Resource not found. Invalid: ${err.path}: ${err.value}`;
            error = new Error(message);
            error.statusCode = 400;
            error.status = 'fail';
            error.isOperational = true;
        }

        // Mongoose duplicate key
        if (err.code === 11000) {
            const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
            const message = `Duplicate field value: ${value}. Please use another value!`;
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

        if (error.isOperational) {
            res.status(error.statusCode).json({
                status: error.status,
                message: error.message
            });
        } else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    }
};

module.exports = errorHandler;
