const asyncHandler=require("express-async-handler")
const Register=require("../models/registerModel")//phraam
const Register2=require("../models/registerModel2")//distributors
const Link=require("../models/linkPharma")
const DistCentaldata=require("../models/distCentralModel")
const InvoiceRD=require("../models/invoiceReportDefaultModel")
const Invoice=require("../models/invoiceModel");
const MahaData=require("../models/maharastraCentalData")
const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;

//@desc get count of distribuors and customers
//@router /api/user/getcountofdistributorspharma
const getcountofAdminneedDetails=asyncHandler(async(req,res)=>{
    const distributors=await Register2.countDocuments({})
    const pharamacustomers=await Register.countDocuments({})
    const centalDataofDLH=await DistCentaldata.countDocuments({})
    const linkedUsers=await Link.countDocuments({})
    const defaulters=await InvoiceRD.countDocuments({reportDefault:true,updatebydistBoolean:false})
    const notices=await Invoice.countDocuments({})
    const updatebydist=await InvoiceRD.countDocuments({updatebydistBoolean:true})
    const disputesClaimed=await InvoiceRD.countDocuments({dispute:true})
    const mahaData=await MahaData.countDocuments({})
    const disputescountbyAdminUnseen=await InvoiceRD.countDocuments({dispute:true,seenbyAdmin:false,updatebydistBoolean:false})
    res.json({"distributors":distributors,"pharamacustomers":pharamacustomers,"centalDataofDLH":centalDataofDLH,"linkedUsers":linkedUsers,"defaulters":defaulters,"notices":notices,"updatebydist":updatebydist,"disputesClaimed":disputesClaimed,"disputescountbyAdminUnseen":disputescountbyAdminUnseen,"mahaData":mahaData})
})


