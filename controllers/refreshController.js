const asyncHandler=require("express-async-handler")
const express = require('express');
const jwt = require('jsonwebtoken');


const refrestoken=asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  const ACCESS_TOKEN_SECRET = 'venky123';
  const REFRESH_TOKEN_SECRET = 'medscore24';
  const refreshToken = cookies.refreshToken;

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    // console.log("refreshToken",refreshToken)
    const newAccessToken = jwt.sign(
      { user: decoded.user },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  });
});

module.exports = {refrestoken};
