// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Determine the status code
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Ensure status is set only if not already set
    if (!res.statusCode || res.statusCode === 200) {
        res.status(statusCode);
    }
    
    // Log the error for server-side tracking
    console.error('Unhandled Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Send error response
    res.json({
        title: getErrorTitle(statusCode),
        message: err.message || 'An unexpected error occurred',
        // Only send stack trace in development
        stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

// Helper function to get error titles based on status codes
const getErrorTitle = (statusCode) => {
    const errorTitles = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Server Error"
    };

    return errorTitles[statusCode] || "Error";
};

module.exports = errorHandler;