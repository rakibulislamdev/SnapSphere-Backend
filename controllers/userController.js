const User = require("../models/User");
const Poke = require("../models/Poke");
const Notification = require("../models/Notification");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    // Populate additional fields if needed
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update current user profile
 */
const updateMe = async (req, res) => {
  try {
    const { name, bio, website, gender } = req.body;
    const updateData = {};

    // Validation
    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res
          .status(400)
          .json({ message: "Name must be at least 2 characters long" });
      }
      updateData.name = name.trim();
    }

    if (bio !== undefined) {
      if (bio.length > 150) {
        return res
          .status(400)
          .json({ message: "Bio must be 150 characters or less" });
      }
      updateData.bio = bio;
    }

    if (website !== undefined) updateData.website = website;
    if (gender !== undefined) updateData.gender = gender;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user avatar with Cloudinary
 */
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 500,
      height: 500,
      crop: "fill",
      quality: "auto",
    });

    // Update user avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Poke another user
 */
const pokeUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot poke yourself" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if poke already exists
    const existingPoke = await Poke.findOne({
      fromUserId: req.user._id,
      toUserId: id,
    });

    if (existingPoke) {
      return res.status(400).json({ message: "You already poked this user" });
    }

    // Create poke and notification in transaction
    const session = await Poke.startSession();
    session.startTransaction();

    try {
      const poke = await Poke.create(
        [
          {
            fromUserId: req.user._id,
            toUserId: id,
          },
        ],
        { session }
      );

      await Notification.create(
        [
          {
            type: "poke",
            userId: id,
            fromUserId: req.user._id,
            pokeId: poke[0]._id,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      res.json({ message: "User poked successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Poke user error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "posts",
        select: "caption image likes createdAt",
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getMe,
  updateMe,
  updateAvatar,
  changePassword,
  pokeUser,
  getUserById,
};
