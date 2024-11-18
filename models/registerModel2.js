const mongoose=require("mongoose")
//this distributor entity
const registerSchema2 =mongoose.Schema(
    {
    pharmacy_name:{
        type:String,
        required:[true,"pharmacy_name is mandatory"]
    },
    email:{
        type:String,
       
    },
    phone_number:{
        type:String,
        required:[true,"phone_number is mandatory"]
    },
    dl_code:{
        type:String,
        required:[true,"dl_code is mandatory"],
        unique: true
    },
    address:{
        type:String,
        required:[true,"address is mandatory"]
    },
    password:{
        type:String,
        required:[true,"password is mandatory"]
    },
    gstno:{
        type:String,
        required:[true,"password is mandatory"]
    },
    expiry_date:{
        type:String,
       
    },
    distributor_types: {
        pharma_ethical: {
            type: Boolean,
            default: false
        },
        generic_general: {
            type: Boolean,
            default: false
        },
        surgicals: {
            type: Boolean,
            default: false
        },
        pcd: {
            type: Boolean,
            default: false
        }
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    }
},
{
    timestamps:true
})
registerSchema2.methods.generatePasswordReset = function() {
 
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    
    
    this.resetPasswordToken = resetToken;
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    
    return resetToken;
};
module.exports=mongoose.model("Register2",registerSchema2);