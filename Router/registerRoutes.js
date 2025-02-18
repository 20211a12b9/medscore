const express=require("express");
const { registerController, registerController2, loginUser, getDistData, adminController, getDistDataController, getPharmaCentalData, getDistributorsData, getPharmacyData, getMHCentalData, checkIfLoggedinbith, addPhonenumber, refreshToken } = require("../controllers/RegisterController");
const { InvoiceController, getInvoiceData, getPharmaData, linkpharmaController, InvoiceReportDefaultController, getInvoiceRDData, getPData, downloadExcelReport, countNotices, checkIfLinked, getInvoiceRDDataforDist, updateDefault, getInvoiceRDDataforDistUpdate, disputebyPharma, checkdispute, adminupdate, getinvoicesbydistId, getinvoiceRDbydistId, FileUploadController, uploadOutstandingFile, getSumByDescription, checkifdisputedtrue, sampletogetData, getDipsutedData, getDipsutedDatabyId, updateDefaultReject, updateNoticeSeenStatus, countDisputes, updateDisputeSeenStatus, updateDisputeAdminSeenStatus,getDistributorConnections, getPharmaData2, getPharmaConnections, getinvoiceDetailedRDbydistId, updateNotice, getDetailedinvoicesbydistId } = require("../controllers/InvoiceController");
const { sendSms } = require("../controllers/sendSMSController");
const { ResetPassword, confirmResetPassword } = require("../controllers/ResetPasswordController");
const { postBlogs, getBlogs, getBlogsById } = require("../controllers/blogsController");
const { uploadcentalData, getCentaldata, uploadMaharastracentalData, getMaharastraCentaldata } = require("../controllers/distCentalController");
const { getcountofAdminneedDetails, getAdminLikedData } = require("../controllers/adminDashboard");
const { getAdminDefaults,getAdminNotices,getDispytedBydistforAdmin,getDispytesClaimedforAdmin } = require('../controllers/adminDashboard'); 
const validateToken = require("../middleware/validateTokeHandler");
const recaptcha = require("../controllers/recaptcha");
const router=express.Router();



router.post("/Pharmacyregister",registerController)
router.post("/Distributorregister",registerController2)
router.post("/Invoice/:id",validateToken,InvoiceController)
router.post("/InvoiceReportDefault/:id",validateToken,InvoiceReportDefaultController)
router.post("/linkPharma/:id",validateToken,linkpharmaController)
router.get("/getInvoice",validateToken,getInvoiceData)
router.get("/getpharmaData",validateToken,getPharmaData)
router.get("/getPharmaData2",validateToken,getPharmaData2)
router.get("/getInvoiceRD/",validateToken,getInvoiceRDData)
router.get("/getInvoiceRDforDistUpdate",validateToken,getInvoiceRDDataforDistUpdate)
router.get("/getPharamaDatainPharma/:id",validateToken,getPData)
router.post("/login",loginUser)
router.post("/refreshToken",refreshToken)
router.get('/downloadReport/excel',validateToken, downloadExcelReport);
router.get('/countNotices', validateToken,countNotices);
router.post("/sendSMS/",sendSms)
router.get('/getdistdatabyphid/:id',validateToken, getDistData);
router.get("/checkIfLinked/:pharmaId/:distId",validateToken,checkIfLinked)
router.post("/createAdmin",adminController)
router.get("/getInvoiceRDforDist/:distId",validateToken,getInvoiceRDDataforDist)
router.get('/getDistData/:id',validateToken, getDistDataController);
router.put('/updateReportDefault',validateToken,updateDefault)
router.put('/updateNotice',validateToken,updateNotice)
router.put('/updateDefaultReject',validateToken,updateDefaultReject)
router.put('/disputebyPharma',validateToken,disputebyPharma)
router.put('/adminupdate/:pharmadrugliseanceno/:invoice/:customerId',adminupdate)
router.post('/resetpassword',ResetPassword)
router.post('/confirmResetPassword',confirmResetPassword)
router.get('/getinvoicesbydistId/:id',validateToken, getinvoicesbydistId);
router.get('/getDetailedinvoicesbydistId/:id',validateToken,getDetailedinvoicesbydistId)
router.get('/getinvoiceRDbydistId/:id',validateToken, getinvoiceRDbydistId);
router.post('/uploads',validateToken,FileUploadController)
router.post('/outstanding/:id',uploadOutstandingFile)
router.get('/getUploadedData',validateToken, getSumByDescription);
router.get('/checkifdisputedtrue/:id',validateToken,checkifdisputedtrue)
router.get('/getBlogs', getBlogs);
router.get('/getBlogs/:id', getBlogsById);
router.post('/postBlogs',postBlogs);
router.get('/sampletogetData',sampletogetData)
router.post('/uploadcentalData',uploadcentalData)
router.post('/uploadMaharastracentalData',uploadMaharastracentalData)
router.get('/getPharmaCentalData',validateToken,getPharmaCentalData)
router.get('/getMHCentalData',validateToken,getMHCentalData)
router.get('/getcountofAdminneedDetails',validateToken,getcountofAdminneedDetails)
router.get('/getDipsutedData',validateToken,getDipsutedData)
router.get('/getDistributorsData',validateToken, getDistributorsData)
router.get('/getPharmacyData',validateToken,getPharmacyData)
router.get('/getDipsutedDatabyId',validateToken,getDipsutedDatabyId)
router.put('/updateNoticeSeenStatus',updateNoticeSeenStatus)
router.get('/countDisputes',validateToken,countDisputes)
router.put('/updateDisputeSeenStatus',updateDisputeSeenStatus)
router.put('/updateDisputeAdminSeenStatus',updateDisputeAdminSeenStatus)
router.get('/getCentaldata',validateToken,getCentaldata)
router.get('/getMaharastraCentaldata',validateToken,getMaharastraCentaldata)
router.get('/getAdminLikedData',validateToken,getAdminLikedData)
router.get('/getAdminDefaults',validateToken,getAdminDefaults)
router.get('/getAdminNotices',validateToken,getAdminNotices)
router.get('/getDispytedBydistforAdmin',validateToken,getDispytedBydistforAdmin)
router.get('/getDispytesClaimedforAdmin',validateToken,getDispytesClaimedforAdmin)
router.get('/getDistributorConnections',validateToken,getDistributorConnections)
router.post('/checkIfLoggedinbith',checkIfLoggedinbith)
router.post('/addPhonenumber/:id',validateToken,addPhonenumber)
router.get('/getPharmaConnections',validateToken,getPharmaConnections)
router.get('/getinvoiceDetailedRDbydistId/:id',validateToken,getinvoiceDetailedRDbydistId)
router.post('/recaptcha',recaptcha)
module.exports=router;