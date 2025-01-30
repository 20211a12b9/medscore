const Register = require("../models/registerModel");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Register2=require("../models/registerModel2")



//@desc ResetPassword
//@route POST /api/user/resetpassword
//@access public

const ResetPassword = asyncHandler(async (req, res) => {
    try {
        const { dl_code } = req.body;

        // Find user by dl_code
        const user = await Register.findOne({ dl_code }).select({
            pharmacy_name: 1,
            email: 1,
            phone_number: 1,
            dl_code: 1,
            delayDays: 1,
            address: 1,
            expiry_date: 1,
            createdAt: 1
        }).lean();;
        if (user && user.phone_number) {
            user.phone_number = user.phone_number[0][0].toString()
        }
         console.log("user",user)
        if (!user) {
            const user2 = await Register2.findOne({ dl_code }).select({
                pharmacy_name: 1,
                email: 1,
                phone_number: 1,
                dl_code: 1,
                delayDays: 1,
                address: 1,
                expiry_date: 1,
                createdAt: 1
            }).lean();;
            if (user2 && user2.phone_number) {
                user2.phone_number = user2.phone_number[0][0].toString()
            }
            if(!user2)
            {
                return res.status(404).json({
                    success: false,
                    message: 'User not found with this DL number'
                });

            }
            const generatePasswordReset = Register.schema.methods.generatePasswordReset;
const resetToken = generatePasswordReset.call(user2);  
            console.log("Generated resetToken:", resetToken);
            
            // Save the user with the new reset token
            await user2.save();
            console.log("User after saving:", {
                resetToken: user2.resetPasswordToken,
                expires: user2.resetPasswordExpires
            });
    
            // Format phone number and remove any spaces
            const fullPhoneNumber = `91${user2.phone_number}`;
            
            try {
                // Send SMS
                const smsResponse = await fetch(`https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=uewziuRKDUWctgdrHdXm5g&senderid=MEDSCR&channel=2&DCS=0&flashsms=0&number=${fullPhoneNumber}&text=Your Medscore password reset code is:${resetToken}. This code will expire in 1 hour&route=1`);
    
                const smsData = await smsResponse.json();
    
                if (!smsResponse.ok) {
                    throw new Error(smsData.message || 'Failed to send SMS');
                }
               console.log("sms sent successfully")
               res.status(200).json({ 
                    success: true,
                    message: 'Reset code sent via SMS'
                });
    
            } catch (smsError) {
                console.error('SMS Error:', smsError);
                // If SMS fails, reset the token
                user2.resetPasswordToken = null;
                user2.resetPasswordExpires = null;
                await user2.save();
                
                throw new Error('Failed to send reset code via SMS. Please try again.');
            }

        }else{
             // Generate and save reset token
             const generatePasswordReset = Register.schema.methods.generatePasswordReset;
             const resetToken = generatePasswordReset.call(user);  
        console.log("Generated resetToken:", resetToken);
        
        await Register2.findOneAndUpdate(
            { dl_code },
            { resetPasswordToken: resetToken, resetPasswordExpires: Date.now() + 3600000 },  // 1 hour expiration
            { new: true }
        );
        console.log("User after saving:", {
            resetToken: user.resetPasswordToken,
            expires: user.resetPasswordExpires
        });

        // Format phone number and remove any spaces
        const fullPhoneNumber = `91${user.phone_number}`;
        
        try {
            // Send SMS
            const smsResponse = await fetch(`https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=uewziuRKDUWctgdrHdXm5g&senderid=MEDSCR&channel=2&DCS=0&flashsms=0&number=${fullPhoneNumber}&text=Your Medscore password reset code is:${resetToken}. This code will expire in 1 hour&route=1`);

            const smsData = await smsResponse.json();

            if (!smsResponse.ok) {
                throw new Error(smsData.message || 'Failed to send SMS');
            }
           console.log("sms sent successfully")
            res.status(200).json({ 
                success: true,
                message: 'Reset code sent via SMS'
            });

        } catch (smsError) {
            console.error('SMS Error:', smsError);
            // If SMS fails, reset the token
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await Register.findOneAndUpdate(
                { dl_code },
                { resetPasswordToken: resetToken, resetPasswordExpires: Date.now() + 3600000 },  // 1 hour expiration
                { new: true }
            );
            
            throw new Error('Failed to send reset code via SMS. Please try again.');
        }
        }

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error in password reset process'
        });
    }
});
//@desc Confirm reset password
//@route POST /api/user/confirmResetPassword
//@access public
const confirmResetPassword = asyncHandler(async (req, res) => {
    const { resetToken, newPassword } = req.body;

    // Find user by reset token
    const user = await Register.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: Date.now() } // Ensure the token hasn't expired
    });

    if (!user) {
        const user2 = await Register2.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() } // Ensure the token hasn't expired
        });
        if (!user2) {
            res.status(400);
            throw new Error('Invalid or expired reset token');
        }
    
        // Update the user's password
        user2.password = await bcrypt.hash(newPassword, 10); // Hash the new password
        user2.resetPasswordToken = undefined; // Clear the reset token
        user2.resetPasswordExpires = undefined; // Clear the expiry
        await user2.save();
    
        res.status(200).json({ message: 'Password has been reset successfully' });
    }else{
        user.password = await bcrypt.hash(newPassword, 10); // Hash the new password
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiry
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
    }
});

module.exports = { ResetPassword, confirmResetPassword };
