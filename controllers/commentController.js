const Comment = require("../models/Comment");
const Post = require("../models/Post");

module.exports = {
  getCommentsByPost: async (req, res) => {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });
    res.json(comments);
  },

  createComment: async (req, res) => {
    const comment = await Comment.create({
      ...req.body,
      userId: req.user._id,
    });

    // Update post's comment count
    await Post.findByIdAndUpdate(req.body.postId, {
      $inc: { commentsCount: 1 },
    });

    res.status(201).json(comment);
  },

  getComment: async (req, res) => {
    const comment = await Comment.findById(req.params.commentId).populate(
      "userId",
      "name avatar"
    );
    res.json(comment);
  },

  updateComment: async (req, res) => {
    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(comment);
  },

  deleteComment: async (req, res) => {
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      userId: req.user._id,
    });

    // Update post's comment count
    if (comment) {
      await Post.findByIdAndUpdate(comment.postId, {
        $inc: { commentsCount: -1 },
      });
    }

    res.json({ message: "Comment deleted" });
  },
};
