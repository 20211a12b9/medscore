const asyncHandler=require("express-async-handler")
const Register=require("../models/registerModel")//phraam
const Register2=require("../models/registerModel2")//distributors
const Link=require("../models/linkPharma")
const Admin=require("../models/adminModel")
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const DistCentaldata=require("../models/distCentralModel")
const MahaData=require('../models/maharastraCentalData')
const { query } = require("express")
//@desc Register a user
//@router /api/register/Pharmacyregister
//access public

const registerController= asyncHandler(async (req,res)=>{
    const { pharmacy_name, email, phone_number, dl_code, address, password,expiry_date } = req.body;
    if(!pharmacy_name || !phone_number || !dl_code || !address)
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const alreadyAvaliable= await Register.findOne({dl_code});
   
    if(alreadyAvaliable )
    {
        res.status(400)
        return res.json({ message: "user Alredy exist" });
    }

    const bcryptedPassword= await bcrypt.hash(password,10);
    const register=await Register.create({
        pharmacy_name,
        email,
        phone_number,
        dl_code,
        address,
        expiry_date,
        password:bcryptedPassword
    })
    console.log("register",register)
    register.generatePasswordReset();
        await register.save();
    if(register)
    {
        res.status(201).json({
            message: "Registration successful",
            user: {
              _id: register.id,
              pharmacy_name: register.pharmacy_name,
              email: register.email,
              phone_number: register.phone_number,
              dl_code: register.dl_code,
              address: register.address,
              expiry_date: register.expiry_date,
              resetPasswordToken: register.resetPasswordToken,
              resetPasswordExpires: register.resetPasswordExpires,
            },
          });
    }
    else{
        res.status(400).json({message:"Registration Failed"})
    }
    
})

//@desc Register2 a user
//@router /api/user/Distributorregister
//access public

const registerController2= asyncHandler(async (req,res)=>{
    const { pharmacy_name, email, phone_number, dl_code, address, password, gstno,expiry_date,distributor_types } = req.body;
    console.log("body",req.body)
    if(!pharmacy_name || !phone_number || !dl_code || !address || !password )
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }

    const alreadyAvaliable2= await Register2.findOne({dl_code});
    if(alreadyAvaliable2)
    {
        res.status(400)
        return res.json({ message: "user Alredy exist" });
    }

    const bcryptedPassword= await bcrypt.hash(password,10);
    const register=await Register2.create({
        pharmacy_name,
        email,
        phone_number,
        dl_code,
        address,
        password:bcryptedPassword,
        gstno,
        expiry_date,
        distributor_types
    })
    console.log("regiter2",register)
    register.generatePasswordReset();
        await register.save();
    if(register)
    {
        res.status(201).json({
            message: "Registration successful",
            user: {
              _id: register.id,
              pharmacy_name: register.pharmacy_name,
              email: register.email,
              phone_number: register.phone_number,
              dl_code: register.dl_code,
              address: register.address,
              gstno: register.gstno,
              expiry_date: register.expiry_date,
              distributor_types:distributor_types
            },
          });
    }
    else{
        res.status(400).json({message:"Registration Failed"})
    }
    
})

//@desc check if user id registred in both 
//@router /api/user/checkIfLoginedinboth
//@access public
const checkIfLoggedinbith=asyncHandler(async(req,res)=>{
    const {dl_code,password}=req.body;
    const login1=await Register.findOne({dl_code});
   const login2=await Register2.findOne({dl_code});
   if(login1 && login2)
   {
     res.status(200).json({status:true})
   }
   res.status(200).json({status:false})
})


//@desc Login the user
//@router /api/user/login
//@access public

