const express = require("express");
const connectDb = require("./config/dbConnection");
const Register = require("./models/registerModel");
const errorHandler = require("./middleware/errorHandlor");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
require("dotenv").config();
const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const session = require("express-session");
// const { logger, securityMonitoring } = require('./middleware/logger');

connectDb();

const app = express();


app.use(cookieParser());
// Rate limiting configuration
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per window
    message: 'Too many login attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'https://medscore-api.onrender.com', 'https://medscore.in','https://www.medscore.in','https://medscore-api.azurewebsites.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
};
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", ...corsOptions.origin]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Apply CORS before other middlewares
app.use(cors(corsOptions));

// Apply general rate limiting to all routes
app.use(apiLimiter);

app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON', details: e.message });
            throw new Error('Invalid JSON');
        }
    }
}));
// Protect against NoSQL injection
app.use(mongoSanitize());

// Protect against XSS (Cross-Site Scripting) attacks
// app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Enable Secure Sessions (Modify as per your needs)
app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key", // Use environment variable for security
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const PORT = process.env.PORT || 5001;

app.use(express.static(path.join(__dirname, "build")));

// Apply stricter rate limiting to authentication routes
app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

// Routes
app.use("/api/user", require("./Router/registerRoutes"));

// Error handling middleware
app.use(errorHandler);

// Serve React app for any other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});
// app.use(securityMonitoring);
const startServer = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            await migratePhonenumbers();
        } else {
            mongoose.connection.once('connected', async () => {
                console.log('MongoDB connected');
                await migratePhonenumbers();
            });
        }

        // app.listen(PORT, () => {
        //     logger.info(`Server running on port ${PORT}`);
        //     logger.info({
        //         type: 'SERVER_START',
        //         port: PORT,
        //         environment: process.env.NODE_ENV,
        //         security: {
        //             helmet: true,
        //             cors: true,
        //             rateLimit: true,
        //             mongoSanitize: true,
        //             xss: true,
        //             hpp: true
        //         }
        //     });
        // });
    } catch (error) {
        // logger.error({
        //     type: 'SERVER_ERROR',
        //     error: error.message,
        //     stack: error.stack
        // });
        console.error('Server startup error:', error);
    }
};

const migratePhonenumbers = async () => {
    try {
        const result = await Register.updateMany(
            { phone_number: { $type: "string" } },
            [{ $set: { phone_number: ["$phone_number"] } }]
        );
        console.log("Migration completed. Updated documents:", result.modifiedCount);
    } catch (error) {
        console.error("Migration error:", error);
    }
};

startServer();