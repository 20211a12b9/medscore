const asyncHandler=require("express-async-handler")
const Register=require("../models/registerModel")
const Register2=require("../models/registerModel2")
const Link=require("../models/linkPharma")
const Admin=require("../models/adminModel")
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
//@desc Register a user
//@router /api/register/Pharmacyregister
//access public

const registerController= asyncHandler(async (req,res)=>{
    const { pharmacy_name, email, phone_number, dl_code, address, password,expiry_date } = req.body;
    if(!pharmacy_name || !email || !phone_number || !dl_code || !address)
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const alreadyAvaliable= await Register.findOne({dl_code});
    const alreadyAvaliable2= await Register2.findOne({dl_code});
    if(alreadyAvaliable || alreadyAvaliable2)
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
    const { pharmacy_name, email, phone_number, dl_code, address, password, gstno,expiry_date } = req.body;
    console.log("body",req.body)
    if(!pharmacy_name || !email || !phone_number || !dl_code || !address || !password || !gstno)
    {
        res.status(400)
        return res.json({ message: "All fields are mandatory" });
    }
    const alreadyAvaliable= await Register.findOne({dl_code});
    const alreadyAvaliable2= await Register2.findOne({dl_code});
    if(alreadyAvaliable || alreadyAvaliable2)
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
        expiry_date
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
            },
          });
    }
    else{
        res.status(400).json({message:"Registration Failed"})
    }
    
})

//@desc Login the user
//@router /api/user/login
//access public

const loginUser = asyncHandler(async (req,res)=>{
   const {dl_code,password}=req.body;
   if(!dl_code || !password)
   {
    res.status(400)
        return res.json({ message: "All fields are mandatory" });
   }
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
    res.status(200).json({jwttoken:accesstoken,usertype:"Pharma",id:login1._id,pharmacy_name:login1.pharmacy_name})
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
     res.status(200).json({jwttoken:accesstoken,usertype:"Dist",id:login2._id,pharmacy_name:login2.pharmacy_name})
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
module.exports={registerController,registerController2,loginUser,getDistData,adminController,getDistDataController}