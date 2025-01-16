const mongoose=require('mongoose');

const mahaData=mongoose.Schema({
    LicenceNumber:{
        type:String
    },
    COLUMNB:{
       type:String
    },
    COLUMNC:{
        type:String
    },
    COLUMND:{
        type:String
    },
    COLUMNE:{
        type:String
    },
    COLUMNF:{
        type:String
    },
    Firm_Name:{
        type:String
    },
    Licences:{
        type:String
    },
    Address:{
        type:String
    },
    OwenerName:{
        type:String
    },
    Category:{
        type:String
    },
    State:{
        type:String
    },
    Taluk:{
        type:String
    },
    ExpiryDate:{
        type:String
    }
})

module.exports=mongoose.model('mahaData',mahaData)