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

    console.log("Aggregation result:", result);

    // Ensure valid JSON response
    res.json({ data: result.length > 0 ? result[0].data : [] });
});

module.exports = { outstandingReport };
