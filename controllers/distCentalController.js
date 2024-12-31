const asyncHandler = require("express-async-handler")
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const DistCentaldata=require('../models/distCentralModel')
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        // Use an absolute path or path.join for cross-platform compatibility
        cb(null, path.join(__dirname, '../uploads'))
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept excel and csv files
        const allowedMimeTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
            "application/vnd.ms-excel", // .xls
            "text/csv", // .csv
            "application/csv", // another csv mime type
            "application/vnd.ms-excel.sheet.macroEnabled.12" // .xlsm
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only Excel or CSV files are allowed!'));
        }
    }
}).single('file'); 

const uploadcentalData = asyncHandler(async(req, res) => {
    upload(req, res, async function(err){
        if(err){
            return res.status(400).json({
                message: err.message
            });
        }
        
        if(!req.file){
            return res.status(400).json({
                message: 'Please upload an Excel or CSV file!'
            });
        }

        try {
            let data;
            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            const workbook = XLSX.readFile(req.file.path);
            const sheet_name_list = workbook.SheetNames;
            
            // Support both Excel and CSV
            if (fileExtension === '.csv' || workbook.SheetNames.length === 1) {
                data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            } else {
                // If multiple sheets, allow user to specify which sheet to use
                return res.status(400).json({
                    message: 'Please specify which sheet to use for multiple-sheet Excel files',
                    availableSheets: sheet_name_list
                });
            }

            const DistCemtalModel = require('../models/distCentralModel')

            // Optional: Add data validation before insertion
            const validatedData = data.map(item => ({
                FirmName: item.FirmName || '',
                Address: item.Address || '',
                FRMDate: item.FRMDate || '',
                ExpDate: item.ExpDate || '',
                LicenceNumber: item.LicenceNumber || ''
            }));

            // Insert data with error handling
            const insertResult = await DistCemtalModel.insertMany(validatedData)
                .catch(insertError => {
                    throw new Error(`Database insertion failed: ${insertError.message}`);
                });
            
            // Remove uploaded file
            fs.unlinkSync(req.file.path);

            res.status(200).json({
                message: 'File uploaded and data stored successfully!',
                recordsInserted: insertResult.length,
                data: validatedData
            });
        } catch(error) {
            // Remove the file if an error occurs during processing
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            console.error(error);
            res.status(500).json({
                message: 'Error processing the file',
                error: error.message
            });
        }
    })
})
//@desc get all central data
//@param /api/user/getCentaldata?page=<page>&limit=<limit>
//@access private
const getCentaldata = asyncHandler(async (req, res) => {
    
    const page = parseInt(req.query.page) || 1;  
    const limit = parseInt(req.query.limit) || 100;  
    const address=req.query.address||'';
    const licenseNo=req.query.licenseNo || ''
    const skip = (page - 1) * limit;

    const filters=[];
    if(licenseNo)
    {
        filters.push({LicenceNumber: { $regex: licenseNo, $options: "i" } })
        filters.push({ FirmName: { $regex: licenseNo, $options: "i" } })
    }
    if(address)
    {
        filters.push({Address: { $regex: address, $options: "i" } })
    }
    const query=filters.length>0 ? { $or: filters } : {};
    const dist = await DistCentaldata.find(query)
        .skip(skip) 
        .limit(limit);  


    const totalCount = await DistCentaldata.countDocuments(query);

  
    
    res.json({
        dist,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            perPage: limit
        }
    });
});

module.exports = { uploadcentalData,getCentaldata }