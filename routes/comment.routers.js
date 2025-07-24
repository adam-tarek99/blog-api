import express from "express";
import Comment from "../models/comment.model.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

//add comment
//POST /api/comments/
router.post("/", protect, async (req, res) => {
  try {
    const { content, postId } = req.body;

    const comment = await Comment.create({
      content,
      postId,
      createdBy: req.user._id,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//get all comments
//GET /api/comments/:postId
router.get("/:postId", async (req, res) => {
  try {
    const comment = await Comment.find({ postId: req.params.postId })
      .populate("createdBy", "username email")
      .sort({ createAt: -1 });

    return res.status(200).json(comment);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
});

//edit comment
//PUT /api/comments/:commentId
router.put("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this comment" });
    }

    comment.content = req.body.content || content.content;
    const updateComment = await comment.save();

    return res.status(200).json(updateComment);
  } catch (err) {
    return res
      .status(500)
      .json({ message: " server error", error: err.messgae });
  }
});

export default router;
