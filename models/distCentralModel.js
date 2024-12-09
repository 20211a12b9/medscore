const mongoose = require('mongoose')

const distModel = mongoose.Schema({
    FirmName: {
        type: String,
        required: [true]
    },
    Address: {
        type: String,
        
    },
    FRMDate: {
        type: String,
        required: [true]
    },
    ExpDate: {
        type:String,
        required: [true]
    },
    LicenceNumber: {
        type: String,
        required: [true]
    }
})

module.exports = mongoose.model('DistCentaldata', distModel);