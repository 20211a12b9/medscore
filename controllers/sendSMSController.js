const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const cron = require('node-cron');
// const moment = require('moment');
const Link=require('../models/linkPharma')
const InvoiceRD=require('../models/invoiceReportDefaultModel')
const Register2=require('../models/registerModel2')
const Register=require('../models/registerModel')
const moment = require('moment');
const { ObjectId } = require('mongodb');
dotenv.config();

//@desc sms
//@router api/user/sendSMS/
//access public 
const sendSms = asyncHandler(async (req, res) => {
  try {
    
    const { phone, message } = req.body;
    console.log("got msg",phone)
   
    const response = await fetch(
      `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=uewziuRKDUWctgdrHdXm5g&senderid=MEDSCR&channel=2&DCS=0&flashsms=0&number=${phone}&text=${encodeURIComponent(message)}&route=1`
    );
    
    const data = await response.json();
    res.json({ status: 'success', data });
    console.log(data)
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});
cron.schedule('0 * * * *', async () => {
  try {
    console.log("every hour")
    const now = new Date();
    const threshold = new Date(now - 7 * 24 * 60 * 60 * 1000); // 72 hours ago
    // const threshold = new Date(now - 1 * 60 * 1000); // 1 minute ago

    const reports = await InvoiceRD.find({
      dispute: false,
      notifiedToDistributors: false, // Important to avoid resending
      createdAt: { $lte: threshold }
    });
    console.log("reports",reports)
    for (let report of reports) {
      
      const delayDays = report.delayDays;
      // const pharmacyId = report.customerId;
      const pharmacyId= report.pharmadrugliseanceno
      console.log("pharmacyId",pharmacyId)
      const pharmacy = await Register.findOne({dl_code:pharmacyId}).select("pharmacy_name");;
      const pharmacyName = pharmacy?.pharmacy_name || "Unknown Pharmacy";
      console.log("pharmacyname",pharmacy)
      const links = await Link.find({ pharmaId: pharmacy._id });
      // console.log("links",links)
      const distributorIds = links.map(link => link.distId);

      const distributors = await Register2.find({ _id: { $in: distributorIds } });
      console.log("distributors",distributors)
      for (let dist of distributors) {
        const message = `MedScore Update for ${dist.pharmacy_name} Dear Partner, Please be advised that ${pharmacyName}'s MedScore has been reduced due to a ${delayDays}-day delay in payment. This adjustment reflects their recent credit performance. Click the link for detailed report medscore.in. Thank you for your attention. Best regards, MedScore Team`;

        await fetch(`https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=uewziuRKDUWctgdrHdXm5g&senderid=MEDSCR&channel=2&DCS=0&flashsms=0&number=${dist.phone_number}&text=${encodeURIComponent(message)}&route=1`);
      }

      // Mark as notified
      report.notifiedToDistributors = true;
      await report.save();
    }

    console.log("72hr default check completed.");
  } catch (error) {
    console.error("Error in 72hr cron job:", error);
  }
});



module.exports = { sendSms };
