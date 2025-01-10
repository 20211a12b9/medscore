const asyncHandler=require("express-async-handler")
const Invoice=require("../models/invoiceModel");
const Link=require("../models/linkPharma")
const Register=require("../models/registerModel")
const InvoiceRD=require("../models/invoiceReportDefaultModel")
const ExcelJS = require('exceljs');
const { default: mongoose } = require("mongoose");
const nodeCron = require('node-cron'); 
const { assign } = require("nodemailer/lib/shared");
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const Outstanding=require("../models/outstanding");
const { ObjectId } = require('mongodb');

//@desc Invoce of customer
//@router /api/user/Invoice/:id 
//@access public

const InvoiceController =asyncHandler(async (req,res)=>{
    const customerId = req.params.id;
    const {invoice,invoiceAmount,invoiceDate,dueDate,delayDays,pharmadrugliseanceno}=req.body;
    if(!invoice || !invoiceAmount || !invoiceDate || !dueDate || !delayDays || !pharmadrugliseanceno)
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const invoice2=await Invoice.create({
        pharmadrugliseanceno,
        customerId,
        invoice,
        invoiceAmount,
        invoiceDate,
        dueDate,
        delayDays
    })
    console.log("invoice data",invoice2)
    if(invoice2)
    {
        res.status(201).json({invoice:invoice2.invoice,invoiceAmount:invoice2.invoiceAmount,invoiceDate:invoice2.invoiceDate,dueDate:invoice2.dueDate,delayDays:invoice2.delayDays,pharmadrugliseanceno:invoice2.pharmadrugliseanceno})
    }
    else{
        res.json({message:"failed"})
    }
    

})

//@desc get invoice data
//@router /api/user/getInvoice
//access public
const getInvoiceData=asyncHandler(async (req,res)=>{
    const  licenseNo  = req.query.licenseNo;
console.log("licenseNo",licenseNo)
    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    // Find all invoices matching the license number
    const invoiceData = await Invoice.find({ pharmadrugliseanceno: licenseNo})
    .select({
        pharmadrugliseanceno:1,
         invoice: 1,
         invoiceData:1,
         dueDate:1,
         delayDays:1,
         invoiceAmount:1,
         invoiceDate:1,
         reason:1,
         createdAt:1,
         seen:1
    }).lean()       

    if (!invoiceData || invoiceData.length === 0) {
        res.status(404);
        throw new Error('No invoices found for this license number');
    }
    const serializedData = invoiceData.map((invoice, index) => ({
        serialNo: index + 1, // Add serial number starting from 1
        ...invoice
    }));
    res.status(200).json({
        success: true,
        count: serializedData.length,
        data: serializedData
    });
})
//@desc get invoiceRD data
//@router /api/user/getInvoiceRD/
//access public
const getInvoiceRDData=asyncHandler(async (req,res)=>{
    const  licenseNo  = req.query.licenseNo;
console.log("licenseNo",licenseNo)
    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    // Find all invoices matching the license number
    const invoiceData = await InvoiceRD.find({ pharmadrugliseanceno: licenseNo,reportDefault:true, })
    .select({
        pharmadrugliseanceno:1,
         invoice: 1,
         invoiceData:1,
         dueDate:1,
         delayDays:1,
         invoiceAmount:1,
         invoiceDate:1,
         customerId:1,
         reason:1,
         dispute:1,
         updatebydist:1,
         reasonforDispute:1,
         updatebydistBoolean:1,
         createdAt:1,
         accept:1,
         reject:1

  
    }).lean()       

    if (!invoiceData || invoiceData.length === 0) {
        res.status(404);
        throw new Error('No invoices found for this license number');
    }

    const serialData=invoiceData.map((invoice,index)=>({
        serialNo:index+1,
        ...invoice
    }))
    res.status(200).json({
        success: true,
        count: serialData.length,
        data: serialData
    });
})
//@desc get invoiceRD data
//@router /api/user/getInvoiceRDforDistUpdate
//access public
const getInvoiceRDDataforDistUpdate = asyncHandler(async (req, res) => {
    const { licenseNo } = req.query;
    console.log("licenseNo", licenseNo);

    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    // Fetch matching dl_codes from Register collection
    const pharma = await Register.find({
        $or: [
            { pharmacy_name: { $regex: licenseNo, $options: "i" } },
            { dl_code: { $regex: licenseNo, $options: "i" } }
        ]
    }).select({
        dl_code: 1, // Select only the dl_code field
        _id: 0      // Exclude the _id field (optional)
    });

    let dlCodes = [];
    if (pharma.length > 0) {
        dlCodes = pharma.map(doc => doc.dl_code);
        // console.log("List of dl_codes:", dlCodes);
    } 

    // Fetch all invoices matching any of the dl_codes
    const invoiceData = await InvoiceRD.find({
        pharmadrugliseanceno: { $in: dlCodes },updatebydistBoolean:false // Match any dl_code
    })
    .select({
        pharmadrugliseanceno: 1,
        invoice: 1,
        invoiceData: 1,
        dueDate: 1,
        delayDays: 1,
        invoiceAmount: 1,
        invoiceDate: 1,
        customerId: 1,
        reason: 1,
        dispute: 1
    }).lean();

    if (!invoiceData || invoiceData.length === 0) {
        res.status(404);
        throw new Error('No invoices found for the provided license numbers');
    }

    // Add serial numbers to the invoice data
    const serialData = invoiceData.map((invoice, index) => ({
        serialNo: index + 1,
        ...invoice
    }));

    // Return the final response
    res.status(200).json({
        success: true,
        count: serialData.length,
        data: serialData
    });
});

