// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const catchAsync = require("../libs/catchAsync");

// Protect all routes after this middleware
router.use(authController.protect); // সরাসরি middleware পাস করুন

router.get("/me", catchAsync(userController.getMe));
router.patch("/me", userController.updateMe);
router.patch("/me/avatar", userController.updateAvatar);
router.patch("/me/password", userController.changePassword);
router.post("/:id/poke", userController.pokeUser);
router.get("/:id", userController.getUserById);

module.exports = router;
