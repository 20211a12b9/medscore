const mongoose=require("mongoose")

const invoiceSchema=mongoose.Schema({
    
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Register2'  
    },
    pharmadrugliseanceno: {
        type: String,
        required:[true,"pharmadrugliseanceno is mandatory"] 
    },
    invoice:{
        type:String,
        required:[true,"invoice is mandatory"]
    },
    invoiceAmount:{
        type:String,
        required:[true,"invoiceAmount is mandatory"]
    },
    invoiceDate:{
        type:String,
        required:[true,"invoiceDate is mandatory"]
    },
    dueDate:{
        type:String,
        required:[true,"dueDate is mandatory"]
    },
    delayDays:{
        type:String,
        required:[true,"delayDays is mandatory"]
    },
    reportDefault:{
        type:Boolean,
        default: false
    },
    seen:{
        type:Boolean,
        default: false
    },
    seenAt:{
        type: Date
    }
},
{
    timestamps:true
})

module.exports=mongoose.model("Invoice",invoiceSchema)