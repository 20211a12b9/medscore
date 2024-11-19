const express = require("express");
const connectDb = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandlor");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");

connectDb();
const app = express();
app.use(express.json());

<<<<<<< HEAD
const port = process.env.PORT || 5001; // Dynamic port with default 8080
=======
const port = process.env.PORT || 5051; // Dynamic port with default 8080
>>>>>>> 275dd6ba66e74dc14cb99f20705ac6d1cbbc79fe

// CORS options
const corsOptions = {
    origin: ['http://localhost:3000', 'https://medscore-api.onrender.com', 'https://medscore.in','https://www.medscore.in'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If cookies or authentication are used
};

app.use(cors(corsOptions));


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