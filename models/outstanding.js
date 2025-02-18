const mongoose = require('mongoose');

const outstandingModel = mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "customerId is mandatory"],
        ref: 'Register2'
    },
    uploadData: [
        {
            Description: {
                type: String,
                required: [true, "Description is mandatory"],
                set: (value) => value.toUpperCase()
            },
            Total: {
                type: String,
                required: [true, "Total is mandatory"]
            },
            DLNo1: String,
            DLNo2: String,
            DueDate: Date,
            PhoneNumber: String,
            uploadedAt: {
                type: Date,
                required: [true, "uploadedAt is mandatory"],
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});



module.exports=mongoose.model('oustatnding',outstandingModel);