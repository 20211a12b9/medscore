const express=require("express");
const { registerController, registerController2, loginUser, getDistData, adminController, getDistDataController, getPharmaCentalData, getDistributorsData, getPharmacyData, getMHCentalData } = require("../controllers/RegisterController");
const { InvoiceController, getInvoiceData, getPharmaData, linkpharmaController, InvoiceReportDefaultController, getInvoiceRDData, getPData, downloadExcelReport, countNotices, checkIfLinked, getInvoiceRDDataforDist, updateDefault, getInvoiceRDDataforDistUpdate, disputebyPharma, checkdispute, adminupdate, getinvoicesbydistId, getinvoiceRDbydistId, FileUploadController, uploadOutstandingFile, getSumByDescription, checkifdisputedtrue, sampletogetData, getDipsutedData, getDipsutedDatabyId, updateDefaultReject, updateNoticeSeenStatus, countDisputes, updateDisputeSeenStatus, updateDisputeAdminSeenStatus,getDistributorConnections } = require("../controllers/InvoiceController");
const { sendSms } = require("../controllers/sendSMSController");
const { ResetPassword, confirmResetPassword } = require("../controllers/ResetPasswordController");
const { postBlogs, getBlogs, getBlogsById } = require("../controllers/blogsController");
const { uploadcentalData, getCentaldata, uploadMaharastracentalData, getMaharastraCentaldata } = require("../controllers/distCentalController");
const { getcountofAdminneedDetails, getAdminLikedData } = require("../controllers/adminDashboard");
const { getAdminDefaults,getAdminNotices,getDispytedBydistforAdmin,getDispytesClaimedforAdmin } = require('../controllers/adminDashboard'); 
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
router.post("/sendSMS/",sendSms)
router.get('/getdistdatabyphid/:id', getDistData);
router.get("/checkIfLinked/:pharmaId/:distId",checkIfLinked)
router.post("/createAdmin",adminController)
router.get("/getInvoiceRDforDist/:distId",getInvoiceRDDataforDist)
router.get('/getDistData/:id', getDistDataController);
router.put('/updateReportDefault',updateDefault)
router.put('/updateDefaultReject',updateDefaultReject)
router.put('/disputebyPharma',disputebyPharma)
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
router.get('/sampletogetData',sampletogetData)
router.post('/uploadcentalData',uploadcentalData)
router.post('/uploadMaharastracentalData',uploadMaharastracentalData)
router.get('/getPharmaCentalData',getPharmaCentalData)
router.get('/getMHCentalData',getMHCentalData)
router.get('/getcountofAdminneedDetails',getcountofAdminneedDetails)
router.get('/getDipsutedData',getDipsutedData)
router.get('/getDistributorsData',getDistributorsData)
router.get('/getPharmacyData',getPharmacyData)
router.get('/getDipsutedDatabyId',getDipsutedDatabyId)
router.put('/updateNoticeSeenStatus',updateNoticeSeenStatus)
router.get('/countDisputes',countDisputes)
router.put('/updateDisputeSeenStatus',updateDisputeSeenStatus)
router.put('/updateDisputeAdminSeenStatus',updateDisputeAdminSeenStatus)
router.get('/getCentaldata',getCentaldata)
router.get('/getMaharastraCentaldata',getMaharastraCentaldata)
router.get('/getAdminLikedData',getAdminLikedData)
router.get('/getAdminDefaults',getAdminDefaults)
router.get('/getAdminNotices',getAdminNotices)
router.get('/getDispytedBydistforAdmin',getDispytedBydistforAdmin)
router.get('/getDispytesClaimedforAdmin',getDispytesClaimedforAdmin)
router.get('/getDistributorConnections',getDistributorConnections)


module.exports=router;