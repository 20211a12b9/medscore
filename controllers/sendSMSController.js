const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const twilio = require('twilio');

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

module.exports = { sendSms };
