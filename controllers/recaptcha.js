// In your backend (Node.js/Express)
const express = require('express');
const fetch = require('node-fetch');
const asyncHandler=require('express-async-handler')


//@desc recaptcha
//@router /api/user/recaptcha
//@access public
const recaptcha=asyncHandler(async(req,res)=>{
    const { captchaToken } = req.body;
    const secretKey = '6LfgT9IqAAAAAPP-Xe82U4-2Acms0jFX9i3rBRjD'; // Replace with your secret key
  
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${captchaToken}`,
      });
  
      const data = await response.json();
  
      if (data.success) {
        res.json({ success: true });
      } else {
        res.json({ 
          success: false, 
          error: 'CAPTCHA verification failed'
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Server error during CAPTCHA verification'
      });
    }
})

module.exports=recaptcha;