//@desc get invoiceRD data
//@router /api/user/getInvoiceRDforDist/:distId
//access public
const getInvoiceRDDataforDist=asyncHandler(async (req,res)=>{
    const { distId } = req.params;
    const licenseNo = req.query.licenseNo;
console.log("licenseNo",licenseNo)
    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }
// const pharma=await Register.findOne({dl_code:licenseNo})
let pharma;
pharma=await Register.findOne({ pharmacy_name: { $regex: licenseNo, $options: "i" } })
if(!pharma)
{
    pharma=await Register.findOne({dl_code:licenseNo})
    if (!pharma) {
   
       
            res.status(400);
        throw new Error('This licenseNo data is not found in DB');
        
        
    }
    
    
}


console.log("distId",distId,"pharmaId",pharma._id)
const pharmaId=pharma._id
const ls=pharma.dl_code;
console.log(ls,"---ls")
const alrdylinked = await Link.findOne({pharmaId,distId });
console.log("alrdylinked",alrdylinked)
    if(!alrdylinked)
    {
        res.status(400);
        throw new Error('You not linked with search licenseNo');
    }
    // Find all invoices matching the license number
    const invoiceData = await InvoiceRD.find({ pharmadrugliseanceno: ls,reportDefault:true })
    .select({
        pharmadrugliseanceno:1,
         invoice: 1,
         invoiceData:1,
         dueDate:1,
         delayDays:1,
         invoiceAmount:1,
         invoiceDate:1,
         reason:1,
         createdAt:1
          
  
    }).lean()       

    if (!invoiceData || invoiceData.length === 0) {
        res.status(404);
        throw new Error('No invoices found for this license number');
    }

    const serialData=invoiceData.map((invoice,index)=>({
        serialNo:index+1,
        ...invoice
    }))
    res.status(200).json({
        success: true,
        count: serialData.length,
        data: serialData
    });
})
//@desc get count no of notices
//@router /api/user/countNotices
//@access public
const countNotices=asyncHandler(async(req,res)=>{
    const  licenseNo  = req.query.licenseNo;
    
    const totalCount = await Invoice.countDocuments({ pharmadrugliseanceno: licenseNo ,seen:false});
console.log(totalCount)
    res.status(200).json({
        success: true,
        totalCount
    });
})

