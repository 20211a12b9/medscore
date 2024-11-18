const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandlor");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");

connectDb();
const app = express();
app.use(express.json());

const port = process.env.PORT || 8080; // Dynamic port with default 8080

// CORS options
const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://medscore-api.onrender.com",
        "https://medscore-awbybyh8ckd8g0a7.centralindia-01.azurewebsites.net",
        "https://medscore-api-f8g2gef3cghvdxgm.canadacentral-01.azurewebsites.net"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // For cookies or authentication
    maxAge: 86400 // Preflight cache duration in seconds
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
