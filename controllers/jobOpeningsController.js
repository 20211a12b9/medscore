const asyncHandler = require("express-async-handler");

const jobOpenings=require("../models/jobOpenings");


//@desc post job openings
//@router /api/user/postjobOpenings
//access public

const postjobOpenings =asyncHandler(async(req,res)=>{
    const {jobTitle,jobType,experience,location,departmant,Salary,about,jobDescription,mandatorySkills,prefferedSkills}=req.body;

    if(!jobTitle || !jobType || !experience || !location || !departmant || !Salary || !about || !jobDescription || !mandatorySkills || !prefferedSkills)
    {
        res.status(400);
        return res.json({message:'All fileds are required'});

    }
   const job=await jobOpenings.create({
    jobTitle,
    jobType,
    experience,
    location,
    departmant,
    Salary:Salary || 'Disclosed based on interview performance' ,
    about,
    jobDescription,
    mandatorySkills,
    prefferedSkills
    
   })

   res.status(200).json({message:'Job Openings created successfully'});

    

})

//desc get all job openings
//router /api/user/getJobOpenings
//access public
const getJobOpenings =asyncHandler(async(req,res)=>{
    
     const job=await jobOpenings.find();
     res.json({data:job})
})

//desc delete job openigs byId
//router /api/user/deleteJobOpenings
//access public

const deleteJobOpenings =asyncHandler(async(req,res)=>{
    const id=req.params.id;
    const job=await jobOpenings.findByIdAndDelete(id);
    if(!job){
        res.status(404);
        return res.json({message:"job opening not found"})
    }
    res.json({message:'Job Opening deleted Successfully'})
})


 module.exports={postjobOpenings,getJobOpenings,deleteJobOpenings}