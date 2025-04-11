const loginUser = asyncHandler(async (req, res) => {
  const { dl_code, password, type } = req.body;

  if (!dl_code || !password) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }
  const ACCESS_TOKEN_SECRET = 'venky123';
  const REFRESH_TOKEN_SECRET = 'medscore24';
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