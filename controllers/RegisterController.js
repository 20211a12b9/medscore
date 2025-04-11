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
const checkIfLoggedinbith = asyncHandler(async (req, res) => {
    const { dl_code, password } = req.body;
    
    // Find user in both registers
    const login1 = await Register.findOne({ dl_code });
    const login2 = await Register2.findOne({ dl_code });
    
    // Use a single return to prevent multiple response sends
    if (login1 && login2) {
        return res.status(200).json({ status: true });
    }
    
    // If not found in both registers, send false status
    return res.status(200).json({ status: false });
});


// //@desc Login the user
// //@router /api/user/login
// //@access public



const loginUser = asyncHandler(async (req, res) => {
  const { dl_code, password, type } = req.body;
  const ACCESS_TOKEN_SECRET = 'venky123';
const REFRESH_TOKEN_SECRET = 'medscore24';
  if (!dl_code || !password) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  let user = null;
  let usertype = "";

  if (type === "Pharma") {
    user = await Register.findOne({ dl_code });
    usertype = "Pharma";
  } else if (type === "Dist") {
    user = await Register2.findOne({ dl_code });
    usertype = "Dist";
  } else {
    const pharma = await Register.findOne({ dl_code });
    const dist = await Register2.findOne({ dl_code });
    const admin = await Admin.findOne({ dl_code });

    if (pharma && await bcrypt.compare(password, pharma.password)) {
      user = pharma;
      usertype = "Pharma";
    } else if (dist && await bcrypt.compare(password, dist.password)) {
      user = dist;
      usertype = "Dist";
    } else if (admin && await bcrypt.compare(password, admin.password)) {
      user = admin;
      usertype = "Admin";
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  }

  // Final password check
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Payload for tokens
  const payload = {
    user: {
      id: user._id,
      dl_code: user.dl_code,
      pharmacy_name: user.pharmacy_name || null,
      email: user.email || null,
      phone_number: user.phone_number || null,
    }
  };

  // Generate tokens
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  // Send refresh token as cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,       // Set to true in production (HTTPS)
    sameSite: "Strict", // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send access token and user data in response
  res.status(200).json({
    jwttoken: accessToken,
    usertype,
    id: user._id,
    pharmacy_name: user.pharmacy_name || null,
    dl_code: user.dl_code
  });
});

  
// const loginUser = asyncHandler(async (req, res) => {
//     const { dl_code, password, type } = req.body;
    
//     if (!dl_code || !password) {
//       res.status(400);
//       return res.json({ message: "All fields are mandatory" });
//     }
  
//     // Helper function to generate tokens
//     const generateTokens = async (user, userType) => {
//       const accessToken = jwt.sign(
//         {
//           user: {
//             dl_code: user.dl_code,
//             pharmacy_name: user.pharmacy_name,
//             email: user.email,
//             phone_number: user.phone_number,
//             type: userType
//           },
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "15m" }
//       );
  
//       const refreshToken = jwt.sign(
//         {
//           dl_code: user.dl_code,
//           type: userType
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         { expiresIn: "7d" }
//       );
  
//       return { accessToken, refreshToken };
//     };
  
//     if (type == "Pharma") {
//       const login1 = await Register.findOne({ dl_code });
  
//       if (login1 && (await bcrypt.compare(password, login1.password))) {
//         const { accessToken, refreshToken } = await generateTokens(login1, "Pharma");
  
//         // Set refresh token in HTTP-only cookie
//         res.cookie('refreshToken', refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         });
  
//         return res.status(200).json({
//           jwttoken: accessToken,
//           usertype: "Pharma",
//           id: login1._id,
//           pharmacy_name: login1.pharmacy_name,
//           dl_code: login1.dl_code
//         });
//       }
//     } else if (type == "Dist") {
//       const login2 = await Register2.findOne({ dl_code });
  
//       if (login2 && (await bcrypt.compare(password, login2.password))) {
//         const { accessToken, refreshToken } = await generateTokens(login2, "Dist");
  
//         res.cookie('refreshToken', refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 7 * 24 * 60 * 60 * 1000
//         });
  
//         return res.status(200).json({
//           jwttoken: accessToken,
//           usertype: "Dist",
//           id: login2._id,
//           pharmacy_name: login2.pharmacy_name,
//           dl_code: login2.dl_code
//         });
//       }
//     } else {
//       const login1 = await Register.findOne({ dl_code });
//       const login2 = await Register2.findOne({ dl_code });
//       const login3 = await Admin.findOne({ dl_code });
  
//       if (login1 && (await bcrypt.compare(password, login1.password))) {
//         const { accessToken, refreshToken } = await generateTokens(login1, "Pharma");
  
//         res.cookie('refreshToken', refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 7 * 24 * 60 * 60 * 1000
//         });
  
//         return res.status(200).json({
//           jwttoken: accessToken,
//           usertype: "Pharma",
//           id: login1._id,
//           pharmacy_name: login1.pharmacy_name,
//           dl_code: login1.dl_code
//         });
//       } else if (login2 && (await bcrypt.compare(password, login2.password))) {
//         const { accessToken, refreshToken } = await generateTokens(login2, "Dist");
  
