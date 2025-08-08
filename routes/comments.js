const express = require("express");
const commentController = require("../controllers/commentController");
const auth = require("../middleware/auth");
const router = express.Router();
const catchAsync = require("../libs/catchAsync");

// Get all comments for a post
router.get("/post/:postId", catchAsync(commentController.getCommentsByPost));

// Create a new comment
router.post("/", auth, catchAsync(commentController.createComment));

// Get a single comment
router.get("/:commentId", catchAsync(commentController.getComment));

// Update a comment
router.patch("/:commentId", auth, catchAsync(commentController.updateComment));

// Delete a comment
router.delete("/:commentId", auth, catchAsync(commentController.deleteComment));

module.exports = router;
