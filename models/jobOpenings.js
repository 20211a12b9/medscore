const mongoose=require('mongoose');

const jobOpenings=mongoose.Schema({
    jobTitle:{
        type:String,
        required:true
    },
    jobType:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    departmant:{
        type:String,
        required:true
    },
    Salary:{
        type:String,
        required:true
    },
    about:{
        type:String,
        required:true
    },
    jobDescription:{
        type:String,
        required:true
    },
    mandatorySkills:{
        type:String,
        required:true
    },
    prefferedSkills:{
        type:String,
        required:true
    }
    



}
,{
    timestamps:true
})

module.exports=mongoose.model('JobOpenings',jobOpenings)