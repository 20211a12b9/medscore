const express=require("express");
const { registerController, registerController2, loginUser, getDistData, adminController, getDistDataController } = require("../controllers/RegisterController");
const { InvoiceController, getInvoiceData, getPharmaData, linkpharmaController, InvoiceReportDefaultController, getInvoiceRDData, getPData, downloadExcelReport, countNotices, getPharmaData2, checkIfLinked, getInvoiceRDDataforDist, updateDefault, getInvoiceRDDataforDistUpdate, disputebyPharma, checkdispute, adminupdate, getinvoicesbydistId, getinvoiceRDbydistId, FileUploadController, uploadOutstandingFile, getSumByDescription, checkifdisputedtrue } = require("../controllers/InvoiceController");
const { sendSms } = require("../controllers/sendSMSController");
const { ResetPassword, confirmResetPassword } = require("../controllers/ResetPasswordController");
const { postBlogs, getBlogs, getBlogsById } = require("../controllers/blogsController");

const router=express.Router();


router.post("/Pharmacyregister",registerController)
router.post("/Distributorregister",registerController2)
router.post("/Invoice/:id",InvoiceController)
router.post("/InvoiceReportDefault/:id",InvoiceReportDefaultController)
router.post("/linkPharma/:id",linkpharmaController)
router.get("/getInvoice",getInvoiceData)
router.get("/getpharmaData",getPharmaData)
router.get("/getInvoiceRD/",getInvoiceRDData)
router.get("/getInvoiceRDforDistUpdate",getInvoiceRDDataforDistUpdate)
router.get("/getPharamaDatainPharma/:id",getPData)
router.post("/login",loginUser)
router.get('/downloadReport/excel', downloadExcelReport);
router.get('/countNotices', countNotices);
// router.post("/sendSMS/",sendSms)
router.get('/getdistdatabyphid/:id', getDistData);
router.get("/checkIfLinked/:pharmaId/:distId",checkIfLinked)
router.post("/createAdmin",adminController)
router.get("/getInvoiceRDforDist/:distId",getInvoiceRDDataforDist)
router.get('/getDistData/:id', getDistDataController);
router.put('/updateReportDefault/:pharmadrugliseanceno/:invoice/:customerId',updateDefault)
router.put('/disputebyPharma/:pharmadrugliseanceno/:invoice/:customerId',disputebyPharma)
router.put('/adminupdate/:pharmadrugliseanceno/:invoice/:customerId',adminupdate)
router.post('/resetpassword',ResetPassword)
router.post('/confirmResetPassword',confirmResetPassword)
router.get('/getinvoicesbydistId/:id', getinvoicesbydistId);
router.get('/getinvoiceRDbydistId/:id', getinvoiceRDbydistId);
router.post('/uploads',FileUploadController)
router.post('/outstanding/:id',uploadOutstandingFile)
router.get('/getUploadedData', getSumByDescription);
router.get('/checkifdisputedtrue/:id',checkifdisputedtrue)
router.get('/getBlogs', getBlogs);
router.get('/getBlogs/:id', getBlogsById);
router.post('/postBlogs', postBlogs);
module.exports=router;