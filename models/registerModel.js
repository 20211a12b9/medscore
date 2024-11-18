const mongoose=require("mongoose")

const crypto = require("crypto");

// Modify the existing schema to include reset password fields
const registerSchema = mongoose.Schema(
    {
        pharmacy_name: {
            type: String,
            required: [true, "pharmacy_name is mandatory"]
        },
        email: {
            type: String,
           
        },
        phone_number: {
            type: String,
            required: [true, "phone_number is mandatory"]
        },
        dl_code: {
            type: String,
            required: [true, "dl_code is mandatory"],
            unique: true
        },
        address: {
            type: String,
            required: [true, "address is mandatory"]
        },
        password: {
            type: String,
            
        },
        expiry_date: {
            type: String,
        },
        resetPasswordToken: {
            type: String,
        },
        resetPasswordExpires: {
            type: Date,
        }
    },
    {
        timestamps: true
    }
);

// Method to generate password reset token
registerSchema.methods.generatePasswordReset = function() {
 
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    
    
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    
    return resetToken;
};

module.exports=mongoose.model("Register",registerSchema);