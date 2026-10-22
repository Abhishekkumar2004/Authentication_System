import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import config from '../config/config.js'
import sessionModel from '../models/session.model.js'
import sendEmail from "../services/email.service.js"
import otpModel from "../models/otp.model.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";

// Register user
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Check if username or email already exists
    const isAlreadyRegistered = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyRegistered) {
      return res.status(409).json({
        message: "Username or Email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });


    // send otp
    const otp=generateOtp();
    const html=getOtpHtml(otp);

    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");
    await otpModel.create({
      email,
      user:user._id,
      otpHash
    })

    await sendEmail(email,"OTP verification",`Your OTP code is ${otp}`,html)


    res.status(201).json({
      message: "User registered successfully.",
      user,
      verified:user.verified
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
}

// Login user
async function logIn(req,res){
  try {
    const {email,password}=req.body;

    const user=await userModel.findOne({email})

    if(!user){
      return res.status(401).json({
        message:"Invalid email or password"
      })
    }

    if(!user.verified){
      return res.status(401).json({
        message:"Email not verified."
      })
    }

    const isValidPassword=await bcrypt.compare(password,user.password);

    if(!isValidPassword){
      return res.status(401).json({
        message:"Invalid email or password"
      })
    }

    const refreshToken=jwt.sign({
      id:user._id,
    },config.JWT_SECRET,{
      expiresIn:"7d"
    })

    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session=await sessionModel.create({
      user:user._id,
      refreshTokenHash,
      ip:req.ip,
      userAgent:req.headers["user-agent"]
    })


    const accessToken=jwt.sign({
      id:user._id,
      sessionId:session._id
    },config.JWT_SECRET,{
      expiresIn:"15m"
    })

    res.cookie("refreshToken",refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:"strict",
      maxAge:7*24*60*60*1000 // 7days
    })

    res.status(200).json({
      message:"User Logged in successfully.",
      user,
      accessToken
    })
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }

}

// Get Current user
async function getMe(req, res) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token not found."
      })
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    res.status(200).json({
      message: "User fatched successfully.",
      user
    })

  }
  catch (error) {
    console.error("Data fetching error:", error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }

}

// Referesh token
async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found."
      })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

    // FIX: bcrypt.hash -> sha256 (bcrypt gives a different hash every time)
    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session =await sessionModel.findOne({
      refreshTokenHash,
      revoked:false
    })


    if(!session){
      return res.status(401).json({
        message:"Invalid refresh token."
      })
    }

    // Assign new Access token
    const accessToken = jwt.sign({
      id: decoded.id,
      sessionId: session._id // FIX: same payload as login
    }, config.JWT_SECRET, {
      expiresIn: "15m"
    })


    // Assign new Refresh Token
    const newRefreshToken=jwt.sign({
      id:decoded.id
    },config.JWT_SECRET,{
      expiresIn:"7d"
    })

    // Store the new hash token 
    const newRefreshTokenHash=crypto.createHash("sha256").update(newRefreshToken).digest("hex"); // FIX

    session.refreshTokenHash=newRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken",newRefreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:"strict",
      maxAge:7*24*60*60*1000 // FIX: MaxAge -> maxAge (7days)
    })


    res.status(200).json({
      message:"Access token refreshed successfully.",
      accessToken
    })
  } catch (error) {
    console.error("Refresh token error:", error);

    res.status(401).json({
      message: "Invalid or expired refresh token.",
    });
  }
}

// User logout
async function logout(req,res){
  try {
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(400).json({
        message:"Refresh token is not found"
      })
    }


    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session =await sessionModel.findOne({
      refreshTokenHash,
      revoked:false
    })

    if(!session){
      return res.status(400).json({
        message:"Invalid refresh token."
      })
    }

    session.revoked=true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
      message:"Logged out successfully."
    })
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }

}

// User logout-all
async function logoutAll(req,res){
  try {
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(400).json({
        message:"Refresh token not found."
      })
    }

    const decoded=jwt.verify(refreshToken,config.JWT_SECRET);

    await sessionModel.updateMany({
      user:decoded.id,
      revoked:false
    },{
      revoked:true
    })

    res.clearCookie("refreshToken");

    res.status(200).json({
      message:"Logged out from all devices successfully."
    })
  } catch (error) {
    console.error("Logout all error:", error);

    res.status(401).json({
      message: "Invalid or expired refresh token.",
    });
  }

}

// Verify email
async function verifyEmail(req,res){
  try {
    const {otp,email}=req.body

    const otpHash=crypto.createHash("sha256").update(String(otp)).digest("hex"); // FIX: String()

    const otpDoc=await otpModel.findOne({
      email,
      otpHash
    })

    if(!otpDoc){
      return res.status(400).json({
        message:"Invalid OTP"
      })
    }


    const user=await userModel.findByIdAndUpdate(otpDoc.user,{
      verified:true // FIX: verfied -> verefied
    },{ new:true }); // FIX: return the updated user

    await otpModel.deleteMany({
      user:otpDoc.user
    })


    res.status(200).json({
      message:"Email verefied successfully.",
      user:{
        username:user.username,
        email:user.email,
        verified:user.verified
      }
    })
  } catch (error) {
    console.error("Email verification error:", error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }

}

export default { register,logIn, getMe, refreshToken,logout,logoutAll,verifyEmail };