//@desc get count no of notices
//@router /api/user/countDisputes
//@access public
const countDisputes=asyncHandler(async(req,res)=>{
    const  licenseNo  = req.query.licenseNo;
    console.log("Licemse No",licenseNo)
    const totalCount = await InvoiceRD.countDocuments({ customerId: new ObjectId(licenseNo) ,seen:false,dispute:true});
console.log(totalCount)
    res.status(200).json({
        success: true,
        totalCount
    });
})
//@desc link pharmauser and distuser
//@router /api/user/linkPharma/:id
//@access public
const linkpharmaController =asyncHandler(async(req,res)=>{
    const distId=req.params.id;
    console.log("distId",distId)
    const {pharmaId}=req.body;
    const alrdylinked = await Link.findOne({ pharmaId, distId });
    if(alrdylinked)
    {
        res.status(400);
        throw new Error('Already Linked');
        
    }
    if(!distId)
    {
        res.status(400);
        throw new Error('Pharmacy distId  is required');
    }
    if(!pharmaId)
    {
        res.status(400);
        throw new Error('Pharmacy pharmaId is required');
    }
    const link=await Link.create({
        distId,
        pharmaId
    })
    console.log({link})
    if(link)
        {
            res.status(201).json({pharmaId:link.pharmaId,distId:link.distId})
        }
        else{
            res.json({message:"failed"})
        }
})
//@desc get invoice data
//@router /api/user/getPharmaData/
//access public
const getPharmaData = asyncHandler(async (req, res) => {
    const licenseNo = req.query.licenseNo;
    console.log("licenseNo", licenseNo)

    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    let pharmadata;
    
    // Use $regex with case-insensitive partial matching for both pharmacy_name and dl_code
    pharmadata = await Register.find({ 
        $or: [
            { pharmacy_name: { $regex: licenseNo, $options: "i" } },
            { dl_code: { $regex: licenseNo, $options: "i" } }
        ]
    }).select({
        pharmacy_name: 1,
        email: 1,
        phone_number: 1,
        dl_code: 1,
        delayDays: 1,
        address: 1,
        expiry_date: 1,
        createdAt: 1
    });

    if (!pharmadata || pharmadata.length === 0) {
        res.status(404);
        throw new Error(`No data found for this license number. You can add customer details from the home screen by clicking '/Addcustomer'.`);
    }

    res.status(200).json({
        success: true,
        count: pharmadata.length,
        data: pharmadata
    });
});
//@desc get invoice data
//@router /api/user/checkIfLinked/:pharmaId/:distId
//access public
const checkIfLinked=asyncHandler(async (req,res)=>{
    const { pharmaId,distId } = req.params;
console.log("distId",distId)
    // Validate license number
    if (!pharmaId || !distId) {
        res.status(400);
        throw new Error('pharmaId and distId  required');
    }
    const alrdylinked = await Link.findOne({ pharmaId, distId });
    if(!alrdylinked)
    {
        res.status(400);
        throw new Error('You are not linked with this Drug License party . Please link for further information.');
    }
       res.status(200).json("Linked")
})
//@desc InvoceRD of customer
//@router /api/user/InvoiceReportDefault/:id 
//@access public

const InvoiceReportDefaultController =asyncHandler(async (req,res)=>{
    const customerId = req.params.id;
    console.log("data came",customerId)
    const {invoice,invoiceAmount,invoiceDate,dueDate,delayDays,pharmadrugliseanceno,reason}=req.body;
    if(!invoice || !invoiceAmount || !invoiceDate || !dueDate || !delayDays || !pharmadrugliseanceno)
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    console.log("data")
    const invoice2=await InvoiceRD.create({
        pharmadrugliseanceno,
        customerId,
        invoice,
        invoiceAmount,
        invoiceDate,
        dueDate,
        delayDays,
        reason,
    })
    console.log("invoice data",invoice2)
    if(invoice2)
    {
        res.status(201).json({invoice:invoice2.invoice,invoiceAmount:invoice2.invoiceAmount,invoiceDate:invoice2.invoiceDate,dueDate:invoice2.dueDate,delayDays:invoice2.delayDays,pharmadrugliseanceno:invoice2.pharmadrugliseanceno,reason:invoice2.reason})
    }
    else{
        res.json({message:"failed"})
    }
    

})
//@desc get pharama data by id
//@router /api/user/getPharamaDatainPharma/:id
//access public
const getPData=asyncHandler(async(req,res)=>{
    const customerId = req.params.id;
    // console.log("customerId",customerId)
    const Pdara=await Register.findById(customerId)
    if(!Pdara){
        res.status(400)
        throw new Error("Contact not found");
    }
    console.log("Pdara",Pdara)
    res.json({Pdara})
})

