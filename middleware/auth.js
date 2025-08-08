// middleware/auth.js
const jwt = require("jsonwebtoken");
const Token = require("../models/Token");
const User = require("../models/User"); // User মডেল ইম্পোর্ট করতে ভুলবেন না

const auth = async (req, res, next) => {
  try {
    // ১. হেডার থেকে টোকেন এক্সট্রাক্ট করুন
    const authHeader = req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];

    // ২. ডাটাবেসে টোকেনের অস্তিত্ব চেক করুন
    const tokenDoc = await Token.findOne({ token }).populate("userId");

    if (!tokenDoc) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - not found in database",
      });
    }

    // ৩. টোকেন এক্সপায়ারি চেক করুন
    if (tokenDoc.expiresAt < new Date()) {
      await Token.deleteOne({ _id: tokenDoc._id }); // এক্সপায়ার্ড টোকেন ডিলিট করুন
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // ৪. JWT ভেরিফিকেশন
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ৫. ইউজার ভ্যালিডেশন
    if (tokenDoc.userId._id.toString() !== decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Token-user mismatch",
      });
    }

    // ৬. ইউজার অবজেক্ট সেট করুন (পাসওয়ার্ড বাদ দিয়ে)
    const user = tokenDoc.userId.toObject();
    delete user.password;

    // ৭. রিকোয়েস্টে অ্যাটাচ করুন
    req.token = token;
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);

    // স্পেসিফিক এরর হ্যান্ডলিং
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    // জেনেরিক এরর রেস্পন্স
    res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = auth;
