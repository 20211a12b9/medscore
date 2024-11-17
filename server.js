const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require('cors');
const path = require('path');

// Initialize express
const app = express();

// Correct port variable name (PORT instead of port)
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000', 
        'https://medscore-api.azurewebsites.net',
        'https://medscore-awbybyh8ckd8g0a7.centralindia-01.azurewebsites.net',
        'https://medscore-api.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint for Azure
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// API routes
app.use("/api/user", require("./Router/registerRoutes"));

// Error handling
app.use(errorHandler);

// MongoDB connection with retry logic
let server;
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDb();
        
        // Start server only after successful DB connection
        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        // Retry after 5 seconds
        setTimeout(startServer, 5000);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
startServer();

// For graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