// @desc    Download Excel report
// @route   GET /api/user/downloadReport/excel
// @access  Public
const downloadExcelReport = asyncHandler(async (req, res) => {
    try {
        // First check if ExcelJS is properly imported
        if (!ExcelJS || !ExcelJS.Workbook) {
            throw new Error('ExcelJS not properly initialized');
        }

        const license = req.query.license;
        
        // Log to debug
        console.log('Creating Excel report for license:', license);
        
        const invoices = await InvoiceRD.find({ pharmadrugliseanceno: license });
        
        if (!invoices || invoices.length === 0) {
            res.status(404);
            throw new Error("No invoices found for Excel generation");
        }

        console.log('Found invoices:', invoices.length);
        
        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        console.log('Workbook created');
        
        const worksheet = workbook.addWorksheet('Invoice Report');
        
        // Define header style
        const headerStyle = {
            font: { bold: true, size: 12 },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F81BD' }
            },
            alignment: { horizontal: 'center' }
        };

        // Define columns
        worksheet.columns = [
            { header: 'Invoice No', key: 'invoice', width: 15 },
            { header: 'License Number', key: 'license', width: 20 },
            { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
            { header: 'Due Date', key: 'dueDate', width: 15 },
            { header: 'Delay Days', key: 'delayDays', width: 12 },
            {header:'Invoice Amount',key:'invoiceAmount',width:15}
        ];

        // Apply styles to header row
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = headerStyle.font;
            cell.fill = headerStyle.fill;
            cell.alignment = headerStyle.alignment;
        });

        // Add data rows
        invoices.forEach((invoice, index) => {
            worksheet.addRow({
                invoice: invoice.invoice,
                license: invoice.pharmadrugliseanceno,
                invoiceDate: new Date(invoice.invoiceData).toLocaleDateString(),
                dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                delayDays: invoice.delayDays,
                invoiceAmount:invoice.invoiceAmount
            });
        });

        // Add total row
        // const totalRow = worksheet.addRow({
        //     invoice: 'Total Invoices:',
        //     license: invoices.length,
        //     invoiceDate: '',
        //     dueDate: '',
        //     delayDays: invoices.reduce((sum, inv) => sum + (inv.delayDays || 0), 0)
        // });
        // totalRow.font = { bold: true };

        console.log('Preparing to send response');

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_report_${license}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        
        console.log('Excel file written successfully');
        
        res.end();
    } catch (error) {
        console.error('Excel generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel file',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

//@desc update reportdefault to false
//@route PUT /api/user/updateReportDefault
//@access public
const updateDefault = asyncHandler(async (req, res) => {
    const { pharmadrugliseanceno, invoice,customerId } = req.body;
    
    const result = await InvoiceRD.updateOne(
        {
            pharmadrugliseanceno: pharmadrugliseanceno,
            invoice: invoice,
            customerId:customerId
        },
        {
            $set: { updatebydistBoolean: true,
                updatebydist: new Date(),
                accept:true,
                reject:false
             }
            
        }
    );

    if (result.matchedCount === 0) {
        res.status(404);
        throw new Error('No document found with the given pharmadrugliseanceno and invoice');
    }

    if (result.modifiedCount === 1) {
        res.status(200).json({
            success: true,
            message: 'Report default updated successfully'
        });
    } else {
        res.status(200).json({
            success: true,
            message: 'Document already up to date'
        });
    }
});
//@desc update reportdefault to false
//@route PUT /api/user/updateReportDefaultReject/:pharmadrugliseanceno/:invoice/:customerId
//@access public
const updateDefaultReject = asyncHandler(async (req, res) => {
    
    const {  pharmadrugliseanceno, invoice, customerId } = req.body;
    console.log("rejectred----")
    const result = await InvoiceRD.updateOne(
        {
            pharmadrugliseanceno: pharmadrugliseanceno,
            invoice: invoice,
            customerId:customerId
        },
        {
            $set: { updatebydistBoolean: true,
                updatebydist: new Date(),
                reject:true,
                accept:false
             }
            
        }
    );

    if (result.matchedCount === 0) {
        res.status(404);
        throw new Error('No document found with the given pharmadrugliseanceno and invoice');
    }

    if (result.modifiedCount === 1) {
        res.status(200).json({
            success: true,
            message: 'Report default updated successfully'
        });
    } else {
        res.status(200).json({
            success: true,
            message: 'Document already up to date'
        });
    }
});
//@desc update reportdefault 
//@route PUT /api/user/disputebypharma/:pharmadrugliseanceno/:invoice/:customerId
//@access public
const disputebyPharma = asyncHandler(async (req, res) => {
    // Input validation
    
    const { reasonforDispute, pharmadrugliseanceno, invoice, customerId } = req.body;

    if (!pharmadrugliseanceno || !invoice || !customerId) {
        res.status(400);
        throw new Error('Missing required parameters');
    }

    if (!reasonforDispute) {
        res.status(400);
        throw new Error('Reason for dispute is required');
    }

    try {
        
        const result = await InvoiceRD.updateOne(
            {
                pharmadrugliseanceno: pharmadrugliseanceno,
                invoice: invoice,
                customerId: new ObjectId(customerId)
            },
            {
                $set: {
                    dispute: true,
                    reasonforDispute,
                    disputedAt: new Date()
                }
            }
        );
         console.log("---",result)
        // Check if document exists
        if (result.matchedCount === 0) {
            res.status(404);
            throw new Error('No invoice found with the provided details');
        }

        // Return appropriate response
        if (result.modifiedCount === 1) {
            return res.status(200).json({
                success: true,
                message: 'Dispute updated successfully',
                data: {
                    invoice,
                    disputed: true,
                    updatedAt: new Date()
                }
            });
        }

        // Document found but not modified (already disputed)
        return res.status(200).json({
            success: true,
            message: 'Invoice already disputed',
            data: {
                invoice,
                disputed: true
            }
        });
    } catch (error) {
        // Handle database errors
        if (error.name === 'MongoError') {
            res.status(500);
            throw new Error('Database operation failed');
        }
        throw error;
    }
});
//@desc update reportdefault to false
//@route PUT /api/user/adminupdate/:pharmadrugliseanceno/:invoice/:customerId
//@access public
const adminupdate = asyncHandler(async (req, res) => {
    const { pharmadrugliseanceno, invoice,customerId } = req.params;
    
    const result = await InvoiceRD.updateOne(
        {
            pharmadrugliseanceno: pharmadrugliseanceno,
            invoice: invoice,
            customerId:customerId
        },
        {
            $set: { reportDefault: true,
                
             }
            
        }
    );

    if (result.matchedCount === 0) {
        res.status(404);
        throw new Error('No document found with the given pharmadrugliseanceno and invoice');
    }

    if (result.modifiedCount === 1) {
        res.status(200).json({
            success: true,
            message: 'Dispute updated successfully'
        });
    } else {
        res.status(200).json({
            success: true,
            message: 'Document already up to date'
        });
    }
});
async function updateReportDefaultStatus() {
    try {
        // Find documents where both reportDefault and updatebydistBoolean are true
        const currentDate = new Date();
        
        // Calculate date 60 days ago
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        
        // Find and update documents
        const result = await InvoiceRD.updateMany(
            {
                reportDefault: true,
                updatebydistBoolean: true,
                updatebydist: { $lt: sixtyDaysAgo }  // Check if updatebydist is more than 60 days old
            },
            {
                $set: { reportDefault: false }
            }
        );
        
        console.log(`Updated ${result.modifiedCount} documents`);
    } catch (error) {
        console.error('Error updating report default status:', error);
    }
}

// Schedule the task to run daily at midnight
nodeCron.schedule('0 0 * * *', () => {
    console.log('Running daily update check for reportDefault status');
    updateReportDefaultStatus();
});

// If you want to run it immediately when the server starts
updateReportDefaultStatus();

//@desc get invoice done by dist by id
//@router get/api/user/getinvoicesbydistId/:id
//access public
const getinvoicesbydistId=asyncHandler(async(req,res)=>{
    const customerId=req.params.id;
    if(!customerId)
    {
        res.status(400)
        throw new Error("id required")
        
    }
    const invoices=await Invoice.find({customerId:customerId})

    const invoicewithserialnumbers=invoices.map((invoice,index)=>({
           serialNo:index+1,
           ...invoice.toObject()
    }))
    res.status(200).json({
        success: true,
        count: invoicewithserialnumbers.length,
        data: invoicewithserialnumbers
    });

})

//@desc get invoice done by dist by id
//@router get/api/user/getinvoiceRDbydistId/:id
//access public
const getinvoiceRDbydistId=asyncHandler(async(req,res)=>{
    const customerId=req.params.id;
    if(!customerId)
    {
        res.status(400)
        throw new Error("id required")
        
    }
    const invoices=await InvoiceRD.find({customerId:customerId,reportDefault:"true"})

    const invoicewithserialnumbers=invoices.map((invoice,index)=>({
           serialNo:index+1,
           ...invoice.toObject()
    }))
    res.status(200).json({
        success: true,
        count: invoicewithserialnumbers.length,
        data: invoicewithserialnumbers
    });

})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept excel files only
        if (file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
            file.mimetype === "application/vnd.ms-excel") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only excel files are allowed!'));
        }
    }
}).single('file');  