const getAdminDefaults = asyncHandler(async (req, res) => {
    try {
      // 1. Fetch invoice data in one query
      const defaults = await InvoiceRD.find().select({
        customerId: 1,
        pharmadrugliseanceno: 1,
        invoiceAmount: 1,
        createdAt: 1,
        updatedAt: 1
      });
  
      // 2. Calculate total amount (this can be done while processing the data)
      const invoiceAmountSum = defaults.reduce(
        (sum, invoice) => sum + (Number(invoice.invoiceAmount) || 0),
        0
      );
  
      // 3. Get unique IDs and dl_codes for bulk queries
      const uniqueCustomerIds = [...new Set(defaults
        .map(doc => doc.customerId)
        .filter(Boolean))];
      
      const uniqueDlCodes = [...new Set(defaults
        .map(doc => doc.pharmadrugliseanceno)
        .filter(Boolean))];
  
      // 4. Fetch all pharmacy and distributor data in parallel
      const [pharmacies, distributors] = await Promise.all([
        Register.find({ dl_code: { $in: uniqueDlCodes } })
          .select('dl_code pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc.dl_code, doc.pharmacy_name])
          )),
        Register2.find({ _id: { $in: uniqueCustomerIds } })
          .select('_id pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
          ))
      ]);
  
      // 5. Combine all data
      const combinedData = defaults.map(doc => ({
        ...doc.toObject(),
        pharmacy_name: pharmacies[doc.pharmadrugliseanceno] || 'Hydra Medicals',
        distributor_name: distributors[doc.customerId.toString()] || 'GMR Distribution',
        invoiceAmount: doc.invoiceAmount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));
  
      res.json({
        Defaults: combinedData,
        invoiceAmountSum
      });
  
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  });
  
  const getAdminNotices = asyncHandler(async (req, res) => {
    try {
      // 1. Fetch invoice data in one query
      const defaults = await Invoice.find().select({
        customerId: 1,
        pharmadrugliseanceno: 1,
        invoiceAmount: 1,
        createdAt: 1,
        updatedAt: 1
      });
      const noticecount=await Invoice.countDocuments({})
      // 2. Calculate total amount
      const invoiceAmountSum = defaults.reduce(
        (sum, invoice) => sum + (Number(invoice.invoiceAmount) || 0),
        0
      );
  
      // 3. Get unique IDs and dl_codes for bulk queries
      const uniqueCustomerIds = [...new Set(defaults
        .map(doc => doc.customerId)
        .filter(Boolean))];
      
      const uniqueDlCodes = [...new Set(defaults
        .map(doc => doc.pharmadrugliseanceno)
        .filter(Boolean))];
  
      // 4. Fetch all pharmacy and distributor data in parallel
      const [pharmacies, distributors] = await Promise.all([
        Register.find({ dl_code: { $in: uniqueDlCodes } })
          .select('dl_code pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc.dl_code, doc.pharmacy_name])
          )),
        Register2.find({ _id: { $in: uniqueCustomerIds } })
          .select('_id pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
          ))
      ]);
  
      // 5. Combine all data
      const combinedData = defaults.map(doc => ({
        ...doc.toObject(),
        pharmacy_name: pharmacies[doc.pharmadrugliseanceno] || 'Hydra Medicals',
        distributor_name: distributors[doc.customerId.toString()] || 'GMR Distribution',
        invoiceAmount: doc.invoiceAmount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));
  
      res.json({
        Defaults: combinedData,
        invoiceAmountSum,
        noticecount
      });
  
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  });
  const getAdminLikedData = asyncHandler(async (req, res) => {
  try {
    // 1. Fetch all Link documents
    const linkDocs = await Link.find().select({ distId: 1, pharmaId: 1 });

    // 2. Extract unique IDs for bulk queries
    const uniquePharmaIds = [...new Set(linkDocs
      .map(doc => doc.pharmaId)
      .filter(id => isValidObjectId(id)))];
    
    const uniqueDistIds = [...new Set(linkDocs
      .map(doc => doc.distId)
      .filter(id => isValidObjectId(id)))];

    // 3. Fetch all pharmacy and distributor data in parallel with bulk queries
    const [pharmacies, distributors] = await Promise.all([
      Register.find({ _id: { $in: uniquePharmaIds } })
        .select('_id pharmacy_name')
        .then(docs => Object.fromEntries(
          docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
        )),
      Register2.find({ _id: { $in: uniqueDistIds } })
        .select('_id pharmacy_name')
        .then(docs => Object.fromEntries(
          docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
        ))
    ]);

    const combinedData = linkDocs.map(doc => ({
      ...doc.toObject(),
      pharmacy_name: isValidObjectId(doc.pharmaId) 
        ? pharmacies[doc.pharmaId.toString()] || "Hydra Medicals"
        : "Hydra Medicals",
      distributor_name: isValidObjectId(doc.distId)
        ? distributors[doc.distId.toString()] || "GMR Distribution"
        : "GMR Distribution"
    }));

    res.json({ Defaults: combinedData });

  } catch (error) {
    console.error("Error fetching data: ", error);
    res.status(500).json({ message: "Server error occurred" });
  }
});
const getDispytedBydistforAdmin = asyncHandler(async (req, res) => {
    try {
      // 1. Fetch invoice data in one query
      const defaults = await InvoiceRD.find({updatebydistBoolean:true}).select({
        customerId: 1,
        pharmadrugliseanceno: 1,
        invoiceAmount: 1,
        createdAt: 1,
        updatedAt: 1
      });
  
      // 2. Calculate total amount (this can be done while processing the data)
      const invoiceAmountSum = defaults.reduce(
        (sum, invoice) => sum + (Number(invoice.invoiceAmount) || 0),
        0
      );
  
      // 3. Get unique IDs and dl_codes for bulk queries
      const uniqueCustomerIds = [...new Set(defaults
        .map(doc => doc.customerId)
        .filter(Boolean))];
      
      const uniqueDlCodes = [...new Set(defaults
        .map(doc => doc.pharmadrugliseanceno)
        .filter(Boolean))];
  
      // 4. Fetch all pharmacy and distributor data in parallel
      const [pharmacies, distributors] = await Promise.all([
        Register.find({ dl_code: { $in: uniqueDlCodes } })
          .select('dl_code pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc.dl_code, doc.pharmacy_name])
          )),
        Register2.find({ _id: { $in: uniqueCustomerIds } })
          .select('_id pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
          ))
      ]);
  
      // 5. Combine all data
      const combinedData = defaults.map(doc => ({
        ...doc.toObject(),
        pharmacy_name: pharmacies[doc.pharmadrugliseanceno] || 'Hydra Medicals',
        distributor_name: distributors[doc.customerId.toString()] || 'GMR Distribution',
        invoiceAmount: doc.invoiceAmount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));
  
      res.json({
        Defaults: combinedData,
        invoiceAmountSum
      });
  
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  });
  const getDispytesClaimedforAdmin = asyncHandler(async (req, res) => {
    try {
      // 1. Fetch invoice data in one query
      const defaults = await InvoiceRD.find({dispute:true}).select({
        customerId: 1,
        pharmadrugliseanceno: 1,
        invoiceAmount: 1,
        createdAt: 1,
        updatedAt: 1
      });
  
      // 2. Calculate total amount (this can be done while processing the data)
      const invoiceAmountSum = defaults.reduce(
        (sum, invoice) => sum + (Number(invoice.invoiceAmount) || 0),
        0
      );
  
      // 3. Get unique IDs and dl_codes for bulk queries
      const uniqueCustomerIds = [...new Set(defaults
        .map(doc => doc.customerId)
        .filter(Boolean))];
      
      const uniqueDlCodes = [...new Set(defaults
        .map(doc => doc.pharmadrugliseanceno)
        .filter(Boolean))];
  
      // 4. Fetch all pharmacy and distributor data in parallel
      const [pharmacies, distributors] = await Promise.all([
        Register.find({ dl_code: { $in: uniqueDlCodes } })
          .select('dl_code pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc.dl_code, doc.pharmacy_name])
          )),
        Register2.find({ _id: { $in: uniqueCustomerIds } })
          .select('_id pharmacy_name')
          .then(docs => Object.fromEntries(
            docs.map(doc => [doc._id.toString(), doc.pharmacy_name])
          ))
      ]);
  
      // 5. Combine all data
      const combinedData = defaults.map(doc => ({
        ...doc.toObject(),
        pharmacy_name: pharmacies[doc.pharmadrugliseanceno] || 'Hydra Medicals',
        distributor_name: distributors[doc.customerId.toString()] || 'GMR Distribution',
        invoiceAmount: doc.invoiceAmount,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }));
  
      res.json({
        Defaults: combinedData,
        invoiceAmountSum
      });
  
    } catch (error) {
      console.error("Error fetching data: ", error);
      res.status(500).json({ message: "Server error occurred" });
    }
  });
module.exports={getcountofAdminneedDetails,getAdminLikedData,getAdminDefaults,getAdminNotices,getDispytedBydistforAdmin,getDispytesClaimedforAdmin}

