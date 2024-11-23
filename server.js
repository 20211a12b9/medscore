const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandlor");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");

connectDb();
const app = express();
// app.use(express.json());
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ 
                error: 'Invalid JSON',
                details: e.message 
            });
            throw new Error('Invalid JSON');
        }
    }
}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

const port = process.env.PORT || 5001;

// CORS options
const corsOptions = {
    origin: ['http://localhost:3000', 'https://medscore-api.onrender.com', 'https://medscore.in','https://www.medscore.in','https://medscore-api.azurewebsites.net'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "build")));

// Routes
app.use("/api/user", require("./Router/registerRoutes"));

// Error handling middleware
app.use(errorHandler);

// Serve React app for any other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});