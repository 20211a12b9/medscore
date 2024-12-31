const asyncHandler=require("express-async-handler")
const Register=require("../models/registerModel")//phraam
const Register2=require("../models/registerModel2")//distributors
const Link=require("../models/linkPharma")
const DistCentaldata=require("../models/distCentralModel")
const InvoiceRD=require("../models/invoiceReportDefaultModel")
const Invoice=require("../models/invoiceModel");
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
    const disputescountbyAdminUnseen=await InvoiceRD.countDocuments({dispute:true,seenbyAdmin:false})
    res.json({"distributors":distributors,"pharamacustomers":pharamacustomers,"centalDataofDLH":centalDataofDLH,"linkedUsers":linkedUsers,"defaulters":defaulters,"notices":notices,"updatebydist":updatebydist,"disputesClaimed":disputesClaimed,"disputescountbyAdminUnseen":disputescountbyAdminUnseen})
})
//@desc get linked data
//@router /api/user/getLikedData
//@access public

const getLikedData = asyncHandler(async (req, res) => {
    const Liked = await Link.aggregate([
        {
            $group: {
                _id: "$distId", // Group by distId
                pharmaIds: { $push: "$pharmaId" } // Collect all pharmaIds for each distId
            }
        },
        {
            $project: {
                distId: "$_id", // Rename _id to distId
                pharmaIds: 1,   // Keep pharmaIds field
                _id: 0          // Exclude the original _id
            }
        }
    ]);

    // Fetch all Register2 documents for each distId
    // const allDistIds = await Promise.all(
    //     Liked.map(async (item) => {
    //         const relatedData = await Register2.find({ _id: item.distId });
    //         return { distId: item.distId,relatedData };
    //     })
    // );

    // console.log("--- All DistIds with Related Data:", allDistIds);

    res.json({ Liked });
});



module.exports={getcountofAdminneedDetails,getLikedData}

