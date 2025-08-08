const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1. Schema Definition
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  avatar: {
    type: String,
    default: "default_avatar.jpg",
  },
  bio: {
    type: String,
    maxlength: [150, "Bio cannot exceed 150 characters"],
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 2. Middlewares
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 3. Static Methods
userSchema.statics.updateUser = async function (userId, updateData) {
  return this.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  }).select("-password");
};

userSchema.statics.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 4. Model Creation
const User = mongoose.model("User", userSchema);

module.exports = User;