//@desc upload files
//@router /api/user/uploads
//access public
const FileUploadController = asyncHandler(async (req, res) => {
    try {
        // Handle file upload
        upload(req, res, async function (err) {
            if (err) {
                return res.status(400).json({
                    message: err.message
                });
            }

            // Check if file exists
            if (!req.file) {
                return res.status(400).json({
                    message: 'Please upload an excel file!'
                });
            }

            // Read excel file
            const workbook = XLSX.readFile(req.file.path);
            const sheet_name_list = workbook.SheetNames;
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

            // Assuming you have a mongoose model called 'YourModel'
            // Replace this with your actual model
            const YourModel = require('../models/yourModel');

            // Store data in MongoDB
            await YourModel.insertMany(data);

            // Optional: Delete the uploaded file after processing
            const fs = require('fs');
            fs.unlinkSync(req.file.path);

            res.status(200).json({
                message: 'File uploaded and data stored successfully!',
                data: data
            });
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error uploading file',
            error: error.message
        });
    }
});


//@desc upload oustadinfxlfile
//@router /api/user/outstanding/:id
//@access public

const uploadOutstandingFile=asyncHandler(async(req,res)=>{
    const customerId=req.params.id;
    if(!customerId)
        {
            res.status(400)
            throw new Error("id required")
            
        }
    try{
        upload(req,res,async function (err){
            if (err) {
                return res.status(400).json({
                    message: err.message
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    message: 'Please upload an excel file!'
                });
            }
           const workbook=XLSX.readFile(req.file.path);
           const sheet_name_list=workbook.SheetNames;
           const data=XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
          
           const fs = require('fs');
           try {
            // Check if customer already exists
            const validatedData = data.map(row => ({
                Description: row.Description,
                Total: parseFloat(row.Total),
                additionalFields: { ...row }
            }));
            let outstanding = await Outstanding.findOne({ customerId });
            if (!outstanding) {
                outstanding = new Outstanding({ customerId, uploadData: [] });
            }

            // Add new data
            outstanding.uploadData.push(...validatedData);
            await outstanding.save();
            

          
           
          

            res.status(200).json({
                customerId: customerId,
                message: 'Data uploaded successfully',
                recordsAdded: validatedData.length,
                totalRecords: outstanding.uploadData.length
            });
            fs.unlinkSync(req.file.path);
        } catch (dbError) {
            // If database operation fails, delete the uploaded file
            fs.unlinkSync(req.file.path);
            throw dbError;
        }
        })
    }catch(error){

        res.status(500).json({
            message: 'Error uploading file',
            error: error.message
        });
    }

}
)
//@desc get uploaded data by description
//@router /api/user/getUploadedData
//@access public
const getSumByDescription = asyncHandler(async (req, res) => {
    try {
      const { licenseNo } = req.query;
      let phname;
      const pharma = await Register.findOne({ dl_code: licenseNo });
      console.log("----",pharma)
      if (pharma) {
        phname = pharma.pharmacy_name.toUpperCase();
      } else {
        phname = licenseNo;
      }
      
      console.log(phname, "phanme");
      
      const data = await Outstanding.aggregate([
        { $unwind: '$uploadData' },
        {
          $match: {
            'uploadData.Description': phname
          }
        },
        {
          $group: {
            _id: '$uploadData.Description',
            totalSum: { $sum: { $toDouble: '$uploadData.Total' } }
          }
        },
        {
          $project: {
            Description: '$_id',
            Total: '$totalSum'
          }
        }
      ]);
      
      // If data array is empty, return default object
      const response = data.length > 0 ? data : [{ Description: '', Total: 0 }];
      
      console.log(response);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  
//@desc get report default info if duspute true or false
//@router /api/user/checkifdisputed/:id
//access public

const checkifdisputedtrue = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { pharmadrugliseanceno, invoice } = req.query;

    // Validate required fields
    if (!id || !pharmadrugliseanceno || !invoice) {
        res.status(400);
        throw new Error('Provided information is not sufficient');
    }

    // Find the invoice document
    const invoiceData = await InvoiceRD.findOne({
        customerId: id,
        pharmadrugliseanceno: pharmadrugliseanceno,
        invoice: invoice
    });

    // Check if invoice exists
    if (!invoiceData) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    // Get dispute status
    const isDisputed = invoiceData.dispute || false;

    // Check if 24 hours have passed since creation
    const createdTime = new Date(invoiceData.createdAt).getTime();
    const currentTime = new Date().getTime();
    const hoursPassed = (currentTime - createdTime) / (1000 * 60 * 60);
    const hasTimeElapsed = hoursPassed >= 24;

    res.status(200).json({
        success: true,
        data: {
            isDisputed,
            hasTimeElapsed,
            hoursPassed: Math.floor(hoursPassed),
            invoice: invoiceData
        }
    });
});
//@desc get data
//@router /api/user/getData
const sampletogetData=asyncHandler(async(req,res)=>{
    const { licenseNo } = req.query;
    console.log("lojn",licenseNo)
    const pharma = await Register.find({dl_code:{$regex:licenseNo,$options:"i"}})
    res.json(pharma)
})

//@desc get all reportdefoult data who are disputed 
//@router /api/user/getDispuedData
//@access public
const getDipsutedData = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1; // Parse page number, default to 1
    const limit = parseInt(req.query.limit, 10) || 100; // Parse limit, default to 100
    const skip = (page - 1) * limit;

    const licenseNo = req.query.licenseNo || '';
    const address = req.query.address || '';

    const filter = [];
    
    // Add filters based on licenseNo and address
    if (licenseNo) {
        filter.push({ dl_code: { $regex: licenseNo, $options: 'i' } });
        filter.push({ pharmacy_name: { $regex: licenseNo, $options: 'i' } });
    }
    if (address) {
        filter.push({ address: { $regex: address, $options: 'i' } });
    }

    // Build the query
    const query = {
        dispute: true,
        updatebydistBoolean: false,
        reportDefault: true,
        ...(filter.length > 0 && { $or: filter }) // Add $or condition only if filters exist
    };

    try {
        // Fetch data with pagination
        const data = await InvoiceRD.find(query).skip(skip).limit(limit);

        // Fetch total count for pagination
        const totalCount = await InvoiceRD.countDocuments(query);

        // Respond with data and pagination
        res.json({
            success: true,
            data,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (error) {
        // Handle errors gracefully
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

//@desc get all reportdefoult data who are disputed by customerId
//@router /api/user/getDipsutedDatabyId
//@access public
const getDipsutedDatabyId=asyncHandler(async(req,res)=>{
    const { id } = req.query;
    const page = parseInt(req.query.page, 10) || 1; // Parse page number, default to 1
    const limit = parseInt(req.query.limit, 10) || 100; // Parse limit, default to 100
    const skip = (page - 1) * limit;

    const licenseNo = req.query.licenseNo || '';
    const address = req.query.address || '';

    const filter = [];
    
    // Add filters based on licenseNo and address
    if (licenseNo) {
        filter.push({ dl_code: { $regex: licenseNo, $options: 'i' } });
        filter.push({ pharmacy_name: { $regex: licenseNo, $options: 'i' } });
    }
    if (address) {
        filter.push({ address: { $regex: address, $options: 'i' } });
    }

    // Build the query
    const query = {
        dispute: true,
            updatebydistBoolean: false,
            reportDefault: true,
            customerId: id,
        ...(filter.length > 0 && { $or: filter }) // Add $or condition only if filters exist
    };
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Customer ID is required",
        });
    }
    try {
        const data = await InvoiceRD.find(query).skip(skip).limit(limit);
        const totalCount = await InvoiceRD.countDocuments(query);
        res.json({
            success: true,
            data:data,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                perPage: limit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch disputed data",
            error: error.message,
        });
    }
})

//@desc update notices seen status
//@router /api/user/updateNoticesSeenStatus
//@access public
const updateNoticeSeenStatus = asyncHandler(async (req, res) => {
    const { invoiceIds } = req.body;
    console.log("seen");

    // Validate request body
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
        res.status(400);
        throw new Error('Invalid request: invoiceIds array is required');
    }

    try {
        // Convert each invoiceId to ObjectId
        const objectIds = invoiceIds.map(id => new ObjectId(id));
        console.log("objectIds",objectIds)
        // Update all notices with the provided IDs
        const updateResult = await Invoice.updateMany(
            { 
                _id: { $in: objectIds },
                seen: { $ne: true } // ne means not equal
            },
            {
                $set: { 
                    seen: true,
                    seenAt: new Date() 
                }
            }
        );

        // Check if any documents were modified
        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No new notices to mark as seen',
                modifiedCount: 0
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notices marked as seen successfully',
            modifiedCount: updateResult.modifiedCount
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Failed to update notices: ${error.message}`);
    }
});
//@desc update notices seen status
//@router /api/user/updateDisputeSeenStatus
//@access public
const updateDisputeSeenStatus = asyncHandler(async (req, res) => {
    const { invoiceIds } = req.body;
    console.log("seen");

    // Validate request body
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
        res.status(400);
        throw new Error('Invalid request: invoiceIds array is required');
    }

    try {
        // Convert each invoiceId to ObjectId
        const objectIds = invoiceIds.map(id => new ObjectId(id));
        console.log("objectIds",objectIds)
        // Update all notices with the provided IDs
        const updateResult = await InvoiceRD.updateMany(
            { 
                _id: { $in: objectIds },
                seen: { $ne: true } // ne means not equal
            },
            {
                $set: { 
                    seen: true,
                    seenAt: new Date() 
                }
            }
        );

        // Check if any documents were modified
        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No new notices to mark as seen',
                modifiedCount: 0
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notices marked as seen successfully',
            modifiedCount: updateResult.modifiedCount
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Failed to update notices: ${error.message}`);
    }
});
//@desc update notices seen status
//@router /api/user/updateDisputeAdminSeenStatus
//@access public
const updateDisputeAdminSeenStatus = asyncHandler(async (req, res) => {
    const { invoiceIds } = req.body;
    console.log("seen");

    // Validate request body
    if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
        res.status(400);
        throw new Error('Invalid request: invoiceIds array is required');
    }

    try {
        // Convert each invoiceId to ObjectId
        const objectIds = invoiceIds.map(id => new ObjectId(id));
        console.log("objectIds",objectIds)
        // Update all notices with the provided IDs
        const updateResult = await InvoiceRD.updateMany(
            { 
                _id: { $in: objectIds },
                seenbyAdmin: { $ne: true } // ne means not equal
            },
            {
                $set: { 
                    seenbyAdmin: true,
                    
                }
            }
        );

        // Check if any documents were modified
        if (updateResult.modifiedCount === 0) {
            return res.status(200).json({
                success: true,
                message: 'No new notices to mark as seen',
                modifiedCount: 0
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notices marked as seen successfully',
            modifiedCount: updateResult.modifiedCount
        });

    } catch (error) {
        res.status(500);
        throw new Error(`Failed to update notices: ${error.message}`);
    }
});
module.exports={InvoiceController,getInvoiceData,linkpharmaController,getPharmaData,InvoiceReportDefaultController,getInvoiceRDData,getPData,downloadExcelReport,countNotices,checkIfLinked,getInvoiceRDDataforDist,updateDefault,getInvoiceRDDataforDistUpdate,disputebyPharma,adminupdate,updateReportDefaultStatus,getinvoicesbydistId,getinvoiceRDbydistId,FileUploadController,uploadOutstandingFile,getSumByDescription,checkifdisputedtrue,sampletogetData,getDipsutedData,getDipsutedDatabyId,updateDefaultReject,updateNoticeSeenStatus,countDisputes,updateDisputeSeenStatus,updateDisputeAdminSeenStatus}


