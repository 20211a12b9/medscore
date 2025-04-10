const express=require("express");
const { registerController, registerController2, loginUser, getDistData, adminController, getDistDataController, getPharmaCentalData, getDistributorsData, getPharmacyData, getMHCentalData, checkIfLoggedinbith, addPhonenumber, refreshToken } = require("../controllers/RegisterController");
const { InvoiceController, getInvoiceData, getPharmaData, linkpharmaController, InvoiceReportDefaultController, getInvoiceRDData, getPData, downloadExcelReport, countNotices, checkIfLinked, getInvoiceRDDataforDist, updateDefault, getInvoiceRDDataforDistUpdate, disputebyPharma, checkdispute, adminupdate, getinvoicesbydistId, getinvoiceRDbydistId, FileUploadController, uploadOutstandingFile, getSumByDescription, checkifdisputedtrue, sampletogetData, getDipsutedData, getDipsutedDatabyId, updateDefaultReject, updateNoticeSeenStatus, countDisputes, updateDisputeSeenStatus, updateDisputeAdminSeenStatus,getDistributorConnections, getPharmaData2, getPharmaConnections, getinvoiceDetailedRDbydistId, updateNotice, getDetailedinvoicesbydistId, getInvoiceRDforIndividual } = require("../controllers/InvoiceController");
const { sendSms, getcoustdatafromlink } = require("../controllers/sendSMSController");
const { ResetPassword, confirmResetPassword } = require("../controllers/ResetPasswordController");
const { postBlogs, getBlogs, getBlogsById } = require("../controllers/blogsController");
const { uploadcentalData, getCentaldata, uploadMaharastracentalData, getMaharastraCentaldata } = require("../controllers/distCentalController");
const { getcountofAdminneedDetails, getAdminLikedData, getOutstandingUpdateddetails } = require("../controllers/adminDashboard");
const { getAdminDefaults,getAdminNotices,getDispytedBydistforAdmin,getDispytesClaimedforAdmin } = require('../controllers/adminDashboard'); 
const validateToken = require("../middleware/validateTokeHandler");
const recaptcha = require("../controllers/recaptcha");
const { postjobOpenings, getJobOpenings, deleteJobOpenings } = require("../controllers/jobOpeningsController");
const { chatWithBot, postmessage, getHistory, initChat } = require("../controllers/chatbotController");
const { outstandingReport } = require("../controllers/oustandingAnalysis");
const router=express.Router();



router.post("/Pharmacyregister",registerController)
router.post("/Distributorregister",registerController2)
router.post("/Invoice/:id",InvoiceController)
router.post("/InvoiceReportDefault/:id",InvoiceReportDefaultController)
router.post("/linkPharma/:id",linkpharmaController)
router.get("/getInvoice",getInvoiceData)
router.get("/getpharmaData",getPharmaData)
router.get("/getPharmaData2",getPharmaData2)
router.get("/getInvoiceRD/",getInvoiceRDData)
router.get("/getInvoiceRDforIndividual",getInvoiceRDforIndividual)
router.get("/getInvoiceRDforDistUpdate",getInvoiceRDDataforDistUpdate)
router.get("/getPharamaDatainPharma/:id",getPData)
router.post("/login",loginUser)
// router.post("/refreshToken",refreshToken)
router.get('/downloadReport/excel', downloadExcelReport);
router.get('/countNotices',countNotices);
router.post("/sendSMS/",sendSms)
router.get('/getdistdatabyphid/:id', getDistData);
router.get("/checkIfLinked/:pharmaId/:distId",checkIfLinked)
router.post("/createAdmin",adminController)
router.get("/getInvoiceRDforDist/:distId",getInvoiceRDDataforDist)
router.get('/getDistData/:id', getDistDataController);
router.put('/updateReportDefault',updateDefault)
router.put('/updateNotice',updateNotice)
router.put('/updateDefaultReject',updateDefaultReject)
router.put('/disputebyPharma',disputebyPharma)
router.put('/adminupdate/:pharmadrugliseanceno/:invoice/:customerId',adminupdate)
router.post('/resetpassword',ResetPassword)
router.post('/confirmResetPassword',confirmResetPassword)
router.get('/getinvoicesbydistId/:id', getinvoicesbydistId);
router.get('/getDetailedinvoicesbydistId/:id',getDetailedinvoicesbydistId)
router.get('/getinvoiceRDbydistId/:id', getinvoiceRDbydistId);
router.post('/uploads',FileUploadController)
router.post('/outstanding/:id',uploadOutstandingFile)
router.get('/getUploadedData', getSumByDescription);
router.get('/checkifdisputedtrue/:id',checkifdisputedtrue)
router.get('/getBlogs', getBlogs);
router.get('/getBlogs/:id', getBlogsById);
router.post('/postBlogs',postBlogs);
router.get('/sampletogetData',sampletogetData)
router.post('/uploadcentalData',uploadcentalData)
router.post('/uploadMaharastracentalData',uploadMaharastracentalData)
router.get('/getPharmaCentalData',getPharmaCentalData)
router.get('/getMHCentalData',getMHCentalData)
router.get('/getcountofAdminneedDetails',getcountofAdminneedDetails)
router.get('/getDipsutedData',getDipsutedData)
router.get('/getDistributorsData', getDistributorsData)
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
router.post('/checkIfLoggedinbith',checkIfLoggedinbith)
router.post('/addPhonenumber/:id',addPhonenumber)
router.get('/getPharmaConnections',getPharmaConnections)
router.get('/getinvoiceDetailedRDbydistId/:id',getinvoiceDetailedRDbydistId)
router.post('/recaptcha',recaptcha)
router.post('/postjobOpenings',postjobOpenings)
router.get('/getJobOpenings',getJobOpenings)
router.delete('/deleteJobOpenings/:id',deleteJobOpenings)
router.get('/outstandingReport',outstandingReport)

router.post('/message',postmessage)
router.get('/history/:sessionId',getHistory)
router.post('/init',initChat)
router.get('/getOutstandingUpdateddetails',getOutstandingUpdateddetails)


module.exports=router;