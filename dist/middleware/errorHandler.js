"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    const isOperational = error.isOperational || false;
    // Log error details
    console.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        statusCode,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        isOperational
    });
    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production' && !isOperational) {
        res.status(statusCode).json({
            error: 'Internal Server Error',
            message: 'Something went wrong. Please try again later.',
            timestamp: new Date().toISOString()
        });
    }
    else {
        // Development environment - include full error details
        res.status(statusCode).json({
            error: message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
        });
    }
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500, isOperational = true) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map