const loginUser = asyncHandler(async (req,res)=>{
   const {dl_code,password,type}=req.body;
   if(!dl_code || !password)
   {
    res.status(400)
        return res.json({ message: "All fields are mandatory" });
   }
   if(type=="Pharma")
   {
    const login1=await Register.findOne({dl_code});
    
    if(login1 && (await bcrypt.compare(password,login1.password)))
    {
 
      const accesstoken=await jwt.sign({
         login1:{
             dl_code:login1.dl_code,
             pharmacy_name:login1.pharmacy_name,
             email:login1.email,
             phone_number:login1.phone_number,
         },
 
      },process.env.ACCESS_TOKEN_SECRET,
      {expiresIn:"15min"}
     );
     res.status(200).json({jwttoken:accesstoken,usertype:"Pharma",id:login1._id,pharmacy_name:login1.pharmacy_name,dl_code:login1.dl_code})
    }
   }
   else if(type=="Dist")
   {
    
    const login2=await Register2.findOne({dl_code});
   
    if(login2 && (await bcrypt.compare(password,login2.password)))
        {
     
          const accesstoken=await jwt.sign({
             login2:{
                 dl_code:login2.dl_code,
                 pharmacy_name:login2.pharmacy_name,
                 email:login2.email,
                 phone_number:login2.phone_number,
             },
     
          },process.env.ACCESS_TOKEN_SECRET,
          {expiresIn:"15min"}
         );
         res.status(200).json({jwttoken:accesstoken,usertype:"Dist",id:login2._id,pharmacy_name:login2.pharmacy_name,dl_code:login2.dl_code})
        }
   }
   else{
   const login1=await Register.findOne({dl_code});
   const login2=await Register2.findOne({dl_code});
   const login3=await Admin.findOne({dl_code})
   if(login1 && (await bcrypt.compare(password,login1.password)))
   {

     const accesstoken=await jwt.sign({
        login1:{
            dl_code:login1.dl_code,
            pharmacy_name:login1.pharmacy_name,
            email:login1.email,
            phone_number:login1.phone_number,
        },

     },process.env.ACCESS_TOKEN_SECRET,
     {expiresIn:"15min"}
    );
    res.status(200).json({jwttoken:accesstoken,usertype:"Pharma",id:login1._id,pharmacy_name:login1.pharmacy_name,dl_code:login1.dl_code})
   }
  
   else if(login2 && (await bcrypt.compare(password,login2.password)))
    {
 
      const accesstoken=await jwt.sign({
         login2:{
             dl_code:login2.dl_code,
             pharmacy_name:login2.pharmacy_name,
             email:login2.email,
             phone_number:login2.phone_number,
         },
 
      },process.env.ACCESS_TOKEN_SECRET,
      {expiresIn:"15min"}
     );
     res.status(200).json({jwttoken:accesstoken,usertype:"Dist",id:login2._id,pharmacy_name:login2.pharmacy_name,dl_code:login2.dl_code})
    }
    else if(login3 && (await bcrypt.compare(password,login3.password)))
        {
     
          const accesstoken=await jwt.sign({
             login3:{
                 dl_code:login3.dl_code
                 
             },
     
          },process.env.ACCESS_TOKEN_SECRET,
          {expiresIn:"15min"}
         );
         res.status(200).json({jwttoken:accesstoken,usertype:"Admin",id:login3._id})
        } 
        else {
            res.status(401);
            return res.json({ message: "Invalid credentials" });
          }
        }
        
       
})
//@desc get all distdata by pharam id
//@router /api/user/getdistdatabyphid/:id
//@access public

const getDistData=asyncHandler(async(req,res)=>{
    const pharmaId=req.params.id;
    const links=await Link.find({pharmaId:pharmaId})
    const distributorIds = links.map(link => link.distId);
    const distributors = await Register2.find({ _id: { $in: distributorIds } });

    res.json({ data: distributors });
})

// register for admin
//@router /api/user/createAdmin
//access public

