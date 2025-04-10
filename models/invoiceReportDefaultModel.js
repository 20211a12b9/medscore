const mongoose=require("mongoose")
const { text } = require("pdfkit")

const invoiceReportDefaultSchema=mongoose.Schema({
    
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
        default: true
    },
    reason:{
        type:String,
        required:[true,"reason is mandatory"]
    },
    updatebydist:{
        type: Date,
    },
    updatebydistBoolean:{
        type:Boolean,
        default: false
    },
    dispute:{
        type:Boolean,
        default: false
    },
    reasonforDispute:{
        type:String
    },
    accept:{
        type:Boolean,
        default:false
    },
    reject:{
        type:Boolean,
        default:false
    },
    seen:{
        type:Boolean,
        default: false
    },
    seenAt:{
        type: Date
    },
    seenbyAdmin:{
        type:Boolean,
        default: false
    },
    notifiedToDistributors:{
        type:Boolean,
        default:false
    }

},
{
    timestamps:true
})

module.exports=mongoose.model("InvoiceRD",invoiceReportDefaultSchema)