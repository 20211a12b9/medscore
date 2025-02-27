const asyncHandler = require("express-async-handler");
const Outstanding = require("../models/outstanding");

const outstandingReport = asyncHandler(async (req, res) => {
    const { licenseNo } = req.query;  // Extract the license number from query params

    if (!licenseNo) {
        return res.status(400).json({ message: "License number is required" });
    }

    const result = await Outstanding.aggregate([
        { $match: { "uploadData.DLNo1": licenseNo } },
        // { $unwind: "$uploadData" },
        // { $match: { "uploadData.DLNo1": licenseNo } },
        { $project: { _id: 0, data: "$uploadData" } }
    ]);

    if (!result || result.length === 0) {
        return res.status(404).json({ message: "No data found" });
    }

    
    
    res.json(result[0]);
});

module.exports = { outstandingReport };