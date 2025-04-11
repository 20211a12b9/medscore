
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded.user; // or decoded, based on how you signed it
      next();
    } catch (err) {
      return res.status(403).json({ message: "Token invalid or expired" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" });
  }
});

module.exports = validateToken;
