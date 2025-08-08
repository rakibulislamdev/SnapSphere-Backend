const express = require("express");
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");
const { uploadPostImage } = require("../middleware/upload");
const catchAsync = require("../libs/catchAsync");
const router = express.Router();
// Get user's posts (current user)
router.get("/user/me", auth, catchAsync(postController.getUserPosts));

// Get specific user's posts
router.get("/user/:userId", catchAsync(postController.getUserPosts));

// Get all posts
router.get("/", catchAsync(postController.getPosts));

// Create a new post
router.post(
  "/",
  auth,
  uploadPostImage.single("image"),
  catchAsync(postController.createPost)
);

// Like/unlike a post
router.post("/:id/like", auth, catchAsync(postController.toggleLike));

// Update a post
router.patch(
  "/:id",
  auth,
  uploadPostImage.single("image"),
  catchAsync(postController.updatePost)
);

// Delete a post
router.delete("/:id", auth, catchAsync(postController.deletePost));

// Get a single post (সবশেষে রাখো)
router.get("/:id", catchAsync(postController.getPostById));

module.exports = router;
