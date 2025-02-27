const asyncHandler = require("express-async-handler");
const Outstanding = require("../models/outstanding");

const outstandingReport = asyncHandler(async (req, res) => {
    const { licenseNo } = req.query;

    if (!licenseNo) {
        return res.status(400).json({ message: "License number is required" });
    }

    const result = await Outstanding.aggregate([
        { $match: { "uploadData.DLNo1": licenseNo } },
        { $project: { _id: 0, data: "$uploadData" } }
    ]);

    if (!result || result.length === 0) {
        return res.status(404).json({ message: "No data found" });
    }
    
    // Make sure we're sending the response in the expected format
    res.json({ data: result[0].data });
});

module.exports = { outstandingReport };