const adminController=asyncHandler(async(req,res)=>{
    const {dl_code,password}=req.body;
    if(!dl_code || !password){
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const adminalready=await Admin.findOne({dl_code});
    if(adminalready)
    {
        res.status(400)
        return res.json({ message: "user Alredy exist" });
    }
    const bcryptedPassword=await bcrypt.hash(password,10);
    const admin=await Admin.create({
        dl_code,
        password:bcryptedPassword
    })
    res.status(200).json({admin})
})

//desc get details about distributor from Registor2 model by _id
// /api/user/getDistData/:id
//access public
const getDistDataController = asyncHandler(async(req, res) => {
    const customerId = req.params.id;  // Changed from destructuring
    if(!customerId) {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const dist = await Register2.find({_id: customerId})
        .select({
            pharmacy_name: 1,
            phone_number: 1,
            email: 1,
            dl_code: 1,
            address: 1,
            createdAt: 1,
            expiry_date: 1
        });
    
    res.json({ success: true, data: dist[0] }); 
});
//@desc get Pharma data
//@router /api/user/getPharmaCentalData/
//access public
const getPharmaCentalData = asyncHandler(async (req, res) => {
    const licenseNo = req.query.licenseNo;
    // console.log("licenseNo", licenseNo)

    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    let pharmadata;
    
    // Use $regex with case-insensitive partial matching for both pharmacy_name and dl_code
    pharmadata = await DistCentaldata.find({ 
        $or: [
            { FirmName: { $regex: licenseNo, $options: "i" } },
            { LicenceNumber: { $regex: licenseNo, $options: "i" } }
        ]
    }).select({
        FirmName: 1,
        LicenceNumber: 1,
        Address: 1,
        ExpDate: 1
    }).limit(5);


    if (!pharmadata || pharmadata.length === 0) {
        res.status(404);
        throw new Error(`No data found for this license number. You can add customer details from the home screen by clicking '/Addcustomer'.`);
    }

    res.status(200).json({
        success: true,
        count: pharmadata.length,
        data: pharmadata
    });
});
//@desc get Pharma data
//@router /api/user/getMHCentalData/
//access public
const getMHCentalData = asyncHandler(async (req, res) => {
    const licenseNo = req.query.licenseNo;
    // console.log("licenseNo", licenseNo)

    // Validate license number
    if (!licenseNo) {
        res.status(400);
        throw new Error('Pharmacy drug license number is required');
    }

    let pharmadata;
    
    // Use $regex with case-insensitive partial matching for both pharmacy_name and dl_code
    pharmadata = await MahaData.find({ 
        $or: [
            { Firm_Name: { $regex: licenseNo, $options: "i" } },
            { LicenceNumber: { $regex: licenseNo, $options: "i" } },
            { COLUMNB: { $regex: licenseNo, $options: "i" } },
            { COLUMNC: { $regex: licenseNo, $options: "i" } },
            { COLUMND: { $regex: licenseNo, $options: "i" } },
            { COLUMNE: { $regex: licenseNo, $options: "i" } },
            { COLUMNF: { $regex: licenseNo, $options: "i" } }
           
        ]  
    }).select({
        Firm_Name: 1,
        LicenceNumber: 1,
        Address: 1,
        ExpiryDate: 1
    }).limit(5);


    if (!pharmadata || pharmadata.length === 0) {
        res.status(404);
        throw new Error(`No data found for this license number. You can add customer details from the home screen by clicking '/Addcustomer'.`);
    }

    res.status(200).json({
        success: true,
        count: pharmadata.length,
        data: pharmadata
    });
});
//@desc get all dist data
//@router /api/user/getDistributorsData
//@access public
const getDistributorsData = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const address = req.query.address || '';
    const search = req.query.search || '';
    const filters = JSON.parse(req.query.filters || '[]');
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const skip = (page - 1) * limit;
  
    const queryFilters = [];
    
    if (search) {
      queryFilters.push({
        $or: [
          { pharmacy_name: { $regex: search, $options: "i" } },
          { dl_code: { $regex: search, $options: "i" } }
        ]
      });
    }
  
    if (address) {
      queryFilters.push({ address: { $regex: address, $options: "i" } });
    }
  
    if (filters.length > 0) {
      queryFilters.push({
        $or: filters.map(filter => ({
          [`distributor_types.${filter}`]: true
        }))
      });
    }
    if (endDate) {
        queryFilters.push({
          createdAt: {
            $gte: endDate.toISOString(), // Greater than or equal to the end date
            $lte: new Date().toISOString() // Less than or equal to the current date
          }
        });
      }
    const query = queryFilters.length > 0 ? { $or: queryFilters } : {};
  
    const dist = await Register2.find(query)
      .select({
        pharmacy_name: 1,
        dl_code: 1,
        phone_number: 1,
        address: 1,
        expiry_date: 1,
        distributor_types: 1,
      })
      .skip(skip)
      .limit(limit);
  
    const totalCount = await Register2.countDocuments(query);
    
    res.json({
      dist,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        perPage: limit,
      },
    });
  });
  
//@desc get all pharma data
//@router /api/user/getPharmacyData
//@access public
const getPharmacyData=asyncHandler(async(req,res)=>{
    const page=parseInt(req.query.page)||1
    const limit=parseInt(req.query.limit)||100
    const licenseNo=req.query.licenseNo||'';
    const address=req.query.address||'';
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const filter=[];
    if(licenseNo)
    {
        filter.push({dl_code:{$regex:licenseNo ,$options:'i'}})
        filter.push({pharmacy_name:{$regex:licenseNo,$options:'i'}})
    }
    if(address)
    {
        filter.push({address:{$regex:address,$options:'i'}})
    }
    if (endDate) {
        filter.push({
          createdAt: {
            $gte: endDate.toISOString(), // Greater than or equal to the end date
            $lte: new Date().toISOString() // Less than or equal to the current date
          }
        });
      }
    const query=filter.length>0?{$or:filter}:{};
    const skip=(page-1)*limit
    const dist=await Register.find(query).select({
        pharmacy_name:1,
        dl_code:1,
        phone_number:1,
        address:1,
        expiry_date:1,
        createdAt:1
    }).skip(skip).limit(limit)
    const totalCount=await Register.countDocuments(query);
    res.json({dist,
        pagination:{
           totalCount:totalCount,
           totalPages:Math.ceil(totalCount/limit),
           currentPage:page,
           perpage:limit
        }
    })
})
module.exports={registerController,registerController2,loginUser,getDistData,adminController,getDistDataController,getPharmaCentalData,getDistributorsData,getPharmacyData,getMHCentalData,checkIfLoggedinbith}