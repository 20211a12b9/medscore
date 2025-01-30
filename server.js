const express = require("express");
const connectDb = require("./config/dbConnection");
const Register=require("./models/registerModel")
const errorHandler = require("./middleware/errorHandlor");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose=require("mongoose")
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
// In your server.js


app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

const PORT = process.env.PORT || 5001;

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
const startServer = async () => {
    try {
        // Check if MongoDB is already connected
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB already connected');
            await migratePhonenumbers();
        } else {
            // Wait for MongoDB connection event
            mongoose.connection.once('connected', async () => {
                console.log('MongoDB connected');
                await migratePhonenumbers();
            });
        }
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
};

// Update the migration function
const migratePhonenumbers = async () => {
    try {
        const result = await Register.updateMany(
            { phone_number: { $type: "string" } },
            [
                {
                    $set: {
                        phone_number: ["$phone_number"]
                    }
                }
            ]
        );
        console.log("Migration completed. Updated documents:", result.modifiedCount);
    } catch (error) {
        console.error("Migration error:", error);
    }
};

// Start the server
startServer();