//         res.cookie('refreshToken', refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 7 * 24 * 60 * 60 * 1000
//         });
  
//         return res.status(200).json({
//           jwttoken: accessToken,
//           usertype: "Dist",
//           id: login2._id,
//           pharmacy_name: login2.pharmacy_name,
//           dl_code: login2.dl_code
//         });
//       } else if (login3 && (await bcrypt.compare(password, login3.password))) {
//         const refreshToken = jwt.sign(
//           { dl_code: login3.dl_code, type: "Admin" },
//           process.env.REFRESH_TOKEN_SECRET,
//           { expiresIn: "7d" }
//         );
  
//         const accessToken = jwt.sign(
//           { login3: { dl_code: login3.dl_code } },
//           process.env.ACCESS_TOKEN_SECRET,
//           { expiresIn: "15m" }
//         );
  
//         res.cookie('refreshToken', refreshToken, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === 'production',
//           sameSite: 'strict',
//           maxAge: 7 * 24 * 60 * 60 * 1000
//         });
  
//         return res.status(200).json({
//           jwttoken: accessToken,
//           usertype: "Admin",
//           id: login3._id
//         });
//       } else {
//         res.status(401);
//         return res.json({ message: "Invalid credentials" });
//       }
//     }
//   });
  
//   // Add this new refresh token endpoint
//   const refreshToken = asyncHandler(async (req, res) => {
//     const token = req.cookies.refreshToken;
//     console.log('Refersh token',token)
//     if (!token) {
//       return res.status(401).json({ message: "Refresh Token Missing" });
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
//       let user;
  
//       // Find user based on type
//       switch (decoded.type) {
//         case "Pharma":
//           user = await Register.findOne({ dl_code: decoded.dl_code });
//           break;
//         case "Dist":
//           user = await Register2.findOne({ dl_code: decoded.dl_code });
//           break;
//         case "Admin":
//           user = await Admin.findOne({ dl_code: decoded.dl_code });
//           break;
//         default:
//           return res.status(401).json({ message: "Invalid user type" });
//       }
  
//       if (!user) {
//         return res.status(401).json({ message: "User not found" });
//       }
  
//       // Generate new access token
//       const accessToken = jwt.sign(
//         {
//           user: {
//             dl_code: user.dl_code,
//             pharmacy_name: user.pharmacy_name,
//             email: user.email,
//             phone_number: user.phone_number,
//             type: decoded.type
//           },
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         { expiresIn: "15m" }
//       );
  
//       return res.status(200).json({ jwttoken: accessToken });
  
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }
//   });
//@desc get all distdata by pharam id
//@router /api/user/getdistdatabyphid/:id
//@access private

const getDistData=asyncHandler(async(req,res)=>{
    const pharmaId=req.params.id;
    const links=await Link.find({pharmaId:pharmaId})
    const distributorIds = links.map(link => link.distId);
    const distributors = await Register2.find({ _id: { $in: distributorIds } });

    res.json({ data: distributors });
})

// register for admin
//@router /api/user/createAdmin
//access private

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
//access private
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
//access private
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
    }).limit(10);


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
//access private
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
    }).limit(10);


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
//@access private
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
//@access private
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
    }).skip(skip).limit(limit).lean()
    const totalCount=await Register.countDocuments(query);
    const transformedData = dist.map(doc => ({
      ...doc,
      phone_number: Array.isArray(doc.phone_number) ? doc.phone_number : [doc.phone_number].filter(Boolean)
  }));
    res.json({dist:transformedData,
        pagination:{
           totalCount:totalCount,
           totalPages:Math.ceil(totalCount/limit),
           currentPage:page,
           perpage:limit
        }
    })
})



// @desc add phone number in pharma
// @router /api/user/addphonenumber/:id
// @access private

const addPhonenumber = asyncHandler(async(req, res) => {
  try {
      const { phoneNumber } = req.body;
      const id = req.params.id;
      
      console.log("Received request - Phone:", phoneNumber, "ID:", id);
      
      // Validate inputs
      if (!phoneNumber || !id) {
          console.log("Missing required fields");
          return res.status(400).json({
              success: false,
              message: 'Phone number and ID are required'
          });
      }

      

      // First check if pharmacy exists
      const existingPharma = await Register.findById(id);
      if (!existingPharma) {
          console.log("Pharmacy not found");
          return res.status(404).json({
              success: false,
              message: 'Pharmacy not found'
          });
      }

      // Update the pharmacy
      const pharma = await Register.findByIdAndUpdate(
          id,
          { $push: { phone_number: phoneNumber } },
          { 
              new: true,
              runValidators: true
          }
      );

      console.log("Updated pharmacy:", pharma);

      return res.status(200).json({
          success: true,
          data: pharma
      });

  } catch (error) {
      console.error("Error in addPhonenumber:", error);
      return res.status(500).json({
          success: false,
          message: error.message
      });
  }
});

module.exports={registerController,registerController2,loginUser,getDistData,adminController,getDistDataController,getPharmaCentalData,getDistributorsData,getPharmacyData,getMHCentalData,checkIfLoggedinbith,addPhonenumber}