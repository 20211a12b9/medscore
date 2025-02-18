const loginUser = asyncHandler(async (req, res) => {
    const { dl_code, password, type } = req.body;
    
    if (!dl_code || !password) {
      res.status(400);
      return res.json({ message: "All fields are mandatory" });
    }
  
    // Helper function to generate tokens
    const generateTokens = async (userData, userType) => {
      // Access token with reduced lifetime and more claims
      const accessToken = await jwt.sign(
        {
          user: {
            id: userData._id,
            dl_code: userData.dl_code,
            type: userType,
            // Add a unique session identifier
            sessionId: crypto.randomBytes(32).toString('hex')
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "15m",
          algorithm: "HS512", // Using a stronger algorithm
          audience: process.env.JWT_AUDIENCE,
          issuer: process.env.JWT_ISSUER,
          jwtid: crypto.randomBytes(16).toString('hex'), // Unique token ID
          notBefore: 0 // Token is valid immediately
        }
      );
  
      // Refresh token with longer lifetime
      const refreshToken = await jwt.sign(
        {
          userId: userData._id,
          tokenVersion: userData.tokenVersion || 0, // For token revocation
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "7d",
          algorithm: "HS512"
        }
      );
  
      return { accessToken, refreshToken };
    };
  
    try {
      let user;
      let userType;
  
      // Determine user type and find user
      if (type === "Pharma") {
        user = await Register.findOne({ dl_code });
        userType = "Pharma";
      } else if (type === "Dist") {
        user = await Register2.findOne({ dl_code });
        userType = "Dist";
      } else {
        // Try all user types
        user = await Register.findOne({ dl_code }) ||
               await Register2.findOne({ dl_code }) ||
               await Admin.findOne({ dl_code });
        
        if (user instanceof Register) userType = "Pharma";
        else if (user instanceof Register2) userType = "Dist";
        else if (user instanceof Admin) userType = "Admin";
      }
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        return res.json({ message: "Invalid credentials" });
      }
  
      // Generate both access and refresh tokens
      const { accessToken, refreshToken } = await generateTokens(user, userType);
  
      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      // Return access token and user info
      res.status(200).json({
        jwttoken: accessToken,
        usertype: userType,
        id: user._id,
        pharmacy_name: user.pharmacy_name,
        dl_code: user.dl_code
      });
  
    } catch (error) {
      res.status(500);
      return res.json({ message: "Server error during authentication" });
    }
  });