const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    console.log("Auth Header:", authHeader); // Debugging log

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];

        console.log("Extracted Token:", token); // Debugging log

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Decoded Token:", decoded); 

            req.user = decoded; // ✅ Assign full decoded payload, not just `decoded.user`
           
            return next();
        } catch (err) {
            console.error("JWT Verification Error:", err.message); // Debugging log
            return res.status(403).json({ message: "User is not authorized to access this website" });
        }
    }

    console.error("Token Missing or Invalid Format"); // Debugging log
    return res.status(403).json({ message: "User is not authorized or token missing" });
});

module.exports = validateToken;
