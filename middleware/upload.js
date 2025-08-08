// middleware/upload.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cloudinary কনফিগারেশন
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Avatar আপলোড সেটআপ
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "photobooth/avatars",
    allowed_formats: ["jpg", "png"],
  },
});

// পোস্ট ইমেজ আপলোড সেটআপ
const postImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "photobooth/posts",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

module.exports = {
  uploadAvatar: multer({ storage: avatarStorage }),
  uploadPostImage: multer({ storage: postImageStorage }),
};
